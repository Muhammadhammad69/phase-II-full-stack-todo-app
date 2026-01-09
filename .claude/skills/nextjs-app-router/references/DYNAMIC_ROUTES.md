# Next.js Dynamic Routes Guide

## Overview

Dynamic routes in Next.js allow you to create pages that can match multiple URL patterns. Using square brackets `[]`, you can define dynamic segments that capture values from the URL and make them available in your components.

## Single Dynamic Segments

### Basic Dynamic Route
Create a dynamic route by placing a file in a folder with square brackets:

```
app/
└── posts/
    └── [id]/
        └── page.js
```

This route will match:
- `/posts/1`
- `/posts/abc`
- `/posts/hello-world`

### Accessing Dynamic Parameters

```javascript
// app/posts/[id]/page.js
export default function Post({ params }) {
  return <h1>Post ID: {params.id}</h1>
}
```

## Multiple Dynamic Segments

### Multiple Parameters in One Route
You can have multiple dynamic segments in a single route:

```
app/
└── courses/
    └── [category]/
        └── [slug]/
            └── page.js
```

This route will match:
- `/courses/technology/react-intro`
- `/courses/business/management-101`
- `/courses/life/cooking-basics`

### Accessing Multiple Parameters

```javascript
// app/courses/[category]/[slug]/page.js
export default function Course({ params }) {
  return (
    <div>
      <h1>Category: {params.category}</h1>
      <h2>Course: {params.slug}</h2>
    </div>
  )
}
```

## Catch-All Routes

### Three Dots Syntax `[...slug]`
Catch-all routes capture multiple path segments into an array:

```
app/
└── docs/
    └── [...slug]/
        └── page.js
```

This route will match:
- `/docs/getting-started`
- `/docs/api/reference`
- `/docs/advanced/concepts/security`

### Accessing Catch-All Parameters

```javascript
// app/docs/[...slug]/page.js
export default function Docs({ params }) {
  // For URL: /docs/api/reference
  // params.slug = ['api', 'reference']

  const path = params.slug.join('/')
  return <h1>Documentation: {path}</h1>
}
```

### Example with Nested Data

```javascript
// app/docs/[...slug]/page.js
export default async function Docs({ params }) {
  const slug = params.slug // e.g., ['api', 'reference', 'authentication']

  // Fetch content based on the full path
  const content = await fetchDocumentation(slug)

  return (
    <article>
      <h1>{content.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.body }} />
    </article>
  )
}
```

## Optional Catch-All Routes

### Double Brackets Syntax `[[...slug]]`
Optional catch-all routes can match zero or more segments:

```
app/
└── docs/
    └── [[...slug]]/
        └── page.js
```

This route will match:
- `/docs` (no segments)
- `/docs/getting-started`
- `/docs/api/reference`

### Handling Optional Parameters

```javascript
// app/docs/[[...slug]]/page.js
export default function Docs({ params }) {
  // For URL: /docs
  // params.slug = undefined

  // For URL: /docs/api/reference
  // params.slug = ['api', 'reference']

  const path = params.slug ? params.slug.join('/') : 'overview'
  return <h1>Documentation: {path}</h1>
}
```

## Advanced Dynamic Route Patterns

### Mixed Static and Dynamic Segments
You can combine static and dynamic segments:

```
app/
└── shop/
    └── category/
        └── [category]/
            └── product/
                └── [id]/
                    └── page.js
```

This creates the route: `/shop/category/{category}/product/{id}`

```javascript
// app/shop/category/[category]/product/[id]/page.js
export default function Product({ params }) {
  return (
    <div>
      <h1>Product {params.id}</h1>
      <p>Category: {params.category}</p>
    </div>
  )
}
```

### Multiple Catch-All Segments
You can have multiple catch-all segments in complex routes:

```
app/
└── blog/
    └── authors/
        └── [author]/
            └── [...categories]/
                └── page.js
```

```javascript
// app/blog/authors/[author]/[...categories]/page.js
export default function AuthorPosts({ params }) {
  return (
    <div>
      <h1>Posts by {params.author}</h1>
      <p>Categories: {params.categories?.join(' > ') || 'All'}</p>
    </div>
  )
}
```

## Dynamic Routes with Data Fetching

### Static Generation with Dynamic Routes
When using static generation, you need to define which paths should be pre-built:

