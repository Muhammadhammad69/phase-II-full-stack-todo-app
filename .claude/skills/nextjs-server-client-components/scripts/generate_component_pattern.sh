#!/bin/bash

# Script to generate Next.js Server and Client Component patterns
# Usage: ./generate_component_pattern.sh <pattern-type> <component-name> [options]

PATTERN_TYPE="$1"
COMPONENT_NAME="$2"
OUTPUT_DIR="${3:-.}"

if [ -z "$PATTERN_TYPE" ] || [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: $0 <pattern-type> <component-name> [output-dir]"
  echo "Pattern types: server-component, client-component, server-action, mixed-page"
  exit 1
fi

echo "Generating Next.js component pattern for: $PATTERN_TYPE"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

case "$PATTERN_TYPE" in
  "server-component")
    COMPONENT_FILE="$OUTPUT_DIR/${COMPONENT_NAME}.js"
    cat > "$COMPONENT_FILE" << EOF
// $COMPONENT_FILE
import { db } from '@/lib/db'

export default async function ${COMPONENT_NAME^}({ params }) {
  // Server Component - can use async/await
  // Can access databases and secrets directly
  const data = await db.${COMPONENT_NAME}s.findMany({
    where: { active: true }
  })

  return (
    <div className="${COMPONENT_NAME}-container">
      <h2>${COMPONENT_NAME^} List</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
EOF
    echo "Created Server Component at $COMPONENT_FILE"
    ;;

  "client-component")
    COMPONENT_FILE="$OUTPUT_DIR/${COMPONENT_NAME}.js"
    cat > "$COMPONENT_FILE" << EOF
// $COMPONENT_FILE
'use client'

import { useState, useEffect } from 'react'

export default function ${COMPONENT_NAME^}({ initialData = [] }) {
  // Client Component - marked with 'use client'
  // Can use React hooks, event handlers, browser APIs
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    // Client-side data fetching
    try {
      const response = await fetch('/api/${COMPONENT_NAME}')
      const newData = await response.json()
      setData(newData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="${COMPONENT_NAME}-container">
      <h2>${COMPONENT_NAME^} Component</h2>
      <button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Data'}
      </button>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
EOF
    echo "Created Client Component at $COMPONENT_FILE"
    ;;

  "server-action")
    ACTION_FILE="$OUTPUT_DIR/actions/${COMPONENT_NAME}-actions.js"
    mkdir -p "$(dirname "$ACTION_FILE")"
    cat > "$ACTION_FILE" << EOF
// $ACTION_FILE
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function ${COMPONENT_NAME^}Action(formData) {
  // Server Action - runs on the server
  // Can access databases and perform mutations
  const name = formData.get('name')
  const description = formData.get('description')

  // Validate input
  if (!name || name.trim().length === 0) {
    return { error: 'Name is required' }
  }

  try {
    // Perform database operation
    const newItem = await db.${COMPONENT_NAME}s.create({
      data: {
        name: name.trim(),
        description: description?.trim() || ''
      }
    })

    // Revalidate relevant paths to update cached data
    revalidatePath('/${COMPONENT_NAME}s')
    revalidatePath('/dashboard')

    return { success: true, item: newItem }
  } catch (error) {
    console.error('Error creating ${COMPONENT_NAME}:', error)
    return { error: 'Failed to create ${COMPONENT_NAME}' }
  }
}

export async function update${COMPONENT_NAME^}(id, formData) {
  const name = formData.get('name')
  const description = formData.get('description')

  if (!name || name.trim().length === 0) {
    return { error: 'Name is required' }
  }

  try {
    const updatedItem = await db.${COMPONENT_NAME}s.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || ''
      }
    })

    revalidatePath('/${COMPONENT_NAME}s')
    revalidatePath(\`/${COMPONENT_NAME}s/\${id}\`)

    return { success: true, item: updatedItem }
  } catch (error) {
    console.error('Error updating ${COMPONENT_NAME}:', error)
    return { error: 'Failed to update ${COMPONENT_NAME}' }
  }
}

export async function delete${COMPONENT_NAME^}(id) {
  try {
    await db.${COMPONENT_NAME}s.delete({
      where: { id }
    })

    revalidatePath('/${COMPONENT_NAME}s')
    revalidatePath(\`/${COMPONENT_NAME}s/\${id}\`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting ${COMPONENT_NAME}:', error)
    return { error: 'Failed to delete ${COMPONENT_NAME}' }
  }
}
EOF
    echo "Created Server Actions at $ACTION_FILE"
    ;;

  "mixed-page")
    PAGE_DIR="$OUTPUT_DIR/${COMPONENT_NAME}"
    mkdir -p "$PAGE_DIR"

    # Create the page (Server Component)
    PAGE_FILE="$PAGE_DIR/page.js"
    cat > "$PAGE_DIR/page.js" << EOF
// $PAGE_FILE - Server Component (default)
import ${COMPONENT_NAME^}Client from './client-component'
import { db } from '@/lib/db'

export default async function ${COMPONENT_NAME^}Page() {
  // Server Component - fetch data server-side
  const items = await db.${COMPONENT_NAME}s.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="${COMPONENT_NAME}-page">
      <h1>${COMPONENT_NAME^} Management</h1>
      <${COMPONENT_NAME^}Client initialItems={items} />
    </div>
  )
}
EOF

    # Create the client component
    CLIENT_FILE="$PAGE_DIR/client-component.js"
    cat > "$PAGE_DIR/client-component.js" << EOF
// $PAGE_DIR/client-component.js - Client Component
'use client'

import { useState } from 'react'
import { ${COMPONENT_NAME^}Action } from './actions'

export default function ${COMPONENT_NAME^}Client({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('name', newItemName)
    formData.append('description', newItemDesc)

    try {
      const result = await ${COMPONENT_NAME^}Action(formData)

      if (result.success) {
        // Update local state optimistically
        setItems([result.item, ...items])
        setNewItemName('')
        setNewItemDesc('')
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="${COMPONENT_NAME}-client">
      <form onSubmit={handleSubmit} className="add-${COMPONENT_NAME}-form">
        <div>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter ${COMPONENT_NAME} name"
            required
          />
        </div>
        <div>
          <textarea
            value={newItemDesc}
            onChange={(e) => setNewItemDesc(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add ${COMPONENT_NAME^}'}
        </button>
      </form>

      <div className="items-list">
        <h2>Existing ${COMPONENT_NAME^}s</h2>
        {items.length === 0 ? (
          <p>No ${COMPONENT_NAME}s found</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item.id} className="item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
EOF

    # Create the actions file
    ACTIONS_FILE="$PAGE_DIR/actions.js"
    cat > "$PAGE_DIR/actions.js" << EOF
// $PAGE_DIR/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function ${COMPONENT_NAME^}Action(formData) {
  const name = formData.get('name')
  const description = formData.get('description')

  if (!name || name.trim().length === 0) {
    return { error: 'Name is required' }
  }

  try {
    const newItem = await db.${COMPONENT_NAME}s.create({
      data: {
        name: name.trim(),
        description: description?.trim() || ''
      }
    })

    revalidatePath('/${COMPONENT_NAME}s')
    revalidatePath('/dashboard')

    return { success: true, item: newItem }
  } catch (error) {
    console.error('Error creating ${COMPONENT_NAME}:', error)
    return { error: 'Failed to create ${COMPONENT_NAME}' }
  }
}
EOF

    echo "Created Mixed Page pattern at $PAGE_DIR/"
    echo "  - Server Component: $PAGE_FILE"
    echo "  - Client Component: $CLIENT_FILE"
    echo "  - Server Actions: $ACTIONS_FILE"
    ;;

  *)
    echo "Unknown pattern type: $PATTERN_TYPE"
    echo "Available types: server-component, client-component, server-action, mixed-page"
    exit 1
    ;;
esac

echo "Component pattern generated successfully!"