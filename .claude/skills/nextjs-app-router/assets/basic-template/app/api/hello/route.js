// app/api/hello/route.js
export async function GET(request) {
  return Response.json({
    message: 'Hello from Next.js App Router API route!',
    timestamp: new Date().toISOString(),
    path: request.url
  })
}