```javascript
// app/posts/[id]/page.js
export async function generateStaticParams() {
  // Fetch a list of all posts
  const posts = await fetch('https://api.example.com/posts').then(res => res.json())

  // Return the list of params for each post
  return posts.map((post) => ({
    id: post.id.toString(),
  }))
}

export default async function Post({ params }) {
  // Fetch data for the specific post
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(res => res.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

### Server-Side Rendering with Dynamic Routes
For dynamic routes that need fresh data on each request:

```javascript
// app/products/[id]/page.js
export default async function Product({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`).then(res => res.json())

  if (!product) {
    // Handle not found
    return <div>Product not found</div>
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  )
}
```

## Route Matching Priority

Next.js matches routes in the following order of priority:

1. **Static Routes**: `/about`, `/contact`
2. **Dynamic Routes**: `/posts/[id]`
3. **Catch-all Routes**: `/docs/[...slug]`
4. **Optional Catch-all Routes**: `/docs/[[...slug]]`

### Example of Route Priority
```
app/
├── about/
│   └── page.js          # /about (static)
├── posts/
│   └── [id]/
│       └── page.js      # /posts/123 (dynamic)
├── docs/
│   └── [...slug]/
│       └── page.js      # /docs/a/b/c (catch-all)
└── help/
    └── [[...slug]]/
        └── page.js      # /help (optional catch-all)
```

## Dynamic Route Validation

### Validating Parameters
You can validate dynamic route parameters and redirect if needed:

```javascript
// app/products/[id]/page.js
import { notFound } from 'next/navigation'

export default async function Product({ params }) {
  // Validate the ID parameter
  const id = params.id

  // Check if it's a valid number
  if (isNaN(Number(id))) {
    notFound() // This will render the not-found.js page
  }

  const product = await fetch(`https://api.example.com/products/${id}`).then(res => res.json())

  if (!product) {
    notFound()
  }

  return <div>Product: {product.name}</div>
}
```

### Redirecting Based on Parameters
```javascript
// app/redirect/[target]/page.js
import { redirect } from 'next/navigation'

export default async function RedirectPage({ params }) {
  const target = params.target

  // Redirect based on the parameter
  switch (target) {
    case 'admin':
      redirect('/dashboard/admin')
    case 'profile':
      redirect('/account/profile')
    case 'settings':
      redirect('/account/settings')
    default:
      redirect('/404')
  }
}
```

## Client-Side Parameter Access

### Using useParams Hook
In client components, you can access route parameters using the `useParams` hook:

```javascript
'use client'

import { useParams } from 'next/navigation'

export default function ClientComponent() {
  const params = useParams()

  return (
    <div>
      <h1>Current route parameters:</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  )
}
```

## Error Handling in Dynamic Routes

### Handling Missing Parameters
```javascript
// app/users/[id]/page.js
import { notFound } from 'next/navigation'

export default async function User({ params }) {
  const id = params.id

  // Ensure id exists
  if (!id) {
    notFound()
  }

  try {
    const user = await fetch(`https://api.example.com/users/${id}`).then(res => res.json())

    if (!user || user.error) {
      notFound()
    }

    return <div>User: {user.name}</div>
  } catch (error) {
    // Log error and return not found
    console.error('Error fetching user:', error)
    notFound()
  }
}
```

## Performance Considerations

### Optimizing Catch-All Routes
Be careful with catch-all routes as they can match many different URLs. Consider:

1. **Limit the depth**: Don't allow unlimited nesting
2. **Validate parameters**: Check for valid paths
3. **Use static generation**: Pre-build common paths

### Example with Validation
```javascript
// app/docs/[...slug]/page.js
export async function generateStaticParams() {
  // Only pre-build common documentation paths
  return [
    { slug: ['getting-started'] },
    { slug: ['api', 'reference'] },
    { slug: ['advanced', 'performance'] },
    // Add more common paths as needed
  ]
}

export default async function Docs({ params }) {
  const slug = params.slug

  // Limit the depth to prevent performance issues
  if (slug.length > 5) {
    return <div>Path too deep</div>
  }

  // Validate the path exists
  const content = await fetchDocumentation(slug)

  if (!content) {
    return <div>Documentation not found</div>
  }

  return <div>{content}</div>
}
```

Dynamic routes provide powerful flexibility for creating complex routing patterns in Next.js. Remember to validate parameters, handle errors appropriately, and consider performance implications when using catch-all routes.