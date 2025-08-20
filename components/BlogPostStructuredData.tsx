interface BlogPostStructuredDataProps {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    tags: string[];
    publishedAt: string;
    views?: number;
    readTime?: number;
    featuredImage?: string;
  };
}

export default function BlogPostStructuredData({ post }: BlogPostStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app';
  
  const structuredData = {
    "@context": "https://schema.org",
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
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/placeholder-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "image": {
      "@type": "ImageObject",
      "url": post.featuredImage || `${baseUrl}/placeholder-blog.jpg`,
      "width": 1200,
      "height": 630
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "wordCount": post.content?.replace(/<[^>]*>/g, '').split(' ').length || 0,
    "timeRequired": `PT${post.readTime || 5}M`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReadAction",
      "userInteractionCount": post.views || 0
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
