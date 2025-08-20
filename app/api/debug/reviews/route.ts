import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/lib/models/Review';

// GET /api/debug/reviews - Debug endpoint to see all reviews in database
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }
    
    // Get all reviews without filtering
    const allReviews = await Review.find({})
      .sort({ createdAt: -1 })
      .select('-email -ipAddress -userAgent')
      .lean();
    
    // Get counts by status
    const totalCount = await Review.countDocuments({});
    const approvedCount = await Review.countDocuments({ approved: true });
    const pendingCount = await Review.countDocuments({ approved: false, rejected: { $ne: true } });
    const rejectedCount = await Review.countDocuments({ rejected: true });
    const featuredCount = await Review.countDocuments({ featured: true });
    
    return NextResponse.json({
      debug: true,
      totalReviews: totalCount,
      counts: {
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        featured: featuredCount
      },
      reviews: allReviews.map(review => ({
        _id: review._id,
        name: review.name,
        title: review.title,
        rating: review.rating,
        approved: review.approved,
        rejected: review.rejected,
        featured: review.featured,
        createdAt: review.createdAt,
        approvedAt: review.approvedAt,
        rejectedAt: review.rejectedAt
      }))
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
