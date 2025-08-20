import { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: "LinkHub - Free URL Shortener with Advanced Analytics | Best Link Management Tool 2025",
  description: "Create shortened URLs instantly with LinkHub's free URL shortener. Get advanced analytics, QR codes, geographic data, and real-time tracking. Perfect for businesses, marketers, and content creators. Start free today!",
  keywords: [
    "url shortener",
    "link shortener", 
    "free url shortener",
    "custom short links",
    "link analytics",
    "qr code generator",
    "link tracking",
    "click analytics",
    "link management",
    "short url",
    "bit.ly alternative",
    "tinyurl alternative",
    "link statistics",
    "utm tracking",
    "branded links",
    "business link shortener",
    "marketing tools",
    "social media links",
    "email marketing",
    "campaign tracking",
    "geo analytics",
    "device tracking",
    "referrer analytics",
    "real-time stats",
    "LinkHub",
    "2025"
  ],
  openGraph: {
    title: "LinkHub - Free URL Shortener with Advanced Analytics",
    description: "Create shortened URLs instantly with advanced analytics, QR codes, and real-time tracking. Perfect for businesses and marketers.",
    url: "https://golinkhub.vercel.app",
    siteName: "LinkHub",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "LinkHub - URL Shortener with Analytics"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkHub - Free URL Shortener with Advanced Analytics",
    description: "Create shortened URLs instantly with advanced analytics, QR codes, and real-time tracking.",
    images: ["/placeholder-logo.png"],
    creator: "@LinkHub"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://golinkhub.vercel.app"
  },
  category: "technology",
}

export default function HomePage() {
  return <HomePageClient />
}
