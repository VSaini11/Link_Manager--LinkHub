import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// GET /api/admin/blogs - Get all blog submissions for admin review
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Build query
    let query: any = {};
    
    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { submitterName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .lean(); // Include content for admin review

    // Get counts for different statuses
    const counts = await Blog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      published: 0
    };

    counts.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id as keyof typeof statusCounts] = item.count;
      }
      statusCounts.total += item.count;
    });

    console.log(`Admin blogs query: status=${status}, search="${search}", found=${blogs.length} blogs`);

    return NextResponse.json({
      blogs,
      counts: statusCounts
    });

  } catch (error) {
    console.error('Admin blogs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog submissions' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/blogs - Update blog submission status
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { blogId, action, adminNotes } = body;

    if (!blogId || !action) {
      return NextResponse.json(
        { error: 'Blog ID and action are required' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      adminNotes: adminNotes || null
    };

    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          approved: true,
          rejected: false,
          status: 'approved',
          approvedAt: new Date()
        };
        console.log(`✅ Admin approved blog: "${blog.title}" (ID: ${blogId})`);
        break;

      case 'reject':
        updateData = {
          ...updateData,
          approved: false,
          rejected: true,
          status: 'rejected',
          rejectedAt: new Date()
        };
        console.log(`❌ Admin rejected blog: "${blog.title}" (ID: ${blogId})`);
        break;

      case 'publish':
        updateData = {
          ...updateData,
          approved: true,
          published: true,
          status: 'published',
          publishedAt: new Date()
        };
        console.log(`🌐 Admin published blog: "${blog.title}" (ID: ${blogId})`);
        break;

      case 'unpublish':
        updateData = {
          ...updateData,
          published: false,
          status: 'approved'
        };
        console.log(`📝 Admin unpublished blog: "${blog.title}" (ID: ${blogId})`);
        break;

      case 'feature':
        updateData = {
          ...updateData,
          featured: !blog.featured
        };
        console.log(`⭐ Admin ${blog.featured ? 'unfeatured' : 'featured'} blog: "${blog.title}" (ID: ${blogId})`);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 404 }
      );
    }

    console.log(`📊 Blog update completed: Status="${updatedBlog.status}", Published=${updatedBlog.published}, Featured=${updatedBlog.featured}`);

    return NextResponse.json({
      success: true,
      message: `Blog post ${action}ed successfully`,
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs - Delete a blog submission
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');

    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await Blog.findByIdAndDelete(blogId);

    console.log(`Admin deleted blog: ${blog.title}`);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Blog deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
