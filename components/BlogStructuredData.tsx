interface BlogStructuredDataProps {
  posts: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    category: string;
    tags: string[];
    publishedAt: string;
    createdAt: string;
  }>;
}

export default function BlogStructuredData({ posts }: BlogStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "LinkHub Blog",
    "description": "Expert insights, tutorials, and best practices for URL shortening, link management, and digital marketing strategies.",
    "url": `${baseUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "LinkHub",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/placeholder-logo.png`
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${baseUrl}/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "LinkHub",
        "url": baseUrl
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${post.slug}`
      },
      "keywords": post.tags.join(", "),
      "articleSection": post.category
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
