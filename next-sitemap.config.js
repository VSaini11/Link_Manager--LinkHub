/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://golinkhub.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/dashboard/*',
    '/_*',
    '/login',
    '/signup',
    '/admin/*'
  ],
  additionalPaths: async (config) => [
    await config.transform(config, '/', {
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
    }),
    await config.transform(config, '/features', {
      priority: 0.9,
      changefreq: 'weekly',
    }),
    await config.transform(config, '/pricing', {
      priority: 0.8,
      changefreq: 'weekly',
    }),
    await config.transform(config, '/about', {
      priority: 0.7,
      changefreq: 'monthly',
    }),
    await config.transform(config, '/help', {
      priority: 0.8,
      changefreq: 'weekly',
    }),
    await config.transform(config, '/blog', {
      priority: 0.9,
      changefreq: 'daily',
    }),
    await config.transform(config, '/reviews', {
      priority: 0.8,
      changefreq: 'daily',
    }),
    await config.transform(config, '/contact', {
      priority: 0.6,
      changefreq: 'monthly',
    }),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/login',
          '/signup',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/private/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://linkhub.vercel.app'}/sitemap.xml`,
    ],
  },
  trailingSlash: false,
  output: 'standalone',
}
