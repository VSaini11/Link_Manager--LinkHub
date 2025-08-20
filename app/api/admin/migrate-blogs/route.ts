import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// GET /api/admin/migrate-blogs - Migration script to update existing blogs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Find all blogs that don't have publishing fields set
    const blogsToUpdate = await Blog.find({
      $or: [
        { published: { $exists: false } },
        { approved: { $exists: false } },
        { status: { $exists: false } }
      ]
    });

    console.log(`Found ${blogsToUpdate.length} blogs to migrate`);

    // Update each blog with proper publishing fields
    const updatePromises = blogsToUpdate.map(async (blog) => {
      const updateData = {
        published: true,        // Make existing blogs published
        approved: true,         // Make them approved
        status: 'published',    // Set status to published
        publishedAt: blog.createdAt || new Date(), // Use creation date as publish date
        approvedAt: blog.createdAt || new Date()   // Use creation date as approval date
      };

      return Blog.findByIdAndUpdate(blog._id, updateData, { new: true });
    });

    const updatedBlogs = await Promise.all(updatePromises);

    console.log(`Successfully migrated ${updatedBlogs.length} blogs to published status`);

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedBlogs.length} blogs`,
      migratedBlogs: updatedBlogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        status: blog.status,
        published: blog.published
      }))
    });

  } catch (error) {
    console.error('Blog migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate blogs' },
      { status: 500 }
    );
  }
}
