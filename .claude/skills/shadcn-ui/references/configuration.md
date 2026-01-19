# shadcn UI CLI and Configuration Reference

This reference contains detailed information about the shadcn UI CLI commands and configuration options.

## CLI Commands

### Initialization
```bash
npx shadcn@latest init
```
Initializes shadcn UI in the current project. This command:
- Installs required dependencies
- Adds the `cn` utility function
- Configures CSS variables
- Creates a `components.json` configuration file
- Sets up the project structure for shadcn UI components

Options:
- `--template`: Specify a template for initialization
- `--base-color`: Choose the base color palette (e.g., slate, gray, zinc, neutral, stone)
- `--css-variables`: Enable/disable CSS variables (default: true)
- `--tsx`: Use TSX instead of JSX (default: true)
- `--rsc`: Configure for React Server Components (default: false)
- `--src-dir`: Specify the source directory (default: src)

### Adding Components
```bash
npx shadcn@latest add [component-name]
```
Adds specific components to your project. You can add multiple components at once:
```bash
npx shadcn@latest add button input dialog
```

To add all available components:
```bash
npx shadcn@latest add *
```

### Viewing Components
```bash
npx shadcn@latest view [component-name]
```
Shows details about a specific component without adding it to your project.

### Searching Components
```bash
npx shadcn@latest search [query]
```
Searches for components in the registry that match the query.

### Listing Components
```bash
npx shadcn@latest list
```
Lists all available components in the registry.

### Building Registry
```bash
npx shadcn@latest build
```
Builds registry JSON files for custom components.

## Configuration File (components.json)

The `components.json` file manages your project's component configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

### Configuration Options

#### Root Level Options
- `"$schema"`: Points to the schema definition for validation
- `"style"`: Component style (currently only "default" is available)
- `"rsc"`: Enables React Server Component support (true/false)
- `"tsx"`: Uses TypeScript (true) or JavaScript (false)
- `"iconLibrary"`: Icon library to use ("lucide", "lucide-react-native", or null)

#### Tailwind Configuration
- `"config"`: Path to Tailwind configuration file
- `"css"`: Path to main CSS file where global styles are defined
- `"baseColor"`: Base color for the color palette ("slate", "gray", "zinc", "neutral", "stone")
- `"cssVariables"`: Enables CSS variables for theming (true/false)
- `"prefix"`: Optional prefix for Tailwind classes

#### Aliases
- `"components"`: Alias for the components directory
- `"utils"`: Alias for utility functions
- `"ui"`: Alias for UI components directory

## Framework-Specific Setup

### Next.js Setup
For Next.js projects, ensure you have:
1. Tailwind CSS configured
2. Proper alias setup in `jsconfig.json` or `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Vite Setup
For Vite projects:
1. Configure aliases in `vite.config.js`
2. Set up Tailwind CSS properly
3. Ensure the correct CSS file is imported

### Manual Setup
For projects without framework-specific setup:
1. Manually install dependencies: `npm install class-variance-authority clsx tailwind-merge lucide-react`
2. Add the `cn` utility function
3. Configure Tailwind CSS manually
4. Set up the proper directory structure

## Dependencies Explained

shadcn UI requires these dependencies:

- `lucide-react`: Icons used by many components
- `class-variance-authority`: Utility for handling component variants
- `clsx`: Utility for conditionally joining CSS class names
- `tailwind-merge`: Utility for merging Tailwind CSS classes with conflict resolution

## Adding Custom Components to the Registry

To add your own components to the registry:
1. Create a component following the shadcn UI patterns
2. Add it to your local registry
3. Use the build command to generate the registry files

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure all dependencies are installed and aliases are properly configured
2. **CSS not applying**: Verify Tailwind CSS is properly configured and the globals.css file includes the base styles
3. **TypeScript errors**: Check that tsx option is properly set in components.json
4. **Dark mode not working**: Ensure cssVariables are enabled in components.json

### Updating Components

Components are stored locally in your project. To update a component:
1. Delete the component file from your local directory
2. Re-run the add command: `npx shadcn@latest add [component-name]`
3. Reapply any custom modifications you had made

### Removing Components

There is no built-in remove command, but you can:
1. Delete the component files from your project
2. Remove any imports in your code
3. Clean up any dependencies that are no longer needed