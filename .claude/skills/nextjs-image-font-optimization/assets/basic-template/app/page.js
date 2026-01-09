// app/page.js
import Image from 'next/image'
import { inter } from './layout'

export default function HomePage() {
  return (
    <div className={`container mx-auto px-4 py-8 ${inter.className}`}>
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Next.js Image and Font Optimization</h1>
        <p className="text-lg text-gray-600">
          Example of optimized images and fonts in Next.js
        </p>
      </header>

      <main>
        {/* Hero image with priority optimization */}
        <section className="mb-12">
          <div className="relative w-full h-96 rounded-xl overflow-hidden">
            <Image
              src="/hero-image.jpg"
              alt="Hero Image"
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              style={{ objectFit: 'cover' }}
              className="transition-opacity duration-300"
            />
          </div>
          <h2 className="text-2xl font-semibold mt-4">Optimized Hero Image</h2>
          <p className="text-gray-600">
            This image uses Next.js Image component with priority loading and responsive sizing.
          </p>
        </section>

        {/* Product grid with optimized images */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Product Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative w-full h-48">
                  <Image
                    src={`/product-${item}.jpg`}
                    alt={`Product ${item}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
                        <rect width="400" height="300" fill="#f0f0f0"/>
                        <circle cx="200" cy="150" r="50" fill="#e0e0e0"/>
                      </svg>
                    `)}`}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">Product {item}</h3>
                  <p className="text-gray-600">Description of product {item} with optimized image loading.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-8 border-t">
        <p className="text-center text-gray-500">
          Page optimized with Next.js Image and Font optimization techniques
        </p>
      </footer>
    </div>
  )
}