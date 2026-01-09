#!/bin/bash

# Script to initialize a new Next.js project
# Usage: ./init_nextjs_project.sh <project-name> [template]

PROJECT_NAME="$1"
TEMPLATE="${2:-app}" # Default to 'app' router

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: $0 <project-name> [template]"
  echo "Templates: app (default), pages, default"
  exit 1
fi

echo "Creating new Next.js project: $PROJECT_NAME"
echo "Using template: $TEMPLATE"

# Create the project
npx create-next-app@latest "$PROJECT_NAME" \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

echo "Next.js project '$PROJECT_NAME' created successfully!"
echo ""
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  npm run dev"
echo ""
echo "Your application will be available at http://localhost:3000"