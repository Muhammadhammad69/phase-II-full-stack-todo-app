#!/bin/bash

# Script to set up a new Next.js project with recommended configuration
# Usage: ./setup_nextjs_project.sh <project-name>

PROJECT_NAME="$1"

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: $0 <project-name>"
  exit 1
fi

echo "Setting up new Next.js project: $PROJECT_NAME"

# Create the project with create-next-app
npx create-next-app@latest "$PROJECT_NAME" \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd "$PROJECT_NAME" || exit 1

echo "Installing additional recommended dependencies..."

# Install additional useful dependencies
npm install --save-dev prettier prettier-plugin-tailwindcss

# Create prettier configuration
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

# Update package.json to include prettier script
npm pkg set scripts.format="prettier --write ."

echo "Next.js project '$PROJECT_NAME' set up successfully!"
echo ""
echo "Project includes:"
echo "- TypeScript"
echo "- Tailwind CSS"
echo "- ESLint"
echo "- App Router"
echo "- src/ directory"
echo "- @/* import alias"
echo "- Prettier with Tailwind plugin"
echo ""
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  npm run dev"
echo ""
echo "Your application will be available at http://localhost:3000"