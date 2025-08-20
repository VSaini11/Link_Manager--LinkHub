'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, Clock, Eye, Search, Tag, FileText } from 'lucide-react';

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

export default function BlogPage() {
  const [blogData, setBlogData] = useState<BlogData>({
    posts: [],
    categories: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedPostContent, setSelectedPostContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog?limit=20');
      
      if (response.ok) {
        const data = await response.json();
        setBlogData(data);
      } else {
        console.error('Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullBlogContent = async (blogSlug: string) => {
    try {
      setLoadingContent(true);
      console.log(`🔍 Fetching content for blog slug: ${blogSlug}`);
      
      const response = await fetch(`/api/blog/${blogSlug}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📖 Blog content loaded:`, data.post);
        setSelectedPostContent(data.post.content || 'No content available');
      } else {
        console.error('Failed to fetch blog content:', response.status);
        setSelectedPostContent('Failed to load content');
      }
    } catch (error) {
      console.error('Error fetching blog content:', error);
      setSelectedPostContent('Error loading content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleReadMore = (post: BlogPost) => {
    setSelectedPost(post);
    setSelectedPostContent('');
    fetchFullBlogContent(post.slug);
  };

  // Filter posts based on search and category
  const filteredPosts = blogData.posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const recentPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            LinkHub <span className="gradient-text bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Discover expert insights on URL shortening, link analytics, digital marketing strategies, 
            and SEO optimization to maximize your link performance.
          </p>
          
          {/* Submit Blog Post Button */}
          <div className="mb-6">
            <Link href="/blog/submit">
              <Button className="bg-white text-purple-900 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-300">
                Submit Your Blog Post
              </Button>
            </Link>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 w-full md:w-80 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...blogData.categories].map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  className={category === selectedCategory 
                    ? "bg-white text-purple-900 hover:bg-purple-50 border-0 font-semibold" 
                    : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <p className="mt-4 text-purple-200">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No blog posts found</h3>
            <p className="text-slate-300 mb-6">
              {searchTerm || selectedCategory !== 'All' 
                ? "Try adjusting your search or filter criteria." 
                : "Be the first to share your insights with the community!"
              }
            </p>
            <Link href="/blog/submit">
              <Button className="bg-white text-purple-900 hover:bg-purple-50 font-semibold">Submit the First Post</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
                <div className="space-y-6">
                  {featuredPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden bg-slate-800 border-slate-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900">
                            <Tag className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">{post.category}</Badge>
                          <span className="text-sm text-slate-400">•</span>
                          <span className="text-sm text-slate-400">{formatDate(post.publishedAt)}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 hover:text-purple-300 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-300 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime || 5} min read
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {(post.views || 0).toLocaleString()} views
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => handleReadMore(post)}
                                className="bg-white text-purple-900 hover:bg-purple-50 font-semibold"
                              >
                                Read More
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden modal-content bg-slate-900 border-slate-700">
                              <DialogHeader className="border-b border-slate-700 pb-4">
                                <DialogTitle className="text-2xl font-bold text-white">{selectedPost?.title}</DialogTitle>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium text-purple-300">{selectedPost?.author}</span>
                                  </span>
                                  <span>•</span>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">{selectedPost?.category}</Badge>
                                  <span>•</span>
                                  <span>{selectedPost ? formatDate(selectedPost.publishedAt) : ''}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {selectedPost?.readTime || 5} min read
                                  </span>
                                </div>
                              </DialogHeader>
                              <div className="overflow-y-auto max-h-[65vh] mt-6 pr-2">
                                <div className="prose-modal">
                                  <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                                    {selectedPost?.content}
                                  </div>
                                </div>
                                {selectedPost?.tags && selectedPost.tags.length > 0 && (
                                  <div className="mt-8 pt-6 border-t border-slate-700">
                                    <h4 className="font-semibold mb-3 text-white">Tags:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedPost.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Posts Grid */}
            {recentPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Recent Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden bg-slate-800 border-slate-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{post.category}</Badge>
                          <span className="text-xs text-slate-400">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-tight text-white hover:text-purple-300 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 leading-relaxed text-slate-300">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
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
                              <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500" 
                              onClick={() => handleReadMore(post)}
                            >
                              Read More
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden modal-content bg-slate-900 border-slate-700">
                            <DialogHeader className="border-b border-slate-700 pb-4">
                              <DialogTitle className="text-2xl font-bold text-white">{selectedPost?.title}</DialogTitle>
                              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium text-purple-300">{selectedPost?.author}</span>
                                </span>
                                <span>•</span>
                                <Badge variant="outline" className="border-slate-600 text-slate-300">{selectedPost?.category}</Badge>
                                <span>•</span>
                                <span>{selectedPost ? formatDate(selectedPost.publishedAt) : ''}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {selectedPost?.readTime || 5} min read
                                </span>
                              </div>
                            </DialogHeader>
                            <div className="overflow-y-auto max-h-[65vh] mt-6 pr-2">
                              {loadingContent ? (
                                <div className="flex items-center justify-center py-12">
                                  <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                                    <p className="text-purple-200">Loading content...</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="prose-modal">
                                  <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                                    {selectedPostContent || 'No content available'}
                                  </div>
                                </div>
                              )}
                              {selectedPost?.tags && selectedPost.tags.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                  <h4 className="font-semibold mb-3 text-white">Tags:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedPost.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
