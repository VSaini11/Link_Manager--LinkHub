import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// GET /api/debug/blogs - Debug endpoint to see all blogs in database
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
    
    // Get all blogs without filtering
    const allBlogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .select('-content') // Exclude content for overview
      .lean();
    
    // Get counts by status
    const totalCount = await Blog.countDocuments({});
    const pendingCount = await Blog.countDocuments({ status: 'pending' });
    const approvedCount = await Blog.countDocuments({ status: 'approved' });
    const publishedCount = await Blog.countDocuments({ status: 'published' });
    const rejectedCount = await Blog.countDocuments({ status: 'rejected' });
    const featuredCount = await Blog.countDocuments({ featured: true });
    
    // Get published blogs (what appears on public page)
    const publishedBlogs = await Blog.find({ published: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('title status published featured publishedAt')
      .lean();
    
    return NextResponse.json({
      debug: true,
      totalBlogs: totalCount,
      counts: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        published: publishedCount,
        rejected: rejectedCount,
        featured: featuredCount
      },
      publishedBlogsOnSite: publishedBlogs.length,
      allBlogs: allBlogs.map(blog => ({
        _id: blog._id,
        title: blog.title,
        submitterName: blog.submitterName,
        status: blog.status,
        approved: blog.approved,
        rejected: blog.rejected,
        published: blog.published,
        featured: blog.featured,
        createdAt: blog.createdAt,
        approvedAt: blog.approvedAt,
        rejectedAt: blog.rejectedAt,
        publishedAt: blog.publishedAt
      })),
      publishedBlogs: publishedBlogs
    });
    
  } catch (error) {
    console.error('Debug blogs API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
