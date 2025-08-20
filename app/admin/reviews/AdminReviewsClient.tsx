'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  Search,
  Building,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Award
} from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  email: string;
  company?: string;
  rating: number;
  title: string;
  content: string;
  approved: boolean;
  rejected?: boolean;
  featured?: boolean;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = async (status: string = currentTab, search: string = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status,
        limit: '50'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/admin/reviews?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      setActionLoading(reviewId);
      
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, action }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const actionMessages: { [key: string]: string } = {
          'approve': 'Review approved! It will now appear on the public reviews page.',
          'reject': 'Review rejected. It will not appear publicly.',
          'toggle-featured': data.review.featured 
            ? 'Review marked as featured! It will appear in the featured section.' 
            : 'Review removed from featured section.',
          'pending': 'Review marked as pending for re-review.'
        };
        
        toast({
          title: 'Success',
          description: actionMessages[action] || data.message,
        });
        
        // Refresh reviews
        fetchReviews();
      } else {
        throw new Error(data.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(reviewId);
      
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Review deleted successfully',
        });
        
        // Refresh reviews
        fetchReviews();
      } else {
        throw new Error(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentTab]);

  const handleSearch = () => {
    fetchReviews(currentTab, searchTerm);
  };

  const getStatusBadge = (review: Review) => {
    if (review.rejected) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (review.approved) {
      return <Badge variant="default">Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
          <p className="text-gray-600 mb-4">Manage customer reviews and testimonials</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Approve</strong> reviews to make them visible on the public reviews page</li>
              <li>• <strong>Feature</strong> approved reviews to highlight them in the featured section</li>
              <li>• <strong>Reject</strong> inappropriate reviews to keep them hidden</li>
              <li>• Only approved reviews appear to customers on <code className="bg-blue-100 px-1 rounded">/reviews</code></li>
            </ul>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reviews by name, company, title, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Tabs for different review statuses */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            <TabsTrigger value="">All ({stats.total})</TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No reviews found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{review.name}</h3>
                            {getStatusBadge(review)}
                            {review.featured && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Award className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{review.email}</span>
                            </div>
                            
                            {review.company && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>{review.company}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                      <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        {!review.approved && !review.rejected && (
                          <Button
                            size="sm"
                            onClick={() => handleReviewAction(review._id, 'approve')}
                            disabled={actionLoading === review._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        
                        {!review.rejected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewAction(review._id, 'reject')}
                            disabled={actionLoading === review._id}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        )}
                        
                        {(review.approved || review.rejected) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewAction(review._id, 'pending')}
                            disabled={actionLoading === review._id}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Mark Pending
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewAction(review._id, 'toggle-featured')}
                          disabled={actionLoading === review._id}
                          className={review.featured ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
                        >
                          {review.featured ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Unfeature
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Feature
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={actionLoading === review._id}
                          className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
