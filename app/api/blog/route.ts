import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// GET /api/blog - Get all published blog posts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    
    const skip = (page - 1) * limit;
    
    // Build query - only show published blogs
    const query: any = { 
      published: true,
      status: 'published'  // Also check status field
    };
    
    console.log('🔍 Blog API Query:', { query, page, limit, category, search, featured });
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Check if we have a valid database connection
    if (!mongoose.connection.readyState) {
      console.warn('No database connection, returning empty data');
      return NextResponse.json({
        posts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        categories: ['All', 'SEO', 'Analytics', 'Marketing', 'Link Management']
      });
    }

    // First, let's check all blogs in the database for debugging
    const allBlogs = await Blog.find({}).select('title published status').lean();
    console.log('📊 All blogs in database:', allBlogs);
    
    // Get posts with pagination
    const posts = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content') // Exclude full content for list view
      .lean();
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    console.log(`📚 Blog API: Found ${posts.length} published posts (total: ${total})`);
    console.log(`📊 Query filters: published=true, category=${category || 'all'}, featured=${featured || 'any'}`);
    
    // Get categories for filter
    const categories = await Blog.distinct('category', { published: true });
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categories
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    
    // Return empty data structure instead of error for graceful degradation
    return NextResponse.json({
      posts: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      },
      categories: ['All', 'SEO', 'Analytics', 'Marketing', 'Link Management']
    });
  }
}

// POST /api/blog - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      author,
      featured,
      published,
      featuredImage,
      metaTitle,
      metaDescription
    } = body;
    
    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication check here for admin users
    
    const blog = new Blog({
      title,
      content,
      excerpt,
      category,
      tags: tags || [],
      author: author || 'LinkHub Team',
      featured: featured || false,
      published: published || false,
      featuredImage: featuredImage || '/placeholder-blog.jpg',
      metaTitle,
      metaDescription
    });
    
    await blog.save();
    
    return NextResponse.json({ 
      message: 'Blog post created successfully',
      blog: {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        published: blog.published
      }
    });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
