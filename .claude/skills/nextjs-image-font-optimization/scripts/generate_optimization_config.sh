#!/bin/bash

# Script to generate Next.js image and font optimization configuration
# Usage: ./generate_optimization_config.sh <config-type> [options]

CONFIG_TYPE="$1"
OUTPUT_DIR="${2:-.}"

if [ -z "$CONFIG_TYPE" ]; then
  echo "Usage: $0 <config-type> [output-dir]"
  echo "Config types: next-config, google-fonts, local-fonts, image-placeholders"
  exit 1
fi

echo "Generating Next.js optimization configuration for: $CONFIG_TYPE"

case "$CONFIG_TYPE" in
  "next-config")
    CONFIG_FILE="$OUTPUT_DIR/next.config.js"
    cat > "$CONFIG_FILE" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configure remote image patterns for security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Additional image sizes for smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Preferred formats for optimization
    formats: ['image/webp', 'image/avif'],

    // Minimum cache TTL (in seconds)
    minimumCacheTTL: 60,

    // Disable optimization for specific cases (default: false)
    unoptimized: false,
  },

  // Experimental features
  experimental: {
    // Enable turbo pack (if using)
    turbo: process.env.VERCEL ? {} : undefined,
  },

  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations here
    return config
  },
}

module.exports = nextConfig
EOF
    echo "Created Next.js configuration at $CONFIG_FILE"
    ;;

  "google-fonts")
    FONT_FILE="$OUTPUT_DIR/lib/fonts.js"
    mkdir -p "$(dirname "$FONT_FILE")"
    cat > "$FONT_FILE" << 'EOF'
// lib/fonts.js
import { Inter, Roboto_Mono, Playfair_Display } from 'next/font/google'

// Default Inter font for body text
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font load
  variable: '--font-inter', // CSS variable name
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic']
})

// Monospace font for code
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
  weight: ['400', '700'],
})

// Display font for headings
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
  weight: 'variable', // For variable fonts
  axes: ['slnt'] // For variable axes
})

// Export font combinations
export const fontSets = {
  // Professional combination
  professional: {
    heading: playfairDisplay,
    body: inter,
    code: robotoMono
  },

  // Minimal combination
  minimal: {
    body: inter,
  }
}
EOF
    echo "Created Google Fonts configuration at $FONT_FILE"
    ;;

  "local-fonts")
    LOCAL_FONT_FILE="$OUTPUT_DIR/lib/local-fonts.js"
    mkdir -p "$(dirname "$LOCAL_FONT_FILE")"
    cat > "$LOCAL_FONT_FILE" << 'EOF'
// lib/local-fonts.js
import localFont from 'next/font/local'

// Custom heading font
export const customHeading = localFont({
  src: [
    {
      path: './fonts/Heading-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Heading-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Heading-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom-heading',
  display: 'swap',
})

// Custom body font
export const customBody = localFont({
  src: [
    {
      path: './fonts/Body-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Body-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Body-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom-body',
  display: 'swap',
})

// Icon font
export const iconFont = localFont({
  src: [
    {
      path: './fonts/Icons.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-icons',
  display: 'swap',
})

// Font combination for the site
export const localFontSet = {
  heading: customHeading,
  body: customBody,
  icons: iconFont
}
EOF
    echo "Created local fonts configuration at $LOCAL_FONT_FILE"
    ;;

  "image-placeholders")
    PLACEHOLDER_FILE="$OUTPUT_DIR/lib/image-placeholders.js"
    mkdir -p "$(dirname "$PLACEHOLDER_FILE")"
    cat > "$PLACEHOLDER_FILE" << 'EOF'
// lib/image-placeholders.js

// Generate SVG placeholder for images
export function generateSvgPlaceholder(width, height, bgColor = '#f0f0f0', fgColor = '#e0e0e0') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.8}" height="${height * 0.8}" fill="${fgColor}" rx="4"/>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Generate blur data URL for image placeholders
export function generateBlurDataUrl(imageSrc, width = 10, height = 10) {
  // This is a simplified version - in practice, you'd use a service
  // like Sharp or ImageMagick to generate actual blur data
  return generateSvgPlaceholder(width, height)
}

// Common placeholder sizes
export const PLACEHOLDER_SIZES = {
  thumbnail: generateSvgPlaceholder(100, 100),
  hero: generateSvgPlaceholder(1200, 600),
  avatar: generateSvgPlaceholder(64, 64),
  card: generateSvgPlaceholder(300, 200),
  banner: generateSvgPlaceholder(800, 400)
}

// Generate responsive image placeholder
export function generateResponsivePlaceholder(desktopWidth, desktopHeight, mobileWidth, mobileHeight) {
  return {
    desktop: generateSvgPlaceholder(desktopWidth, desktopHeight),
    mobile: generateSvgPlaceholder(mobileWidth, mobileHeight)
  }
}

// Color-based placeholder
export function generateColorPlaceholder(color) {
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `)}`
}
EOF
    echo "Created image placeholders configuration at $PLACEHOLDER_FILE"
    ;;

  *)
    echo "Unknown config type: $CONFIG_TYPE"
    echo "Available types: next-config, google-fonts, local-fonts, image-placeholders"
    exit 1
    ;;
esac

echo "Configuration generation completed successfully!"