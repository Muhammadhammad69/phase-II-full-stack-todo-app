# Next.js Directory Structure Guide

## App Router Structure

### Core Directories and Files

#### app/ Directory
The `app/` directory is the heart of the Next.js App Router. It implements file-system based routing where the folder structure determines the URL routes.

**Special Files in app/:**
- `page.js` - Defines a route and renders UI for that route
- `layout.js` - Creates shared UI for a segment and its children
- `error.js` - Handles error UI for a route segment
- `loading.js` - Provides loading UI for a route segment
- `not-found.js` - Displays not-found UI for a route segment
- `route.js` - Creates API endpoints within the app directory
- `template.js` - Provides a template that re-renders for each navigation
- `middleware.js` - Runs code before a request is completed

**Example of a typical app/ structure:**
```
app/
├── layout.js          # Root layout for entire app
├── page.js            # Home page (route: /)
├── about/
│   ├── page.js        # About page (route: /about)
│   └── layout.js      # Layout for about section
├── dashboard/
│   ├── layout.js      # Dashboard layout (route: /dashboard)
│   ├── page.js        # Dashboard home (route: /dashboard)
│   ├── settings/
│   │   └── page.js    # Settings page (route: /dashboard/settings)
│   └── (analytics)/   # Route group (doesn't affect URL)
│       └── chart.js
├── blog/
│   ├── page.js        # Blog home (route: /blog)
│   ├── [slug]/        # Dynamic route
│   │   └── page.js    # Individual blog post (route: /blog/post-slug)
│   └── layout.js      # Blog section layout
└── api/
    └── users/
        └── route.js   # API endpoint (route: /api/users)
```

#### public/ Directory
The `public/` directory contains static assets that are served at the root of your application. Files in this directory are accessible via the base URL of your application.

**What goes in public/:**
- Images (PNG, JPG, SVG, etc.)
- Fonts
- Favicon and other icons
- Robots.txt
- Sitemap.xml
- Static JSON files
- PDFs or other downloadable files

**Example:**
```
public/
├── images/
│   ├── logo.svg
│   ├── hero.jpg
│   └── icons/
│       ├── facebook.svg
│       └── twitter.svg
├── fonts/
│   └── custom-font.woff2
├── favicon.ico
├── robots.txt
└── manifest.json
```

Access these files in your components:
```javascript
// Access public/images/logo.svg as:
<img src="/images/logo.svg" alt="Logo" />

// Access public/favicon.ico as:
<link rel="icon" href="/favicon.ico" />
```

#### components/ Directory
The `components/` directory contains reusable React components that can be shared across different pages and sections of your application.

**Organization patterns:**
```
components/
├── ui/                # Reusable UI components
│   ├── Button.js
│   ├── Input.js
│   └── Card.js
├── navigation/        # Navigation-related components
│   ├── Header.js
│   ├── Footer.js
│   └── Sidebar.js
├── forms/             # Form-related components
│   ├── ContactForm.js
│   └── LoginForm.js
└── sections/          # Larger page sections
    ├── Hero.js
    └── Features.js
```

## File-Based Routing Patterns

### Static Routes
Simple static routes are created by placing page.js files in folders:

```
app/
├── page.js          # /
├── about/page.js    # /about
├── contact/page.js  # /contact
└── terms/page.js    # /terms
```

### Dynamic Routes
Dynamic routes use square brackets to create routes that can accept parameters:

```
app/
├── blog/
│   ├── page.js           # /blog
│   └── [slug]/           # Dynamic segment
│       └── page.js       # /blog/:slug
└── users/
    └── [id]/             # Dynamic user ID
        ├── page.js       # /users/:id
        └── posts/
            └── page.js   # /users/:id/posts
```

**Accessing dynamic parameters:**
```javascript
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return <h1>Blog post: {params.slug}</h1>;
}

// For multiple dynamic segments
// app/countries/[country]/cities/[city]/page.js
export default function CityPage({ params }) {
  return <h1>{params.city} in {params.country}</h1>;
}
```

### Catch-All Routes
Catch-all routes match multiple path segments using three dots:

