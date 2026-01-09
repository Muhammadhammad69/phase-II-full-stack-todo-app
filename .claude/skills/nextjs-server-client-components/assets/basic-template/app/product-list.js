// app/product-list.js - Client Component
'use client'

import { useState } from 'react'

export default function ProductList({ initialProducts = [] }) {
  const [products] = useState(initialProducts)
  const [sortBy, setSortBy] = useState('name')

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1
    if (a[sortBy] > b[sortBy]) return 1
    return 0
  })

  return (
    <div className="product-list">
      <div className="controls mb-4">
        <label htmlFor="sort-select" className="mr-2">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="createdAt">Date Added</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedProducts.map(product => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}