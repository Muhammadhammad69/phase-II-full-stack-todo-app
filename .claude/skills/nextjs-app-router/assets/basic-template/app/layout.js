// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Next.js App Router Template',
  description: 'A basic template for Next.js App Router',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-gray-800 text-white p-4">
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/about" className="hover:underline">About</a></li>
              <li><a href="/blog" className="hover:underline">Blog</a></li>
            </ul>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer className="bg-gray-200 p-4 mt-8">
          <p>© 2023 Next.js App Router Template</p>
        </footer>
      </body>
    </html>
  )
}