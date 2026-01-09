# Next.js Routing Guide

## App Router vs Pages Router

### App Router (Modern - Recommended)
Located in the `/app` directory, the App Router is the modern approach to building Next.js applications. It offers:

- **Server Components by default**: Better performance and reduced bundle size
- **Nested layouts**: Shared UI with independent child content
- **Colocation**: Layouts, loading states, and error boundaries alongside pages
- **Streaming**: Server-rendered components with client-side interactivity
- **Partial Prerendering**: Combine static and dynamic rendering

### Pages Router (Traditional)
Located in the `/pages` directory, the Pages Router follows the traditional Next.js approach with:

- File-based routing system
- getStaticProps and getStaticPaths for SSG
- getServerSideProps for SSR
- Custom App and Document components

## File System Routing

### Dynamic Routes
Create dynamic routes using bracket notation:

```javascript
// app/blog/[slug]/page.js
export default function Post({ params }) {
  return <h1>Blog Post: {params.slug}</h1>
}

// app/users/[id]/settings/page.js
export default function UserSettings({ params }) {
  return <h1>Settings for user: {params.id}</h1>
}
```

### Catch-all Segments
Use catch-all segments for dynamic routes with multiple parameters:

```javascript
// app/shop/[...slug]/page.js
// Matches /shop/clothing/shirts, /shop/electronics/phones, etc.
export default function Category({ params }) {
  return <h1>Category: {params.slug.join('/')}</h1>
}

// Optional catch-all segments
// app/docs/[[...slug]]/page.js
// Matches /docs, /docs/guide, /docs/guide/react, etc.
```

### Route Groups
Organize routes without affecting the URL structure:

```javascript
// (marketing)/about/page.js -> /about
// (marketing)/contact/page.js -> /contact
// (app)/dashboard/page.js -> /dashboard
// (app)/profile/page.js -> /profile
```

### Parallel Routes
Render multiple routes simultaneously:

```javascript
// app/@modal/(.)settings/page.js
// app/@modal/default.js
// app/@layout/page.js
```

## Linking Between Routes

Use the Link component for client-side navigation:

```javascript
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog/my-post">Blog Post</Link>
    </nav>
  )
}
```

## Layouts in App Router

### Root Layout
Required layout for all pages:

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Global Header</header>
        <main>{children}</main>
        <footer>Global Footer</footer>
      </body>
    </html>
  )
}
```

### Nested Layouts
Create nested layouts that persist across routes:

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <section>
      <nav>Dashboard Navigation</nav>
      <div>{children}</div>
    </section>
  )
}
```

## Middleware
Handle requests before they are completed:

```javascript
// middleware.js
export function middleware(request) {
  // Redirect unauthenticated users
  if (request.nextUrl.pathname.startsWith('/dashboard') && !request.cookies.get('token')) {
    return Response.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
```