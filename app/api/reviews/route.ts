import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/lib/models/Review';

// GET /api/reviews - Get all approved reviews
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const featured = searchParams.get('featured');
    const rating = searchParams.get('rating');
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { approved: true };
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Check if we have a valid database connection
    if (!mongoose.connection.readyState) {
      console.warn('No database connection, returning empty reviews data');
      return NextResponse.json({
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          distribution: Array.from({ length: 5 }, (_, i) => ({ rating: 5 - i, count: 0 }))
        }
      });
    }
    
    // Get reviews with pagination
    const reviews = await Review.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-email -ipAddress -userAgent') // Hide sensitive data
      .lean();
    
    console.log(`Found ${reviews.length} approved reviews`); // Debug log
    
    // Get total count for pagination
    const total = await Review.countDocuments(query);
    console.log(`Total approved reviews in database: ${total}`); // Debug log
    
    // Get review statistics
    const statsResult = await Review.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    const stats = statsResult[0] || { averageRating: 0, totalReviews: 0 };
    
    const distributionResult = await Review.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    // Create array with all ratings (1-5) initialized to 0
    const distribution = Array.from({ length: 5 }, (_, i) => ({ rating: 5 - i, count: 0 }));
    
    // Fill in actual counts
    distributionResult.forEach(item => {
      const index = distribution.findIndex(d => d.rating === item._id);
      if (index !== -1) {
        distribution[index].count = item.count;
      }
    });
    
    const responseData = {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: Number(stats.averageRating.toFixed(1)),
        totalReviews: stats.totalReviews,
        distribution
      }
    };
    
    console.log('Returning reviews response:', responseData); // Debug log
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    // Return empty data structure instead of error for graceful degradation
    return NextResponse.json({
      reviews: [],
      stats: {
        averageRating: 0,
        totalReviews: 0,
        distribution: Array.from({ length: 5 }, (_, i) => ({ rating: 5 - i, count: 0 }))
      }
    });
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      name,
      email,
      company,
      rating,
      title,
      content
    } = body;
    
    // Validate required fields
    if (!name || !email || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Check for duplicate reviews from same email (prevent spam)
    const existingReview = await Review.findOne({ 
      email: email.toLowerCase(),
      createdAt: { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
      }
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You can only submit one review per day' },
        { status: 429 }
      );
    }
    
    const review = new Review({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() || '',
      rating,
      title: title.trim(),
      content: content.trim(),
      ipAddress: clientIP,
      userAgent,
      approved: false // Reviews need approval by default
    });
    
    await review.save();
    
    return NextResponse.json({ 
      message: 'Review submitted successfully. It will be published after moderation.',
      reviewId: review._id
    });
    
  } catch (error: any) {
    console.error('Error submitting review:', error);
    
    // Handle specific mongoose validation errors
    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews - Mark review as helpful
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { reviewId, action } = body;
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    if (action === 'helpful') {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { $inc: { helpful: 1 } },
        { new: true }
      );
      
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        message: 'Thank you for your feedback',
        helpful: review.helpful
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
