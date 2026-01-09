// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Blog Post: {params.slug}</h1>
      <p className="mb-4">
        This is a dynamic route. The URL segment after <code>/blog/</code> becomes the <code>slug</code> parameter.
      </p>
      <p>
        You accessed this page with slug: <code>{params.slug}</code>
      </p>
    </div>
  )
}