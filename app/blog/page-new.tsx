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
                  className="text-sm"
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' 
                ? "Try adjusting your search or filter criteria." 
                : "Be the first to share your insights with the community!"
              }
            </p>
            <Link href="/blog/submit">
              <Button>Submit the First Post</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="space-y-6">
                  {featuredPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                            <Tag className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge variant="secondary">{post.category}</Badge>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(post.publishedAt)}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
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
                              <Button onClick={() => setSelectedPost(post)}>
                                Read More
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{selectedPost?.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 text-sm">
                                  <span>{selectedPost?.author}</span>
                                  <span>•</span>
                                  <span>{selectedPost?.category}</span>
                                  <span>•</span>
                                  <span>{selectedPost ? formatDate(selectedPost.publishedAt) : ''}</span>
                                  <span>•</span>
                                  <span>{selectedPost?.readTime || 5} min read</span>
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-6">
                                <div className="prose prose-lg max-w-none">
                                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                    {selectedPost?.content}
                                  </div>
                                </div>
                                {selectedPost?.tags && selectedPost.tags.length > 0 && (
                                  <div className="mt-8 pt-6 border-t">
                                    <h4 className="font-semibold mb-3">Tags:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedPost.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{post.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 leading-relaxed">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center justify-between mb-4">
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedPost(post)}>
                              Read More
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold">{selectedPost?.title}</DialogTitle>
                              <DialogDescription className="flex items-center gap-4 text-sm">
                                <span>{selectedPost?.author}</span>
                                <span>•</span>
                                <span>{selectedPost?.category}</span>
                                <span>•</span>
                                <span>{selectedPost ? formatDate(selectedPost.publishedAt) : ''}</span>
                                <span>•</span>
                                <span>{selectedPost?.readTime || 5} min read</span>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6">
                              <div className="prose prose-lg max-w-none">
                                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                  {selectedPost?.content}
                                </div>
                              </div>
                              {selectedPost?.tags && selectedPost.tags.length > 0 && (
                                <div className="mt-8 pt-6 border-t">
                                  <h4 className="font-semibold mb-3">Tags:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedPost.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline">
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