```
app/
└── docs/
    └── [...slug]/        # Match /docs/a, /docs/a/b, /docs/a/b/c
        └── page.js
```

**Accessing catch-all parameters:**
```javascript
// app/docs/[...slug]/page.js
export default function DocPage({ params }) {
  // params.slug will be an array of path segments
  return <h1>Document: {params.slug.join('/')}</h1>;
}
```

### Optional Catch-All Routes
Optional catch-all routes use double square brackets:

```
app/
└── search/
    └── [[...keyword]]/   # Match /search, /search/js, /search/js/react
        └── page.js
```

### Route Groups
Parentheses create route groups that don't affect the URL structure but help with organization:

```
app/
├── (auth)/              # Auth group (doesn't affect URL)
│   ├── login/page.js    # /login
│   └── signup/page.js   # /signup
├── (marketing)/         # Marketing group (doesn't affect URL)
│   ├── about/page.js    # /about
│   └── contact/page.js  # /contact
└── dashboard/
    ├── (sidebar)/       # Sidebar group
    │   └── layout.js
    └── page.js          # /dashboard
```

### Parallel Routes
Parallel routes allow rendering multiple routes in the same layout simultaneously:

```
app/
├── @modal/              # Modal slot
│   ├── (.)login/        # Login modal
│   │   └── page.js
│   └── default.js
├── @banner/             # Banner slot
│   └── welcome.js
└── layout.js            # Main layout rendering both slots
```

## Special Files in Detail

### layout.js
Layouts create shared UI that persists across multiple pages and preserves React state during navigation.

**Basic layout:**
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
  );
}
```

**Layout with metadata:**
```javascript
// app/layout.js
export const metadata = {
  title: 'My Site',
  description: 'Welcome to my site!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### page.js
Pages define the unique content for each route and are the only required file in a route segment.

```javascript
// app/page.js
export default function HomePage() {
  return (
    <div>
      <h1>Welcome Home</h1>
      <p>This is the home page content.</p>
    </div>
  );
}
```

### loading.js
Provides a loading state for route segments that contain async components.

```javascript
// app/loading.js
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}
```

### error.js
Handles errors in route segments using React Error Boundaries.

```javascript
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### not-found.js
Handles 404 Not Found errors for route segments.

```javascript
import { notFound } from 'next/navigation';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

## Project Organization Best Practices

### Feature-Based Organization
Group related files by feature:

```
app/
├── products/
│   ├── page.js
│   ├── [id]/
│   │   └── page.js
│   ├── components/
│   │   ├── ProductCard.js
│   │   └── ProductFilter.js
│   ├── actions/
│   │   └── product-actions.js
│   └── utils/
│       └── product-helpers.js
└── orders/
    ├── page.js
    ├── [id]/
    │   └── page.js
    ├── components/
    └── actions/
```

### Layer-Based Organization
Separate by architectural layers:

```
app/
├── ui/                 # Presentational components
│   ├── Button.js
│   └── Card.js
├── components/         # Container components
│   ├── ProductList.js
│   └── OrderSummary.js
├── hooks/              # Custom React hooks
│   ├── useProducts.js
│   └── useOrders.js
├── lib/                # Business logic
│   ├── api.js
│   └── validators.js
└── services/           # External service integrations
    ├── productService.js
    └── orderService.js
```

### Scalability Considerations

As your application grows, consider these organizational patterns:

1. **Shared Components Directory**
```
components/
├── ui/                 # Generic UI primitives
├── forms/              # Form-related components
├── layout/             # Layout components
├── [feature-name]/     # Feature-specific components
└── shared/             # Components used across features
```

2. **Hooks and Utilities**
```
hooks/
├── useAuth.js
├── useApi.js
└── useLocalStorage.js

utils/
├── constants.js
├── helpers.js
└── validators.js
```

3. **Data and API Layer**
```
lib/
├── api/
│   ├── products.js
│   └── orders.js
├── auth.js
└── database.js
```

Following these organizational patterns will help maintain a clean, scalable Next.js application structure that's easy to navigate and understand.