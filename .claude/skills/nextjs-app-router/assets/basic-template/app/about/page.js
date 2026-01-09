// app/about/page.js
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">
        This is an example of a static route using the App Router.
      </p>
      <p>
        The file structure determines the URL path. This page is located at <code>app/about/page.js</code> and is accessible at <code>/about</code>.
      </p>
    </div>
  )
}