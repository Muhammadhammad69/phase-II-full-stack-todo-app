# shadcn UI Theming and Styling Reference

This reference contains detailed information about theming, styling, and customization options in shadcn UI.

## Core Design Principles

### Open Code
- All components are open source and fully customizable
- Direct access to component code allows complete modification
- No wrapper components needed - edit the source directly
- Transparency enables full control over appearance and behavior

### Composition
- Components share a common, composable interface
- Predictable APIs across all elements
- Consistent patterns for props and behaviors
- Easy to combine and extend components

### Distribution
- Flat-file schema for component distribution
- Command-line tool for easy component management
- Cross-framework compatibility
- Easy sharing and versioning of components

### Beautiful Defaults
- Carefully chosen default styles
- Great design out-of-the-box
- Consistent visual language
- Accessibility-first approach

### AI-Ready
- Open code that LLMs can read and understand
- Structured components that are easy to modify
- Clear patterns that AI can follow
- Well-documented code structure

## Theming System

### CSS Variables
shadcn UI uses CSS variables for theming, which are defined in your main CSS file:

```css
:root {
  /* Color palette */
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;

  /* Muted colors */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Border colors */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;

  /* Primary colors */
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;

  /* Secondary colors */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Accent colors */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive colors */
  --destructive: 0 100% 50%;
  --destructive-foreground: 210 40% 98%;

  /* Ring color */
  --ring: 215 20.2% 65.1%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;

  --muted: 223 47% 11%;
  --muted-foreground: 215.4 16.3% 56.9%;

  --accent: 216 34% 17%;
  --accent-foreground: 210 40% 98%;

  --border: 216 34% 17%;
  --input: 216 34% 17%;

  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 1.2%;

  --secondary: 222.2 47.4% 11.2%;
  --secondary-foreground: 210 40% 98%;

  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;

  --ring: 216 34% 17%;
}
```

### Dark Mode Implementation
Dark mode is automatically applied based on system preferences using the `prefers-color-scheme` media query. The `.dark` class is applied to the document when dark mode is active.

To enable dark mode in your Tailwind config:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  // ... rest of config
}
```

## Customization Methods

### 1. Override Component Styles
Directly modify the component files in your `components/ui/` directory. Since the code is open, you can make any changes needed.

### 2. Use Tailwind Utility Classes
Apply additional Tailwind classes when using components:

```jsx
<Button className="bg-purple-500 hover:bg-purple-600">
  Purple Button
</Button>
```

### 3. Extend Components
Create your own component variants by extending existing components:

```jsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PurpleButton = ({ className, ...props }) => (
  <Button
    className={cn(
      "bg-purple-500 hover:bg-purple-600 text-white",
      className
    )}
    {...props}
  />
);
```

### 4. Create Component Variants
Use the `cvx` (class-variance-authority) utility to create variants:

```jsx
import { cvx } from "class-variance-authority";

const buttonVariants = cvx(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        purple: "bg-purple-500 text-white hover:bg-purple-600"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

## Color Palettes

### Base Colors Available
- slate
- gray
- zinc
- neutral
- stone

Each base color provides a range of shades from 50 to 950, with special foreground colors for text contrast.

### Customizing Colors
To customize the base color palette:
1. Run the init command with a specific base color: `npx shadcn@latest init --base-color zinc`
2. Or manually update the CSS variables in your globals.css file

## Responsive Design

All shadcn UI components are responsive by default and follow Tailwind's mobile-first approach. You can apply responsive classes:

```jsx
<Button className="w-full sm:w-auto">
  Responsive Button
</Button>
```

## Animation and Transitions

Components use Tailwind's transition and animation utilities. You can customize these by modifying the component files directly or by adding additional classes:

```jsx
<Button className="transition-all duration-300 ease-in-out hover:scale-105">
  Animated Button
</Button>
```

## Accessibility Features

### Built-in Accessibility
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Semantic HTML structure

### Custom Accessibility
When customizing components, ensure to maintain accessibility by:
- Preserving ARIA attributes
- Maintaining keyboard navigation
- Keeping focus indicators
- Ensuring sufficient color contrast

## Typography

### Font Configuration
To configure fonts in your project:

1. Install font packages (e.g., `npm install @fontsource/inter`)
2. Import fonts in your CSS
3. Configure in your Tailwind config

### Typography Components
For consistent typography, you can create your own typography components:

```jsx
const H1 = ({ children, className, ...props }) => (
  <h1
    className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      className
    )}
    {...props}
  >
    {children}
  </h1>
);
```

## Layout Utilities

### Container Component
Create a container component for consistent page layout:

```jsx
const Container = ({ children, className, ...props }) => (
  <div
    className={cn(
      "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
```

### Grid and Flexbox
Use Tailwind's grid and flex utilities with shadcn components:

```jsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <Card>
    <CardContent className="p-6">
      <p>Card content</p>
    </CardContent>
  </Card>
</div>
```

## Styling Best Practices

### 1. Maintain Consistency
- Use the same color palette throughout
- Apply consistent spacing with Tailwind's spacing scale
- Keep typography hierarchy clear

### 2. Respect Component Structure
- Don't break the internal structure of components
- Preserve accessibility features
- Maintain proper class merging with `cn` utility

### 3. Theme-Friendly Classes
- Use CSS variables for colors instead of hardcoded values
- Support both light and dark modes
- Test contrast ratios for accessibility

### 4. Performance
- Keep styles minimal and efficient
- Avoid unnecessary nesting
- Use Tailwind's JIT compiler for optimal CSS output