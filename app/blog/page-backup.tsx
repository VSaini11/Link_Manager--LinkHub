import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Eye, Search, Tag } from 'lucide-react';

// Fetch blog posts from API
async function getBlogPosts() {
  try {
    // For development, try localhost first
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app');
    
    const response = await fetch(`${baseUrl}/api/blog?limit=20`, {
      next: { revalidate: 60 }, // Revalidate every minute for fresh content
      cache: 'no-store' // Don't cache for immediate updates
    });
    
    if (!response.ok) {
      console.warn(`Blog API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch blog posts: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return empty state for graceful degradation
    return { 
      posts: [], 
      categories: ['All', 'SEO', 'Analytics', 'Marketing', 'Link Management'], 
      pagination: { 
        total: 0, 
        page: 1, 
        pages: 0, 
        limit: 20 
      } 
    };
  }
}

export const metadata: Metadata = {
  title: 'Blog - URL Shortening Tips, Analytics Insights & Marketing Strategies',
  description: 'Discover expert insights on URL shortening, link analytics, digital marketing strategies, and SEO optimization. Learn how to maximize your link performance with LinkHub.',
  keywords: [
    'URL shortening blog',
    'link analytics tips',
    'digital marketing blog',
    'SEO optimization',
    'link management strategies',
    'QR code marketing',
    'traffic analysis',
    'conversion optimization'
  ],
  openGraph: {
    title: 'LinkHub Blog - URL Shortening & Analytics Insights',
    description: 'Expert insights on URL shortening, link analytics, and digital marketing strategies.',
    type: 'website',
  },
};

function formatDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

export default async function BlogPage() {
  const { posts, categories } = await getBlogPosts();
  
  const featuredPost = posts.find((post: any) => post.featured) || posts[0];
  const recentPosts = posts.filter((post: any) => post._id !== featuredPost?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            LinkHub <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover expert insights on URL shortening, link analytics, digital marketing strategies, 
            and SEO optimization to maximize your link performance.
          </p>
          
          {/* Submit Blog Post Button */}
          <div className="mb-6">
            <Link href="/blog/submit">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Submit Your Blog Post
              </Button>
            </Link>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 w-full md:w-80"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...categories].map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* No Posts Message */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Blog Posts Yet</h2>
              <p className="text-gray-600 mb-8">
                We're working on creating amazing content for you. Check back soon for expert insights 
                on URL shortening, analytics, and digital marketing strategies.
              </p>
              <Button asChild>
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={featuredPost.featuredImage || '/placeholder-blog.jpg'} 
                        alt={featuredPost.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{featuredPost.category}</Badge>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${featuredPost.slug}`}>
                          {featuredPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {featuredPost.readTime || 5} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {(featuredPost.views || 0).toLocaleString()} views
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/blog/${featuredPost.slug}`}>
                            Read More
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Recent Posts Grid */}
            {recentPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post: any) => (
                    <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featuredImage || '/placeholder-blog.jpg'} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{post.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 leading-relaxed">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime || 5}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views || 0}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {post.tags?.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
