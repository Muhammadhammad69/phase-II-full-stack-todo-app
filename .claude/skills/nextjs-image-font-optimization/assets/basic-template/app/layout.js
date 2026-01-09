// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'

// Configure Inter font with optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font load
  variable: '--font-inter', // CSS variable for custom usage
})

export const metadata = {
  title: 'Next.js Image and Font Optimization',
  description: 'Example of image and font optimization in Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}