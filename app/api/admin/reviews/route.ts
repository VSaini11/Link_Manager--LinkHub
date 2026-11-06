import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/lib/models/Review';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-auth')?.value === 'authenticated';
}

// GET /api/admin/reviews - Get all reviews (including pending)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected'
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (status === 'pending') {
      query.approved = false;
      query.rejected = { $ne: true };
    } else if (status === 'approved') {
      query.approved = true;
    } else if (status === 'rejected') {
      query.rejected = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (!mongoose.connection.readyState) {
      return NextResponse.json({
        reviews: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        stats: { total: 0, pending: 0, approved: 0, rejected: 0 }
      });
    }
    
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Review.countDocuments(query);
    
    const stats = {
      total: await Review.countDocuments({}),
      pending: await Review.countDocuments({ approved: false, rejected: { $ne: true } }),
      approved: await Review.countDocuments({ approved: true }),
      rejected: await Review.countDocuments({ rejected: true })
    };
    
    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching reviews for admin:', error);
    return NextResponse.json({
      reviews: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 }
    });
  }
}

// PATCH /api/admin/reviews - Update review status
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    
    const body = await request.json();
    const { reviewId, action, featured } = body;
    
    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Review ID and action are required' },
        { status: 400 }
      );
    }
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'approve':
        review.approved = true;
        review.rejected = false;
        review.approvedAt = new Date();
        break;
        
      case 'reject':
        review.approved = false;
        review.rejected = true;
        review.rejectedAt = new Date();
        break;
        
      case 'pending':
        review.approved = false;
        review.rejected = false;
        review.approvedAt = undefined;
        review.rejectedAt = undefined;
        break;
        
      case 'toggle-featured':
        review.featured = !review.featured;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    if (typeof featured === 'boolean') {
      review.featured = featured;
    }
    
    await review.save();
    
    return NextResponse.json({
      message: `Review ${action}d successfully`,
      review: {
        _id: review._id,
        approved: review.approved,
        rejected: review.rejected,
        featured: review.featured
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }
    
    const review = await Review.findByIdAndDelete(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
