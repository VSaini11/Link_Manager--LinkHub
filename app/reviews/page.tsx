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
      next: { revalidate: 60 }, // Revalidate every minute for faster updates
      cache: 'no-store' // Always fetch fresh data during development
    });
    
    if (!response.ok) {
      console.error(`Reviews API responded with status: ${response.status}`);
      console.error(`Response text:`, await response.text());
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reviews data fetched:', data); // Debug log
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
  const nonFeaturedReviews = reviews.filter((review: any) => !review.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Customer <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            See what our customers say about LinkHub's URL shortening service. 
            Join thousands of satisfied users who trust us with their link management needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Review Statistics */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto bg-slate-800 border-slate-700">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <span className="text-5xl font-bold text-white">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                      <p className="text-sm text-slate-400 mt-1">
                        Based on {stats.totalReviews.toLocaleString()} reviews
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300">
                    Rated <strong className="text-white">{stats.averageRating.toFixed(1)}/5</strong> by our customers
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {stats.distribution.map((item: any) => {
                    const percentage = stats.totalReviews > 0 ? (item.count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={item.rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium text-white">{item.rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        </div>
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-sm text-slate-400 w-12 text-right">
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
              <h2 className="text-2xl font-bold text-white mb-4">No Reviews Yet</h2>
              <p className="text-slate-300 mb-8">
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
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Featured Reviews</h2>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {featuredReviews.map((review: any) => (
                    <Card key={review._id} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Quote className="h-8 w-8 text-purple-400" />
                            {review.verified && (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        
                        <h4 className="font-bold text-white mb-3 text-lg">{review.title}</h4>
                        <blockquote className="text-slate-300 mb-6 leading-relaxed line-clamp-4">
                          {review.content}
                        </blockquote>
                        
                        <div className="border-t border-slate-700 pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{review.name}</h3>
                              {review.company && (
                                <div className="flex items-center gap-1 text-sm text-slate-400">
                                  <Building className="h-3 w-3" />
                                  <span>{review.company}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 mb-1">Featured</Badge>
                              <span className="text-xs text-slate-400">
                                {getDaysAgoText(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-700">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700 w-full">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Helpful ({review.helpful || 0})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Reviews */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {featuredReviews.length > 0 ? 'More Reviews' : 'All Reviews'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonFeaturedReviews.map((review: any) => (
                  <Card key={review._id} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Quote className="h-8 w-8 text-purple-400" />
                          {review.verified && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      
                      <h4 className="font-bold text-white mb-3 text-lg">{review.title}</h4>
                      <blockquote className="text-slate-300 mb-6 leading-relaxed line-clamp-4">
                        {review.content}
                      </blockquote>
                      
                      <div className="border-t border-slate-700 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{review.name}</h3>
                            {review.company && (
                              <div className="flex items-center gap-1 text-sm text-slate-400">
                                <Building className="h-3 w-3" />
                                <span>{review.company}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            {review.featured && (
                              <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 mb-1">Featured</Badge>
                            )}
                            <span className="text-xs text-slate-400">
                              {getDaysAgoText(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-700">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700 w-full">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Helpful ({review.helpful || 0})
                        </Button>
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
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Write a Review</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Share Your Experience</CardTitle>
                <CardDescription className="text-slate-300">
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
