---
name: nextjs-styling
description: Style Next.js applications with CSS Modules and Tailwind CSS. Learn the recommended styling approaches and best practices. Use when Claude needs to work with Next.js styling, CSS Modules, Tailwind CSS, global styles, or dark mode implementation in Next.js applications.
---

# Styling in Next.js - CSS Modules and Tailwind CSS

## Overview
This skill covers styling techniques in Next.js applications using CSS Modules and Tailwind CSS. You'll learn the recommended approaches for component styling, global styles, responsive design, and dark mode implementation.

## Prerequisites
- Basic knowledge of Next.js and React
- Understanding of CSS fundamentals

## 1. CSS Modules Basics

CSS Modules locally scope CSS by generating unique class names, preventing naming collisions. To enable CSS Modules for a file, rename the file to have the extension `.module.css`.

### File Naming Convention
- Component-scoped CSS
- File naming: `ComponentName.module.css`
- Prevents style conflicts
- Automatic class name generation
- Type-safe in TypeScript

### Example CSS Module
```css
/* styles/Button.module.css */
.button {
  padding: 10px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.button:hover {
  background-color: darkblue;
}

.button:disabled {
  background-color: gray;
  cursor: not-allowed;
}
```

## 2. Using CSS Modules

Import CSS modules as objects and access classes as properties. The styles are only scoped to the component, preventing global conflicts.

### Basic Usage
```javascript
// components/Button.js
import styles from '@/styles/Button.module.css'

export default function Button() {
  return (
    <button className={styles.button}>
      Click me
    </button>
  )
}
```

### CSS Modules with Multiple Classes
Combine multiple classes, use conditional classes, and implement dynamic styling:

```javascript
// components/Button.js
import styles from '@/styles/Button.module.css'

export default function Button({ variant, disabled }) {
  const baseClass = styles.button
  const variantClass = variant === 'primary'
    ? styles.primary
    : styles.secondary

  return (
    <button
      className={`${baseClass} ${variantClass}`}
      disabled={disabled}
    >
      Click me
    </button>
  )
}
```

## 3. Global Styles

Global styles apply to the entire application. Create a global CSS file (e.g., `app/globals.css`) and import it once in your root layout.

### Global Styles Example
```css
/* app/globals.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  background-color: #fff;
  color: #000;
}

h1, h2, h3 {
  font-weight: 600;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

### Importing Global Styles
Import global styles in your root layout only, once per app:

```javascript
// app/layout.js
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## 4. Setting up Tailwind CSS

### Installation
Install Tailwind CSS and its dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configure PostCSS
Add the Tailwind CSS PostCSS plugin to the `postcss.config.mjs` file:

```javascript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### Configure Tailwind
Update the `tailwind.config.js` file to include your template paths:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
```

### Add Tailwind Directives
Import Tailwind's base, components, and utilities layers into a global CSS file:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 5. Using Tailwind CSS

Tailwind CSS provides utility-first classes that you apply directly to your JSX elements:

```javascript
export default function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
      Click me
    </button>
  )
}
```

## 6. Responsive Design with Tailwind

Tailwind uses a mobile-first approach with breakpoint prefixes:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```javascript
export default function Container() {
  return (
    <div className="
      w-full
      md:w-1/2
      lg:w-1/3
      px-4
      md:px-6
      lg:px-8
    ">
      <h1 className="text-2xl md:text-3xl lg:text-4xl">
        Responsive Title
      </h1>
      <p className="text-sm md:text-base lg:text-lg">
        Responsive paragraph
      </p>
    </div>
  )
}
```

## 7. Dark Mode with Tailwind

Enable dark mode in your Tailwind config and use the `dark:` prefix:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

Apply dark mode styles using the `dark:` prefix:

```javascript
// Component with dark mode
export default function Card() {
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      <h2>Card Title</h2>
      <p>Card content</p>
    </div>
  )
}
```

