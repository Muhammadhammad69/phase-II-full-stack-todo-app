#!/bin/bash

# Script to generate Next.js data fetching and server action patterns
# Usage: ./generate_data_fetching_pattern.sh <pattern-type> <name> [options]

PATTERN_TYPE="$1"
NAME="$2"
OUTPUT_DIR="${3:-.}"

if [ -z "$PATTERN_TYPE" ] || [ -z "$NAME" ]; then
  echo "Usage: $0 <pattern-type> <name> [output-dir]"
  echo "Pattern types: server-component, server-action, api-route, client-component"
  exit 1
fi

echo "Generating Next.js data fetching pattern for: $PATTERN_TYPE"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

case "$PATTERN_TYPE" in
  "server-component")
    COMPONENT_FILE="$OUTPUT_DIR/${NAME}_page.js"
    cat > "$COMPONENT_FILE" << EOF
// $COMPONENT_FILE
export default async function ${NAME^}Page() {
  // Server Component - can use async/await
  // Fetch data directly from external API or database
  const res = await fetch('https://api.example.com/${NAME}s', {
    next: { revalidate: 3600 } // Revalidate every hour
  })
  const ${NAME}s = await res.json()

  return (
    <div className="${NAME}-page">
      <h1>${NAME^}s</h1>
      <div className="${NAME}s-grid">
        {${NAME}s.map(${NAME} => (
          <div key={${NAME}.id} className="${NAME}-card">
            <h3>{${NAME}.name}</h3>
            <p>{${NAME}.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
EOF
    echo "Created Server Component at $COMPONENT_FILE"
    ;;

  "server-action")
    ACTION_FILE="$OUTPUT_DIR/actions/${NAME}_actions.js"
    mkdir -p "$(dirname "$ACTION_FILE")"
    cat > "$ACTION_FILE" << EOF
// $ACTION_FILE
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function create${NAME^}(formData) {
  const name = formData.get('${NAME}Name')
  const description = formData.get('${NAME}Description')

  // Validate input
  if (!name || name.trim().length === 0) {
    return { error: '${NAME^} name is required' }
  }

  try {
    // Create ${NAME} in database
    const new${NAME^} = await db.${NAME}s.create({
      data: {
        name: name.trim(),
        description: description?.trim() || ''
      }
    })

    // Revalidate relevant paths to update cached data
    revalidatePath('/${NAME}s')
    revalidatePath('/dashboard')

    return { success: true, ${NAME}: new${NAME^} }
  } catch (error) {
    console.error('Error creating ${NAME}:', error)
    return { error: 'Failed to create ${NAME}' }
  }
}

export async function update${NAME^}(id, formData) {
  const name = formData.get('${NAME}Name')
  const description = formData.get('${NAME}Description')

  if (!name || name.trim().length === 0) {
    return { error: '${NAME^} name is required' }
  }

  try {
    const updated${NAME^} = await db.${NAME}s.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || ''
      }
    })

    revalidatePath('/${NAME}s')
    revalidatePath(\`/${NAME}s/\${id}\`)

    return { success: true, ${NAME}: updated${NAME^} }
  } catch (error) {
    console.error('Error updating ${NAME}:', error)
    return { error: 'Failed to update ${NAME}' }
  }
}

export async function delete${NAME^}(id) {
  try {
    await db.${NAME}s.delete({
      where: { id }
    })

    revalidatePath('/${NAME}s')
    revalidatePath(\`/${NAME}s/\${id}\`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting ${NAME}:', error)
    return { error: 'Failed to delete ${NAME}' }
  }
}
EOF
    echo "Created Server Actions at $ACTION_FILE"
    ;;

  "api-route")
    ROUTE_DIR="$OUTPUT_DIR/api/${NAME}s"
    mkdir -p "$ROUTE_DIR"

    # Create main API route
    MAIN_ROUTE="$ROUTE_DIR/route.js"
    cat > "$MAIN_ROUTE" << EOF
// $MAIN_ROUTE
import { db } from '@/lib/db'

export async function GET(request) {
  try {
    const ${NAME}s = await db.${NAME}s.findMany()
    return Response.json(${NAME}s)
  } catch (error) {
    console.error('Error fetching ${NAME}s:', error)
    return Response.json({ error: 'Failed to fetch ${NAME}s' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const new${NAME^} = await db.${NAME}s.create({
      data: {
        name: data.name,
        description: data.description
      }
    })

    return Response.json(new${NAME^}, { status: 201 })
  } catch (error) {
    console.error('Error creating ${NAME}:', error)
    return Response.json({ error: 'Failed to create ${NAME}' }, { status: 500 })
  }
}
EOF

    # Create dynamic API route
    DYNAMIC_ROUTE="$ROUTE_DIR/[id]/route.js"
    mkdir -p "$(dirname "$DYNAMIC_ROUTE")"
    cat > "$DYNAMIC_ROUTE" << EOF
// $ROUTE_DIR/[id]/route.js
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const ${NAME} = await db.${NAME}s.findUnique({
      where: { id: params.id }
    })

    if (!${NAME}) {
      return Response.json({ error: '${NAME^} not found' }, { status: 404 })
    }

    return Response.json(${NAME})
  } catch (error) {
    console.error('Error fetching ${NAME}:', error)
    return Response.json({ error: 'Failed to fetch ${NAME}' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const updated${NAME^} = await db.${NAME}s.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description
      }
    })

    return Response.json(updated${NAME^})
  } catch (error) {
    console.error('Error updating ${NAME}:', error)
    return Response.json({ error: 'Failed to update ${NAME}' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await db.${NAME}s.delete({
      where: { id: params.id }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting ${NAME}:', error)
    return Response.json({ error: 'Failed to delete ${NAME}' }, { status: 500 })
  }
}
EOF

    echo "Created API Routes at $ROUTE_DIR/"
    echo "  - GET/POST: $MAIN_ROUTE"
    echo "  - GET/PUT/DELETE: $DYNAMIC_ROUTE"
    ;;

  "client-component")
    CLIENT_FILE="$OUTPUT_DIR/${NAME}_form.js"
    cat > "$CLIENT_FILE" << EOF
// $CLIENT_FILE
'use client'

import { useState } from 'react'
import { create${NAME^} } from '@/app/actions/${NAME}_actions'

export default function ${NAME^}Form() {
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (formData) => {
    setError('')
    setSuccess(false)

    const result = await create${NAME^}(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setFormData({}) // Reset form
    }
  }

  return (
    <form action={handleSubmit} className="${NAME}-form">
      <h2>Create ${NAME^}</h2>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>
          ${NAME^} created successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="${NAME}Name">Name:</label>
        <input
          type="text"
          id="${NAME}Name"
          name="${NAME}Name"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="${NAME}Description">Description:</label>
        <textarea
          id="${NAME}Description"
          name="${NAME}Description"
          onChange={handleChange}
        />
      </div>

      <button type="submit">Create ${NAME^}</button>
    </form>
  )
}
EOF
    echo "Created Client Component at $CLIENT_FILE"
    ;;

  *)
    echo "Unknown pattern type: $PATTERN_TYPE"
    echo "Available types: server-component, server-action, api-route, client-component"
    exit 1
    ;;
esac

echo "Data fetching pattern generated successfully!"