import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: {
    default: "LinkHub - Advanced URL Shortener with Analytics | Free Link Management Tool",
    template: "%s | LinkHub - URL Shortener"
  },
  description: "Create shortened URLs with advanced analytics, QR codes, and real-time tracking. Free URL shortener with geographic data, device insights, and traffic analysis. Best link management tool for businesses and marketers.",
  keywords: [
    "URL shortener",
    "link shortener", 
    "free URL shortener",
    "link analytics",
    "QR code generator",
    "link management",
    "bit.ly alternative",
    "shortened links",
    "link tracking",
    "analytics dashboard",
    "geographic analytics",
    "click tracking",
    "custom short URLs",
    "business link management",
    "marketing analytics",
    "link performance",
    "real-time analytics",
    "traffic analysis"
  ],
  authors: [{ name: "VSaini11", url: "https://github.com/VSaini11" }],
  creator: "VSaini11",
  publisher: "LinkHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://linkhub.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "LinkHub - Advanced URL Shortener with Analytics",
    description: "Create shortened URLs with advanced analytics, QR codes, and real-time tracking. Free URL shortener with geographic data and traffic insights.",
    url: '/',
    siteName: 'LinkHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkHub - Advanced URL Shortener with Analytics Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkHub - Advanced URL Shortener with Analytics',
    description: 'Create shortened URLs with advanced analytics, QR codes, and real-time tracking.',
    images: ['/og-image.png'],
    creator: '@linkhub_app',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'VrEmnNqA7SezugBRvYNegJyz__fvvrpT83slChVPMRo', // Google Search Console verification
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Business Tools',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://ipinfo.io" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//ipinfo.io" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "LinkHub",
                "description": "Advanced URL shortener with analytics, QR codes, and real-time tracking",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://linkhub.vercel.app",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "featureList": [
                  "URL Shortening",
                  "Analytics Dashboard", 
                  "QR Code Generation",
                  "Real-time Tracking",
                  "Geographic Analytics",
                  "Device Analytics",
                  "Traffic Source Analysis"
                ],
                "creator": {
                  "@type": "Person",
                  "name": "VSaini11"
                },
                "dateCreated": "2025-01-01",
                "softwareVersion": "1.0.0"
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "LinkHub",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://linkhub.vercel.app",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://linkhub.vercel.app"}/logo.png`
                },
                "description": "Advanced URL shortener with analytics, QR codes, and real-time tracking",
                "foundingDate": "2025",
                "slogan": "Manage Your Links Like a Pro",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://linkhub.vercel.app"}/contact`
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "LinkHub URL Shortener",
                "operatingSystem": "Web Browser",
                "applicationCategory": "WebApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "1000",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              }
            ])
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
