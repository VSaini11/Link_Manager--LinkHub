'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, Clock, Eye, Search, Tag, FileText, Sparkles, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';

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

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

interface BlogPageClientProps {
  initialData: BlogData;
}

export default function BlogPageClient({ initialData }: BlogPageClientProps) {
  const [blogData, setBlogData] = useState<BlogData>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedPostContent, setSelectedPostContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Handle post content loading for modal
  const handleReadMore = async (post: BlogPost) => {
    setSelectedPost(post);
    setLoadingContent(true);
    
    try {
      const response = await fetch(`/api/blog/${post.slug}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPostContent(data.post.content);
      } else {
        setSelectedPostContent('<p>Error loading content. Please try again.</p>');
      }
    } catch (error) {
      console.error('Error loading post content:', error);
      setSelectedPostContent('<p>Error loading content. Please try again.</p>');
    } finally {
      setLoadingContent(false);
    }
  };

  // Filter posts based on search and category
  const filteredPosts = blogData.posts.filter((post: BlogPost) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter((post: BlogPost) => post.featured);
  const recentPosts = filteredPosts.filter((post: BlogPost) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-6 border border-purple-500/30">
            <FileText className="h-8 w-8 text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            LinkHub <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
            Discover expert insights on URL shortening, link analytics, digital marketing 
            strategies, and SEO optimization to maximize your link performance.
          </p>
          <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-purple-300 transition-all duration-300">
            <Link href="/blog/submit">Submit Your Blog Post</Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('All')}
                className={selectedCategory === 'All' ? 'bg-white text-purple-900 hover:bg-purple-50' : 'border-white/30 text-white hover:bg-white/10 hover:text-white'}
              >
                All
              </Button>
              {blogData.categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-white text-purple-900 hover:bg-purple-50' : 'border-white/30 text-white hover:bg-white/10 hover:text-white'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading articles...</p>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                    Featured Articles
                  </h2>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">Featured</Badge>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group border border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{post.category}</Badge>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">Featured</Badge>
                        </div>
                        <CardTitle className="text-xl text-white hover:text-purple-300 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-purple-200 line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-purple-300 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Button asChild className="bg-white text-purple-900 hover:bg-purple-50 font-semibold">
                            <Link href={`/blog/${post.slug}`}>
                              Read Article
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => handleReadMore(post)}
                              >
                                Quick Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden modal-content bg-slate-900/95 backdrop-blur-lg border-purple-500/30 shadow-2xl shadow-purple-500/20">
                              <DialogHeader className="border-b border-purple-500/30 pb-4">
                                <DialogTitle className="text-white text-xl">
                                  {selectedPost?.title}
                                </DialogTitle>
                                <DialogDescription className="text-purple-200">
                                  {selectedPost?.excerpt}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto p-6 bg-slate-900/95">
                                {loadingContent ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                                    <span className="ml-3 text-purple-200">Loading content...</span>
                                  </div>
                                ) : (
                                  <div 
                                    className="prose prose-invert prose-purple max-w-none prose-headings:text-white prose-p:text-purple-100 prose-li:text-purple-100 prose-strong:text-white"
                                    dangerouslySetInnerHTML={{ __html: selectedPostContent }}
                                  />
                                )}
                              </div>
                              <div className="border-t border-purple-500/30 pt-4 flex justify-end">
                                <Button asChild className="bg-white text-purple-900 hover:bg-purple-50 font-semibold">
                                  <Link href={`/blog/${selectedPost?.slug}`}>
                                    Read Full Article
                                  </Link>
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                  {searchTerm || selectedCategory !== 'All' ? 'Filtered Articles' : 'Latest Articles'}
                </h2>
                <Badge className="bg-white/10 text-white border-white/30">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </Badge>
              </div>

              {recentPosts.length === 0 ? (
                <div className="text-center py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                  <FileText className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                  <p className="text-purple-200 mb-6">
                    {searchTerm ? 'Try adjusting your search terms' : 'No articles match the selected filters'}
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group border border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15">
                      <CardHeader>
                        <Badge className="w-fit mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30">{post.category}</Badge>
                        <CardTitle className="text-lg text-white hover:text-purple-300 transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-purple-200 line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-purple-300 mb-4">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>
                        <Button asChild size="sm" className="w-full bg-white text-purple-900 hover:bg-purple-50 font-semibold">
                          <Link href={`/blog/${post.slug}`}>
                            Read More
                          </Link>
                        </Button>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} className="bg-white/10 text-purple-300 border-white/30 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* CTA Section */}
        <section className="mt-20 p-8 bg-blue-50 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start shortening your links today
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of users who trust LinkHub for their URL shortening and link management needs.
          </p>
          <Button asChild size="lg">
            <Link href="/">Get Started Free</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