To enable dark mode globally, add the dark class to your root element:

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html className="dark">
      <body>{children}</body>
    </html>
  )
}
```

## 8. Extracting Components in Tailwind

Use the `@apply` directive to extract reusable utility combinations:

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
}

/* Usage */
export default function Button() {
  return <button className="btn-primary">Click me</button>
}
```

## 9. CSS Variables

Custom properties allow reusable values and easy theming:

```css
/* app/globals.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --spacing-unit: 4px;
  --border-radius: 8px;
}

/* Usage in CSS Modules */
/* styles/Button.module.css */
.button {
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 2);
}
```

## 10. Code Examples

### Example 1: Button Component with CSS Modules
```css
/* styles/Button.module.css */
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #1d4ed8;
}

.secondary {
  background-color: #e5e7eb;
  color: #000;
}

.secondary:hover {
  background-color: #d1d5db;
}
```

```javascript
// components/Button.js
import styles from '@/styles/Button.module.css'

export default function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  )
}
```

### Example 2: Card Component with Tailwind
```javascript
export default function Card({ title, description, image }) {
  return (
    <div className="
      bg-white
      rounded-lg
      shadow-md
      overflow-hidden
      hover:shadow-lg
      transition-shadow
    ">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
```

### Example 3: Responsive Layout with Tailwind
```javascript
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-2xl font-bold">My App</h1>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cards */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <h3>Card {i}</h3>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
```

### Example 4: Dark Mode Toggle
```javascript
'use client'

import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="
        fixed top-4 right-4
        px-4 py-2
        bg-gray-200 dark:bg-gray-800
        text-black dark:text-white
        rounded
      "
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
```

## 11. Real-World Scenarios

### Personal Blog
- Global styles for typography
- CSS Modules for components
- Tailwind for layout
- Dark mode for reading

### E-commerce Site
- Tailwind for rapid UI
- CSS Modules for product cards
- Dark mode for evening shopping
- Responsive grid layout

### SaaS Dashboard
- Consistent styling with Tailwind
- Component library with CSS Modules
- Dark mode for productivity
- Custom brand colors

### Portfolio
- CSS Modules for sections
- Tailwind for grid/flex layouts
- Global fonts and colors
- Smooth transitions

## 12. Common Mistakes

1. **Mixing CSS Modules and global styles** - Choose one approach per component and keep consistent
2. **Not scoping styles properly** - CSS Modules prevent conflicts; use them for components
3. **Too many Tailwind classes in JSX** - Extract with @apply; keep code readable
4. **Not configuring Tailwind properly** - Configure content paths; enable features you need
5. **Using inline styles instead of CSS** - Use CSS Modules or Tailwind; inline styles are less flexible
6. **Not using responsive classes** - Mobile-first approach; always consider mobile

## 13. Best Practices

1. Use CSS Modules for components
2. Use Tailwind for layouts and utilities
3. Keep global styles minimal
4. Extract repeated Tailwind patterns
5. Use CSS variables for themes
6. Mobile-first responsive design
7. Consistent color palette
8. Use semantic HTML
9. Test on different screen sizes
10. Document custom styles

## 14. Quick Reference

### CSS Modules
```javascript
// styles/Component.module.css
.container { padding: 20px; }

// components/Component.js
import styles from '@/styles/Component.module.css'
<div className={styles.container}>
```

### Global Styles
```javascript
// app/globals.css
body { font-family: sans-serif; }

// app/layout.js
import './globals.css'
```

### Tailwind Basic
```javascript
<div className="px-4 py-2 bg-blue-500 text-white rounded">
```

### Tailwind Responsive
```javascript
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Tailwind Dark Mode
```javascript
<div className="bg-white dark:bg-black">
```

### Tailwind Hover
```javascript
<button className="bg-blue-500 hover:bg-blue-600">
```

### CSS Variables
```css
:root { --color: blue; }
.element { color: var(--color); }
```

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px