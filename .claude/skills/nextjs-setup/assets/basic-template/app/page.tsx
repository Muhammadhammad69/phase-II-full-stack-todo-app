// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Next.js!
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Get started by editing <code className="bg-gray-100 px-2 py-1 rounded-md text-sm">app/page.tsx</code>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Documentation</h2>
            <p className="text-gray-600">Find detailed information about Next.js features and API.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Learn</h2>
            <p className="text-gray-600">Learn about Next.js in an interactive course with quizzes.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Deploy</h2>
            <p className="text-gray-600">Instantly deploy your Next.js site to a shareable URL.</p>
          </div>
        </div>
      </div>
    </main>
  )
}