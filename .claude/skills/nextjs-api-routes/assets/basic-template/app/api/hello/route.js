// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: 'Hello, Next.js API Route!' })
}

export async function POST(request) {
  const data = await request.json()
  return Response.json({
    message: 'Received your data!',
    received: data
  }, { status: 201 })
}