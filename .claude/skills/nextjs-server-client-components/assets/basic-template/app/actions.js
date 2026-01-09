// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData) {
  const name = formData.get('name')
  const price = formData.get('price')
  const description = formData.get('description')

  // Validate input
  if (!name || !price) {
    return { error: 'Name and price are required' }
  }

  try {
    // Create product in database
    const product = await db.products.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        description: description?.trim() || ''
      }
    })

    // Revalidate the home page to show the new product
    revalidatePath('/')

    return { success: true, product }
  } catch (error) {
    console.error('Error adding product:', error)
    return { error: 'Failed to add product' }
  }
}