#!/bin/bash

# Script to generate a Next.js App Router route structure
# Usage: ./generate_route_structure.sh <base-path> <route-type> [options]

BASE_PATH="$1"
ROUTE_TYPE="$2"
ROUTE_NAME="$3"

if [ -z "$BASE_PATH" ] || [ -z "$ROUTE_TYPE" ]; then
  echo "Usage: $0 <base-path> <route-type> [route-name]"
  echo "Route types: basic, dynamic, catch-all, optional-catch-all, grouped"
  exit 1
fi

echo "Generating Next.js App Router structure for: $ROUTE_TYPE"

case "$ROUTE_TYPE" in
  "basic")
    mkdir -p "$BASE_PATH"
    cat > "$BASE_PATH/page.js" << EOF
export default function ${ROUTE_NAME:-Page}() {
  return (
    <div>
      <h1>${ROUTE_NAME:-Basic Page}</h1>
      <p>This is a basic page route.</p>
    </div>
  )
}
EOF
    echo "Created basic route at $BASE_PATH/page.js"
    ;;

  "dynamic")
    if [ -z "$ROUTE_NAME" ]; then
      echo "Dynamic routes require a route name (e.g., 'id', 'slug')"
      exit 1
    fi
    mkdir -p "$BASE_PATH/[$ROUTE_NAME]"
    cat > "$BASE_PATH/[$ROUTE_NAME]/page.js" << EOF
export default function DynamicPage({ params }) {
  return (
    <div>
      <h1>Dynamic Page: {params.$ROUTE_NAME}</h1>
      <p>This page receives a dynamic parameter: {params.$ROUTE_NAME}</p>
    </div>
  )
}
EOF
    echo "Created dynamic route at $BASE_PATH/[$ROUTE_NAME]/page.js"
    ;;

  "catch-all")
    if [ -z "$ROUTE_NAME" ]; then
      echo "Catch-all routes require a route name (e.g., 'slug')"
      exit 1
    fi
    mkdir -p "$BASE_PATH/[...$ROUTE_NAME]"
    cat > "$BASE_PATH/[...$ROUTE_NAME]/page.js" << EOF
export default function CatchAllPage({ params }) {
  const path = params.$ROUTE_NAME.join('/')
  return (
    <div>
      <h1>Catch-All Route</h1>
      <p>Path segments: {path}</p>
    </div>
  )
}
EOF
    echo "Created catch-all route at $BASE_PATH/[...$ROUTE_NAME]/page.js"
    ;;

  "optional-catch-all")
    if [ -z "$ROUTE_NAME" ]; then
      echo "Optional catch-all routes require a route name (e.g., 'slug')"
      exit 1
    fi
    mkdir -p "$BASE_PATH/[[...$ROUTE_NAME]]"
    cat > "$BASE_PATH/[[...$ROUTE_NAME]]/page.js" << EOF
export default function OptionalCatchAllPage({ params }) {
  const path = params.$ROUTE_NAME ? params.$ROUTE_NAME.join('/') : 'root'
  return (
    <div>
      <h1>Optional Catch-All Route</h1>
      <p>Path: {path}</p>
    </div>
  )
}
EOF
    echo "Created optional catch-all route at $BASE_PATH/[[...$ROUTE_NAME]]/page.js"
    ;;

  "grouped")
    if [ -z "$ROUTE_NAME" ]; then
      echo "Grouped routes require a group name"
      exit 1
    fi
    mkdir -p "$BASE_PATH/($ROUTE_NAME)"
    cat > "$BASE_PATH/($ROUTE_NAME)/layout.js" << EOF
export default function ${ROUTE_NAME^}Layout({ children }) {
  return (
    <div className="$ROUTE_NAME-layout">
      <header>${ROUTE_NAME^} Section</header>
      <main>{children}</main>
    </div>
  )
}
EOF
    cat > "$BASE_PATH/($ROUTE_NAME)/page.js" << EOF
export default function ${ROUTE_NAME^}Page() {
  return (
    <div>
      <h1>${ROUTE_NAME^} Group Page</h1>
      <p>This page is part of the $ROUTE_NAME group.</p>
    </div>
  )
}
EOF
    echo "Created grouped route structure at $BASE_PATH/($ROUTE_NAME)/"
    ;;

  *)
    echo "Unknown route type: $ROUTE_TYPE"
    echo "Available types: basic, dynamic, catch-all, optional-catch-all, grouped"
    exit 1
    ;;
esac

echo "Route structure generated successfully!"