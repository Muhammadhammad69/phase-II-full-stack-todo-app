// app/page.js
import ProductList from './product-list'
import { db } from '@/lib/db'

export default async function HomePage() {
  // Server Component - fetch data on the server
  const products = await db.products.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
      <p className="mb-8">Discover our latest products</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductList initialProducts={products} />
      </div>
    </div>
  )
}