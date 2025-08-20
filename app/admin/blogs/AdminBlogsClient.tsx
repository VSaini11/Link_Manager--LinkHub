'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Eye,
  Globe,
  Trash2,
  Calendar,
  User,
  Mail,
  Tag
} from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  submitterName: string;
  submitterEmail: string;
  author: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'published';
  approved: boolean;
  rejected: boolean;
  published: boolean;
  featured: boolean;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  publishedAt?: string;
  adminNotes?: string;
  readTime: number;
  views: number;
}

interface BlogCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
}

export default function AdminBlogsClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [counts, setCounts] = useState<BlogCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, [selectedStatus, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/blogs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
        setCounts(data.counts);
      } else {
        setError('Failed to fetch blog posts');
      }
    } catch (error) {
      setError('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogAction = async (blogId: string, action: string, notes?: string) => {
    try {
      setActionLoading(true);
      setError('');

      console.log(`Admin performing action: ${action} on blog ${blogId}`);

      const response = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          action,
          adminNotes: notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Blog ${action} successful:`, data);
        
        // Refresh the blogs list to get updated counts and statuses
        await fetchBlogs();
        
        // Clear selection and notes
        setSelectedBlog(null);
        setAdminNotes('');
        
        // Show success message based on action
        const actionMessages = {
          approve: 'Blog post approved successfully!',
          reject: 'Blog post rejected.',
          publish: 'Blog post published successfully!',
          unpublish: 'Blog post unpublished.',
          feature: 'Blog post featured status updated!'
        };
        
        console.log(actionMessages[action as keyof typeof actionMessages] || `Blog ${action}ed successfully`);
      } else {
        console.error(`Failed to ${action} blog:`, data);
        setError(data.error || `Failed to ${action} blog post`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setError(`Failed to ${action} blog post`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/blogs?id=${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBlogs();
      } else {
        setError('Failed to delete blog post');
      }
    } catch (error) {
      setError('Failed to delete blog post');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (blog: BlogPost) => {
    switch (blog.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-600"><Globe className="h-3 w-3 mr-1" />Published</Badge>;
      default:
        return <Badge variant="secondary">{blog.status}</Badge>;
    }
  };

  const filteredBlogs = blogs;

  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Review and manage blog submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{counts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{counts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{counts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Published</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{counts.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{counts.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Filter Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, submitter, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Blog Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Submissions ({filteredBlogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading blog posts...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No blog posts found matching your criteria.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {blog.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(blog)}
                            {blog.featured && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                <Star className="h-3 w-3 mr-1" />Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{blog.excerpt}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{blog.submitterName}</span>
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{blog.submitterEmail}</span>
                          </span>
                          <span className="flex items-center">
                            <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {blog.category}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {blog.readTime} min read
                          </span>
                        </div>

                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {blog.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                setSelectedBlog(blog);
                                setAdminNotes(blog.adminNotes || '');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto mx-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-xl">{selectedBlog?.title}</DialogTitle>
                              <DialogDescription>
                                Review and manage this blog submission
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedBlog && (
                              <div className="space-y-4 sm:space-y-6">
                                {/* Submission Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <span className="font-semibold text-gray-700">Submitter:</span>
                                    <p className="text-gray-900 text-sm sm:text-base">{selectedBlog.submitterName}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Email:</span>
                                    <p className="text-gray-900 text-sm sm:text-base break-all">{selectedBlog.submitterEmail}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Category:</span>
                                    <p className="text-gray-900 text-sm sm:text-base">{selectedBlog.category}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <div className="mt-1">{getStatusBadge(selectedBlog)}</div>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Submitted:</span>
                                    <p className="text-gray-900">{new Date(selectedBlog.createdAt).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-700">Read Time:</span>
                                    <p className="text-gray-900">{selectedBlog.readTime} minutes</p>
                                  </div>
                                </div>

                                {/* Tags */}
                                {selectedBlog.tags.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2 text-gray-700">Tags:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedBlog.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Excerpt */}
                                <div>
                                  <h4 className="font-semibold mb-3 text-gray-700">Excerpt:</h4>
                                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <p className="text-gray-800 leading-relaxed">{selectedBlog.excerpt}</p>
                                  </div>
                                </div>

                                {/* Full Content */}
                                <div>
                                  <h4 className="font-semibold mb-3 text-gray-700">Full Content:</h4>
                                  <div className="border rounded-lg bg-white">
                                    <div className="max-h-96 overflow-y-auto p-6">
                                      <div className="prose prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                          {selectedBlog?.content || 'No content available'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-500">
                                    Word count: {selectedBlog?.content ? selectedBlog.content.split(' ').filter((word: string) => word.length > 0).length : 0} words
                                  </div>
                                </div>

                                {/* Previous Admin Notes */}
                                {selectedBlog.adminNotes && (
                                  <div>
                                    <h4 className="font-semibold mb-2 text-gray-700">Previous Admin Notes:</h4>
                                    <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                      <p className="text-gray-800">{selectedBlog.adminNotes}</p>
                                    </div>
                                  </div>
                                )}

                                {/* New Admin Notes */}
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-700">Admin Notes:</h4>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this submission (optional)..."
                                    rows={3}
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            )}

                            <DialogFooter className="gap-2">
                              {selectedBlog?.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => selectedBlog && handleBlogAction(selectedBlog._id, 'approve', adminNotes)}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => selectedBlog && handleBlogAction(selectedBlog._id, 'reject', adminNotes)}
                                    disabled={actionLoading}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              {selectedBlog?.status === 'approved' && (
                                <Button
                                  onClick={() => selectedBlog && handleBlogAction(selectedBlog._id, 'publish', adminNotes)}
                                  disabled={actionLoading}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  Publish
                                </Button>
                              )}

                              {selectedBlog?.status === 'published' && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => selectedBlog && handleBlogAction(selectedBlog._id, 'unpublish', adminNotes)}
                                    disabled={actionLoading}
                                  >
                                    Unpublish
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => selectedBlog && handleBlogAction(selectedBlog._id, 'feature', adminNotes)}
                                    disabled={actionLoading}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    {selectedBlog.featured ? 'Unfeature' : 'Feature'}
                                  </Button>
                                </>
                              )}

                              <Button
                                variant="destructive"
                                onClick={() => selectedBlog && handleDeleteBlog(selectedBlog._id)}
                                disabled={actionLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
