import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Quote, ThumbsUp, Calendar, MapPin, Building, CheckCircle } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import Navigation from '@/components/Navigation';

// Fetch reviews from API
async function getReviews() {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://golinkhub.vercel.app');
    
    const response = await fetch(`${baseUrl}/api/reviews?limit=50`, {
      next: { revalidate: 60 },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Reviews API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
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
              ? 'text-amber-400 fill-amber-400' 
              : 'text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function getDaysAgoText(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default async function ReviewsPage() {
  const { reviews, stats } = await getReviews();
  const featuredReviews = reviews.filter((review: any) => review.featured);
  const nonFeaturedReviews = reviews.filter((review: any) => !review.featured);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="pt-16 pb-12 px-4 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-slate-900 mb-5 tracking-tight">
          Customer <span className="gradient-text">Reviews</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          See what creators and marketers say about LinkHub. Simple, reliable, and completely free.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20 w-full">
        {/* Review Statistics */}
        <section className="mb-14">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Overall Rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                  <span className="text-5xl font-heading font-extrabold text-slate-900">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : "5.0"}
                  </span>
                  <div>
                    <StarRating rating={Math.round(stats.averageRating || 5)} size="lg" />
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Based on {stats.totalReviews.toLocaleString()} reviews
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Rated <strong className="text-slate-900">{stats.averageRating ? stats.averageRating.toFixed(1) : "5.0"}/5</strong> overall customer satisfaction
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2.5">
                {stats.distribution.map((item: any) => {
                  const percentage = stats.totalReviews > 0 ? (item.count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={item.rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-10">
                        <span className="text-xs font-semibold text-slate-700">{item.rating}</span>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      </div>
                      <Progress value={percentage} className="flex-1 h-2 bg-slate-100" />
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* No Reviews Message */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">No Reviews Yet</h2>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Be the first to share your experience with LinkHub! Your feedback helps other users 
                and keeps the service improving.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Reviews */}
            {featuredReviews.length > 0 && (
              <section className="mb-14">
                <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6 text-center">Featured Reviews</h2>
                <div className="relative max-w-6xl mx-auto px-6 sm:px-12">
                  <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {featuredReviews.map((review: any) => (
                        <CarouselItem key={review._id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <div className="p-1 h-full">
                            <div className="glass-card rounded-2xl p-6 h-full min-h-[380px] max-h-[380px] flex flex-col justify-between card-hover">
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                      <Quote className="h-4 w-4" />
                                    </div>
                                    {review.verified && (
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    )}
                                  </div>
                                  <StarRating rating={review.rating} />
                                </div>
                                <h4 className="font-heading font-bold text-slate-900 mb-2 text-base line-clamp-2">{review.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">{review.content}</p>
                              </div>
                              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-900 text-sm">{review.name}</h3>
                                  {review.company && (
                                    <span className="text-xs text-slate-400 block">{review.company}</span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400">{getDaysAgoText(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 -left-4 shadow-sm" />
                    <CarouselNext className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 -right-4 shadow-sm" />
                  </Carousel>
                </div>
              </section>
            )}

            {/* All Reviews */}
            {nonFeaturedReviews.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6 text-center">Recent Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {nonFeaturedReviews.map((review: any) => (
                    <div key={review._id} className="glass-card rounded-2xl p-6 flex flex-col justify-between card-hover">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-slate-400">{getDaysAgoText(review.createdAt)}</span>
                        </div>
                        <h4 className="font-heading font-bold text-slate-900 mb-2 text-base">{review.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{review.content}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">{review.name}</span>
                        {review.company && <span className="text-xs text-slate-400">{review.company}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Write a Review */}
        <section className="mt-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-5 text-center">Write a Review</h2>
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl shadow-slate-200/50">
              <ReviewForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
