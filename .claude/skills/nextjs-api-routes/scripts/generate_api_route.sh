#!/bin/bash

# Script to generate Next.js API route patterns
# Usage: ./generate_api_route.sh <route-type> <route-name> [directory]

ROUTE_TYPE="$1"
ROUTE_NAME="$2"
DIRECTORY="${3:-app/api}"

if [ -z "$ROUTE_TYPE" ] || [ -z "$ROUTE_NAME" ]; then
  echo "Usage: $0 <route-type> <route-name> [directory]"
  echo "Route types: basic, crud, dynamic, auth, protected"
  echo "Default directory: app/api"
  exit 1
fi

echo "Generating Next.js API route for: $ROUTE_TYPE"

# Create directory structure
mkdir -p "$DIRECTORY/$ROUTE_NAME"

case "$ROUTE_TYPE" in
  "basic")
    ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/route.js"
    cat > "$ROUTE_FILE" << EOF
// $ROUTE_FILE
export async function GET(request) {
  try {
    // Fetch data
    const data = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').findAll()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to fetch $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return Response.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create resource
    const result = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').create(data)
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to create $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}
EOF
    echo "Created basic API route at $ROUTE_FILE"
    ;;

  "crud")
    ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/route.js"
    cat > "$ROUTE_FILE" << EOF
// $ROUTE_FILE - CRUD Operations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const offset = (page - 1) * limit
    const resources = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').findMany({
      skip: offset,
      take: limit
    })

    const total = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').count()

    return Response.json({
      data: resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to fetch $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validation
    if (!data.name) {
      return Response.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const resource = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').create(data)
    return Response.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to create $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

// Dynamic route for individual resource
mkdir -p "$DIRECTORY/$ROUTE_NAME/[id]"
DYNAMIC_ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/[id]/route.js"
cat > "$DYNAMIC_ROUTE_FILE" << 'EOF_DYNAMIC'
// $DYNAMIC_ROUTE_FILE
export async function GET(request, { params }) {
  try {
    const resource = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').findById(params.id)

    if (!resource) {
      return Response.json(
        { error: '$(echo $ROUTE_NAME) not found' },
        { status: 404 }
      )
    }

    return Response.json(resource)
  } catch (error) {
    console.error('Error fetching $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to fetch $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const resource = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').update(params.id, data)

    return Response.json(resource)
  } catch (error) {
    console.error('Error updating $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to update $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').delete(params.id)

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to delete $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}
EOF_DYNAMIC
    echo "Created CRUD API routes:"
    echo "  - GET/POST: $ROUTE_FILE"
    echo "  - GET/PUT/DELETE: $DYNAMIC_ROUTE_FILE"
    ;;

  "dynamic")
    mkdir -p "$DIRECTORY/$ROUTE_NAME/[id]"
    DYNAMIC_ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/[id]/route.js"
    cat > "$DYNAMIC_ROUTE_FILE" << EOF
// $DYNAMIC_ROUTE_FILE
export async function GET(request, { params }) {
  try {
    // Validate parameter
    if (!params.id || isNaN(parseInt(params.id))) {
      return Response.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      )
    }

    const resource = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').findById(parseInt(params.id))

    if (!resource) {
      return Response.json(
        { error: '$(echo $ROUTE_NAME) not found' },
        { status: 404 }
      )
    }

    return Response.json(resource)
  } catch (error) {
    console.error('Error fetching $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to fetch $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    // Validate parameter
    if (!params.id || isNaN(parseInt(params.id))) {
      return Response.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      )
    }

    const resource = await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').update(parseInt(params.id), data)

    return Response.json(resource)
  } catch (error) {
    console.error('Error updating $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to update $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    // Validate parameter
    if (!params.id || isNaN(parseInt(params.id))) {
      return Response.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      )
    }

    await db.$(echo $ROUTE_NAME | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]').delete(parseInt(params.id))

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting $(echo $ROUTE_NAME):', error)
    return Response.json(
      { error: 'Failed to delete $(echo $ROUTE_NAME)' },
      { status: 500 }
    )
  }
}
EOF
    echo "Created dynamic API route at $DYNAMIC_ROUTE_FILE"
    ;;

  "auth")
    ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/route.js"
    cat > "$ROUTE_FILE" << EOF
// $ROUTE_FILE - Authentication
import { generateToken, verifyToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await db.users.authenticate(email, password)

    if (!user) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    // Create response with token
    const response = Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })

    // Optionally set token in cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60, // 24 hours
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Authentication error:', error)
    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
EOF
    echo "Created authentication API route at $ROUTE_FILE"
    ;;

  "protected")
    ROUTE_FILE="$DIRECTORY/$ROUTE_NAME/route.js"
    cat > "$ROUTE_FILE" << EOF
// $ROUTE_FILE - Protected Route
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Verify token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from token
    const user = await db.users.findById(decoded.userId)

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Return protected data
    const data = await getProtectedData(decoded.userId)
    return Response.json(data)
  } catch (error) {
    console.error('Protected route error:', error)
    return Response.json(
      { error: 'Failed to access protected data' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Verify authorization (same as GET)
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Process protected operation
    const data = await request.json()
    const result = await createProtectedResource(data, decoded.userId)

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Protected POST error:', error)
    return Response.json(
      { error: 'Failed to create protected resource' },
      { status: 500 }
    )
  }
}
EOF
    echo "Created protected API route at $ROUTE_FILE"
    ;;

  *)
    echo "Unknown route type: $ROUTE_TYPE"
    echo "Available types: basic, crud, dynamic, auth, protected"
    exit 1
    ;;
esac

echo "API route generation completed successfully!"