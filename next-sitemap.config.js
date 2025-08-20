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
  additionalPaths: async (config) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://golinkhub.vercel.app';
    const staticPaths = [
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
    ];

    // Fetch blog posts dynamically
    try {
      const response = await fetch(`${baseUrl}/api/blog`);
      if (response.ok) {
        const data = await response.json();
        const blogPaths = data.posts?.map((post) =>
          config.transform(config, `/blog/${post.slug}`, {
            priority: 0.7,
            changefreq: 'monthly',
            lastmod: new Date(post.publishedAt || post.createdAt).toISOString(),
          })
        ) || [];
        
        return [...staticPaths, ...(await Promise.all(blogPaths))];
      }
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    return staticPaths;
  },
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
