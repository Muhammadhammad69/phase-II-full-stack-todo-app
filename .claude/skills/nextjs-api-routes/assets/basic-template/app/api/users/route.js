// app/api/users/route.js
export async function GET(request) {
  try {
    const users = await db.users.findAll()
    return Response.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validate input
    if (!data.email || !data.name) {
      return Response.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Create user
    const user = await db.users.create(data)
    return Response.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}