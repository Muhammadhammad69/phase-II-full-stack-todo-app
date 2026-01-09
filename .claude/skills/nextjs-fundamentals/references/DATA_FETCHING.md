# Next.js Data Fetching Guide

## Data Fetching in App Router

### Server Components (Default)
Server components can directly fetch data:

```javascript
// app/page.js
async function getData() {
  const res = await fetch('https://api.example.com/data')
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  return res.json()
}

export default async function Page() {
  const data = await getData()

  return <div>{data.title}</div>
}
```

### Client Components
Client components must fetch data in component lifecycle:

```javascript
'use client'

import { useState, useEffect } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('https://api.example.com/data')
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [])

  return <div>{data?.title}</div>
}
```

## Caching Strategies

### Request Memoization
Server components automatically cache fetch requests:

```javascript
// This request will be cached for the same URL
// across all requests
const res = await fetch('https://api.example.com/data')

// To opt-out of caching:
const res = await fetch('https://api.example.com/data', { cache: 'no-store' })

// To revalidate data after a certain time:
const res = await fetch('https://api.example.com/data', { next: { revalidate: 3600 } })
```

### Using revalidate Property
Configure automatic revalidation in static generation:

```javascript
// app/page.js
export const revalidate = 3600 // Revalidate every hour

export default async function Page() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()

  return <div>{data.title}</div>
}
```

### Dynamic Params with generateStaticParams
Pre-generate dynamic routes at build time:

```javascript
// app/item/[id]/page.js
export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((res) => res.json())

  return posts.map((post) => ({
    id: post.id,
  }))
}

export default async function Page({ params }) {
  const post = await fetch(`https://.../posts/${params.id}`).then((res) => res.json())

  return <div>{post.title}</div>
}
```

## Data Fetching Patterns

### Streaming with Suspense
Stream UI updates as data becomes available:

```javascript
import { Card, Cards } from './ui/cards'
import { notFound } from 'next/navigation'

async function fetchAlbum(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/albums/${id}`)
  if (!res.ok) return notFound()
  return res.json()
}

export default async function Album({ id }) {
  const album = await fetchAlbum(id)
  return <Card title={album.title} />
}

// app/albums/page.js
import { Suspense } from 'react'
import Album from './album'

export default function AlbumsPage() {
  return (
    <Suspense fallback={<div>Loading albums...</div>}>
      <Album id="1" />
    </Suspense>
  )
}
```

### Parallel Data Fetching
Fetch multiple data sources simultaneously:

```javascript
// app/page.js
async function getName() {
  const res = await fetch('https://api.example.com/name')
  return res.json()
}

async function getJob() {
  const res = await fetch('https://api.example.com/job')
  return res.json()
}

// This will be slower, as it waits for each fetch sequentially
export default async function Page() {
  const name = await getName()
  const job = await getJob()

  return (
    <>
      <h1>{name}</h1>
      <p>{job}</p>
    </>
  )
}

// Better approach - parallel fetching
// app/page.js
async function getName() { /* ... */ }
async function getJob() { /* ... */ }

// Use Promise.all for parallel execution
export default async function Page() {
  const [name, job] = await Promise.all([getName(), getJob()])

  return (
    <>
      <h1>{name}</h1>
      <p>{job}</p>
    </>
  )
}
```

### Sequential Data Fetching
When data depends on previous requests:

```javascript
// app/page.js
export default async function Page() {
  // First fetch the category
  const categoryRes = await fetch('https://api.example.com/category')
  const category = await categoryRes.json()

  // Then fetch items in that category
  const itemsRes = await fetch(`https://api.example.com/items?category=${category.id}`)
  const items = await itemsRes.json()

  return (
    <div>
      <h1>{category.name}</h1>
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  )
}
```

## Error Handling

### Using Error Boundaries
Create error boundaries to handle server component errors:

```javascript
// app/error.js
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
```

### Handling Fetch Errors
Handle API errors gracefully:

```javascript
// app/page.js
async function getData() {
  const res = await fetch('https://api.example.com/data')

  // If the status code is not 200, throw an error
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
```

## Server Actions
Handle form submissions and mutations on the server:

```javascript
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(prevState, formData) {
  const title = formData.get('title')
  const content = formData.get('content')

  try {
    // Create post in database
    await db.post.create({ data: { title, content } })

    // Revalidate path to update cached data
    revalidatePath('/')

    return { message: 'Post created successfully!' }
  } catch (error) {
    return { error: 'Failed to create post.' }
  }
}
```

```javascript
// app/create-form.js
'use client'

import { useFormState } from 'react-dom'
import { createPost } from './actions'

export default function CreateForm() {
  const [state, formAction] = useFormState(createPost, {})

  return (
    <form action={formAction}>
      <label htmlFor="title">Title</label>
      <input type="text" id="title" name="title" required />

      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" required />

      <button type="submit">Create Post</button>

      {state?.error && <p>{state.error}</p>}
      {state?.message && <p>{state.message}</p>}
    </form>
  )
}
```