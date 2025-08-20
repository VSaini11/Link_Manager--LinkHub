import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// POST /api/blog/submit - Submit a new blog post for review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    if (!mongoose.connection.readyState) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      submitterName,
      submitterEmail,
      category,
      tags
    } = body;

    // Validation
    if (!title || !excerpt || !content || !submitterName || !submitterEmail || !category) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitterEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate content length (minimum 100 words)
    const wordCount = content.split(' ').filter((word: string) => word.length > 0).length;
    if (wordCount < 100) {
      return NextResponse.json(
        { error: 'Blog content must be at least 100 words long' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now(); // Add timestamp to ensure uniqueness

    // Create blog post with submission data
    const blogPost = new Blog({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      submitterName: submitterName.trim(),
      submitterEmail: submitterEmail.trim(),
      author: submitterName.trim(), // Use submitter name as author initially
      category,
      tags: Array.isArray(tags) ? tags.map((tag: string) => tag.toLowerCase().trim()) : [],
      status: 'pending',
      approved: false,
      rejected: false,
      published: false,
      featured: false
    });

    const savedBlog = await blogPost.save();

    console.log('Blog submission received:', {
      title: savedBlog.title,
      submitter: savedBlog.submitterName,
      email: savedBlog.submitterEmail,
      category: savedBlog.category,
      wordCount
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post submitted successfully and is pending review',
      blog: {
        id: savedBlog._id,
        title: savedBlog.title,
        status: savedBlog.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Blog submission error:', error);
    
    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        { error: 'A blog post with a similar title already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit blog post. Please try again.' },
      { status: 500 }
    );
  }
}
