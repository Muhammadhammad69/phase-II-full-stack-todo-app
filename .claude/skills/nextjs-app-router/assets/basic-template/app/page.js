// app/page.js
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Next.js App Router</h1>

      <p className="mb-6">
        This is a basic template demonstrating the App Router and file-based routing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Routing</h2>
          <p>File-based routing with dynamic segments</p>
          <Link href="/docs/introduction" className="text-blue-600 hover:underline mt-2 inline-block">
            Learn more
          </Link>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Layouts</h2>
          <p>Shared UI that persists across routes</p>
          <Link href="/docs/layouts" className="text-blue-600 hover:underline mt-2 inline-block">
            Learn more
          </Link>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">API Routes</h2>
          <p>Create API endpoints with route handlers</p>
          <Link href="/api/hello" className="text-blue-600 hover:underline mt-2 inline-block">
            Try API
          </Link>
        </div>
      </div>
    </div>
  )
}