import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app'
  
  const robots = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /reviews
Allow: /features
Allow: /pricing
Allow: /help
Disallow: /api/
Disallow: /dashboard/
Disallow: /login
Disallow: /signup
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

User-agent: Googlebot
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /reviews
Allow: /features
Allow: /pricing
Allow: /help
Disallow: /api/
Disallow: /dashboard/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
