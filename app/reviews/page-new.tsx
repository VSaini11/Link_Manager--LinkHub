import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Quote, ThumbsUp, Calendar, MapPin, Building, CheckCircle } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';

// Fetch reviews from API
async function getReviews() {
  try {
    // For development, try localhost first
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app');
    
    const response = await fetch(`${baseUrl}/api/reviews?limit=50`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      cache: 'force-cache' // Use cached data if available
    });
    
    if (!response.ok) {
      console.warn(`Reviews API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return empty state for graceful degradation
    return { 
      reviews: [], 
      stats: { 
        averageRating: 0, 
        totalReviews: 0, 
        distribution: Array.from({ length: 5 }, (_, i) => ({ rating: 5 - i, count: 0 }))
      } 
    };
  }
}

export const metadata: Metadata = {
  title: 'Customer Reviews & Testimonials - LinkHub URL Shortener',
  description: 'Read genuine customer reviews and testimonials about LinkHub\'s URL shortening service. See why thousands of users trust us for their link management needs.',
  keywords: [
    'LinkHub reviews',
    'URL shortener reviews',
    'customer testimonials',
    'user feedback',
    'link shortener ratings',
    'customer satisfaction',
    'service reviews'
  ],
  openGraph: {
    title: 'Customer Reviews & Testimonials - LinkHub',
    description: 'Read genuine customer reviews and see why users love LinkHub\'s URL shortening service.',
    type: 'website',
  },
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

function getDaysAgoText(createdAt: string | Date) {
  const now = new Date();
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export default async function ReviewsPage() {
  const { reviews, stats } = await getReviews();
  const featuredReviews = reviews.filter((review: any) => review.featured);
  const allReviews = reviews;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See what our customers say about LinkHub's URL shortening service. 
            Join thousands of satisfied users who trust us with their link management needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Review Statistics */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {stats.totalReviews.toLocaleString()} reviews
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Rated <strong>{stats.averageRating.toFixed(1)}/5</strong> by our customers
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {stats.distribution.map((item: any) => {
                    const percentage = stats.totalReviews > 0 ? (item.count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={item.rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium">{item.rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        </div>
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* No Reviews Message */}
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reviews Yet</h2>
              <p className="text-gray-600 mb-8">
                Be the first to share your experience with LinkHub! Your feedback helps other users 
                and helps us improve our service.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Reviews */}
            {featuredReviews.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Reviews</h2>
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {featuredReviews.map((review: any) => (
                    <Card key={review._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <img 
                            src={review.avatar || '/placeholder-user.jpg'} 
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{review.name}</h3>
                              {review.verified && (
                                <div className="relative group">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Verified Customer
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              {review.company && (
                                <>
                                  <Building className="h-3 w-3" />
                                  <span>{review.company}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {getDaysAgoText(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-3">{review.title}</h4>
                        <blockquote className="text-gray-700 mb-4 leading-relaxed">
                          <Quote className="h-4 w-4 text-gray-400 mb-2" />
                          {review.content}
                        </blockquote>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Helpful ({review.helpful || 0})
                          </Button>
                          <Badge variant="secondary">Featured</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Reviews */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">All Reviews</h2>
              <div className="space-y-6">
                {allReviews.map((review: any) => (
                  <Card key={review._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <img 
                          src={review.avatar || '/placeholder-user.jpg'} 
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{review.name}</h3>
                              {review.verified && (
                                <div className="relative group">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Verified Customer
                                  </div>
                                </div>
                              )}
                            </div>
                            {review.company && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Building className="h-3 w-3" />
                                <span>{review.company}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-gray-500">
                              {getDaysAgoText(review.createdAt)}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                          <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Helpful ({review.helpful || 0})
                            </Button>
                            {review.featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Write a Review */}
        <section>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Write a Review</h2>
            <Card>
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                  Help other users by sharing your experience with LinkHub. Your feedback helps us improve our service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewForm />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
