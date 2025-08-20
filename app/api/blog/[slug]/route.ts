import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// GET /api/blog/[slug] - Get a specific blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    
    const { slug } = await params;
    
    const post = await Blog.findOne({ 
      slug, 
      published: true 
    }).lean() as any;
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(post._id, { 
      $inc: { views: 1 } 
    });
    
    // Get related posts
    const relatedPosts = await Blog.find({
      _id: { $ne: post._id },
      published: true,
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
    .select('-content')
    .limit(3)
    .sort({ publishedAt: -1 })
    .lean();
    
    return NextResponse.json({
      post: {
        ...post,
        views: (post.views || 0) + 1
      },
      relatedPosts
    });
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;
    const body = await request.json();
    
    // TODO: Add authentication check here for admin users
    
    const updatedPost = await Blog.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Blog post updated successfully',
      post: updatedPost
    });
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;
    
    // TODO: Add authentication check here for admin users
    
    const deletedPost = await Blog.findOneAndDelete({ slug });
    
    if (!deletedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Blog post deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
