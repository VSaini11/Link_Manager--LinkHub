import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, User } from 'lucide-react';
import BlogPostStructuredData from '@/components/BlogPostStructuredData';
import Navigation from '@/components/Navigation';

async function getBlogPost(slug: string) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app');
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 3600 }
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogPost(slug);
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBlogPost(slug);
  
  if (!data) {
    notFound();
  }

  const { post, relatedPosts } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <BlogPostStructuredData post={post} />
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 w-full">
        {/* Back to Blog */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <Link href="/blog" className="flex items-center gap-2 font-semibold text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-12 border border-slate-200 shadow-sm">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{post.category}</Badge>
              {post.tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs border-slate-200 text-slate-600">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-500 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <User className="h-4 w-4 text-indigo-600" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {post.readTime || 5} min read
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                {(post.views || 0).toLocaleString()} views
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-slate prose-lg max-w-none mb-8">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="prose-headings:font-heading prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-a:text-indigo-600 hover:prose-a:text-indigo-700"
            />
          </article>

          {/* Social Share */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
              <Heart className="h-4 w-4 text-rose-500" />
              Like ({post.likes || 0})
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
              <Share2 className="h-4 w-4 text-indigo-600" />
              Share
            </Button>
          </div>
        </div>

        <Separator className="my-12 bg-slate-200" />

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost: any) => (
                <Card key={relatedPost._id} className="overflow-hidden glass-card rounded-2xl card-hover border border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <Badge className="text-xs mb-3 bg-indigo-50 text-indigo-700 border-indigo-100">{relatedPost.category}</Badge>
                    <h3 className="text-lg font-heading font-bold text-slate-900 mb-2 hover:text-indigo-600 transition-colors">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-slate-400">
                      {formatDate(relatedPost.publishedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-16 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">
            Ready to optimize your links & track ₹ revenue?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Start using LinkHub&apos;s URL shortening platform to track your campaigns, filter ad-fraud bots, and attribute sales.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-8 py-3 rounded-xl">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
