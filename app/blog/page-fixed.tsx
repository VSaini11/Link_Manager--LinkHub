import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import BlogStructuredData from '@/components/BlogStructuredData';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  readTime: number;
  views: number;
  likes: number;
  publishedAt: string;
  createdAt: string;
}

interface BlogData {
  posts: BlogPost[];
  categories: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fetch blog data on the server
async function getBlogData(): Promise<BlogData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app';
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error(`Blog API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch blog data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog data:', error);
    // Return empty state for graceful degradation
    return { 
      posts: [], 
      categories: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    };
  }
}

export const metadata: Metadata = {
  title: 'Blog - LinkHub URL Shortener | Tips, Tutorials & Insights',
  description: 'Discover expert insights, tutorials, and best practices for URL shortening, link management, and digital marketing strategies with LinkHub.',
  keywords: [
    'LinkHub blog',
    'URL shortening tips',
    'link management tutorials',
    'digital marketing insights',
    'link tracking strategies',
    'URL shortener best practices',
    'marketing analytics',
    'link optimization'
  ],
  authors: [{ name: 'LinkHub Team' }],
  openGraph: {
    title: 'Blog - LinkHub URL Shortener | Tips, Tutorials & Insights',
    description: 'Discover expert insights, tutorials, and best practices for URL shortening, link management, and digital marketing strategies.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/placeholder-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'LinkHub Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - LinkHub URL Shortener',
    description: 'Expert insights, tutorials, and best practices for URL shortening and link management.',
    images: ['/placeholder-blog.jpg'],
  },
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const blogData = await getBlogData();

  return (
    <>
      <BlogStructuredData posts={blogData.posts} />
      <BlogPageClient initialData={blogData} />
    </>
  );
}
