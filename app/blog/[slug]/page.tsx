import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Tag, User } from 'lucide-react';
import BlogPostStructuredData from '@/components/BlogPostStructuredData';

// Fetch individual blog post
async function getBlogPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app';
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getBlogPost(params.slug);
  const post = data?.post;
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.featuredImage || '/placeholder-blog.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage || '/placeholder-blog.jpg'],
    },
  };
}

function formatDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const data = await getBlogPost(params.slug);
  
  if (!data) {
    notFound();
  }

  const { post, relatedPosts } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <BlogPostStructuredData post={post} />
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Back to Blog */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-blue-600 hover:text-blue-700">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags?.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime || 5} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {(post.views || 0).toLocaleString()} views
            </div>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Like ({post.likes || 0})
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-700"
          />
        </article>

        <Separator className="my-12" />

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost: any) => (
                <Card key={relatedPost._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <Badge variant="outline" className="text-xs mb-3">{relatedPost.category}</Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-500">
                      {formatDate(relatedPost.publishedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-16 p-8 bg-blue-50 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to optimize your links?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start using LinkHub's advanced URL shortening platform to track your campaigns, 
            understand your audience, and boost your marketing performance.
          </p>
          <Button asChild size="lg">
            <Link href="/">Get Started Free</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
