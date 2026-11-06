'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, CalendarDays, Clock, Eye, Sparkles, TrendingUp, Tag, FileText, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  featured?: boolean;
  views?: number;
}

interface BlogData {
  posts: BlogPost[];
  categories: string[];
}

export default function BlogPageClient({ initialData }: { initialData: BlogData }) {
  const [blogData, setBlogData] = useState<BlogData>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedPostContent, setSelectedPostContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/blog?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBlogData(prev => ({ ...prev, posts: data.posts }));
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleReadMore = async (post: BlogPost) => {
    setSelectedPost(post);
    setLoadingContent(true);
    try {
      const response = await fetch(`/api/blog/${post.slug}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPostContent(data.post.content);
      }
    } catch (error) {
      console.error('Error fetching post content:', error);
      setSelectedPostContent('<p>Error loading content.</p>');
    } finally {
      setLoadingContent(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredPosts = blogData.posts;
  const featuredPosts = filteredPosts.filter((post: BlogPost) => post.featured);
  const recentPosts = filteredPosts.filter((post: BlogPost) => !post.featured);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 w-full">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-5 border border-indigo-100 text-indigo-600 shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 mb-5 tracking-tight">
            LinkHub <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Insights on link management, analytics tracking, SEO strategies, and digital branding.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-7 py-3 rounded-xl shadow-md shadow-indigo-600/20">
            <Link href="/blog/submit">Submit a Guest Post</Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('All')}
                className={selectedCategory === 'All' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
              >
                All
              </Button>
              {blogData.categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-500 text-sm mt-4">Loading articles...</p>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                    Featured Articles
                  </h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden glass-card rounded-2xl card-hover border border-slate-200 bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{post.category}</Badge>
                          <Badge className="bg-amber-100 text-amber-800 border-none">Featured</Badge>
                        </div>
                        <CardTitle className="text-xl font-heading font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min read
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs py-1.5 h-8">
                            <Link href={`/blog/${post.slug}`}>
                              Read Article
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-8"
                                onClick={() => handleReadMore(post)}
                              >
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden modal-content bg-white border-slate-200 shadow-2xl">
                              <DialogHeader className="border-b border-slate-100 pb-4 text-left">
                                <DialogTitle className="text-slate-900 text-xl font-heading font-bold">
                                  {selectedPost?.title}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500">
                                  {selectedPost?.excerpt}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto p-6 max-h-[55vh]">
                                {loadingContent ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                  </div>
                                ) : (
                                  <div 
                                    className="prose prose-slate max-w-none text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: selectedPostContent }}
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  {searchTerm || selectedCategory !== 'All' ? 'Filtered Articles' : 'Latest Articles'}
                </h2>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </Badge>
              </div>

              {recentPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-heading font-bold text-slate-900 mb-1">No articles found</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No articles match the selected category'}
                  </p>
                  {(searchTerm || selectedCategory !== 'All') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden glass-card rounded-2xl card-hover border border-slate-200 bg-white flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <Badge className="w-fit mb-2 bg-indigo-50 text-indigo-700 border-indigo-100">{post.category}</Badge>
                        <CardTitle className="text-base font-heading font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-600 line-clamp-3 text-xs leading-relaxed">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-2">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>{post.readTime} min read</span>
                        </div>
                        <Button asChild size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs">
                          <Link href={`/blog/${post.slug}`}>
                            Read Story
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* CTA Section */}
        <section className="mt-20 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mb-3">
            Start shortening links for free today
          </h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Join thousands of marketers and developers who rely on LinkHub for crisp link management.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-8 py-3 rounded-xl shadow-md shadow-indigo-600/20">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
