import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/admin/auth - Admin authentication
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password !== adminPassword) {
      console.log('Admin login failed - incorrect password');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('Admin login successful - setting cookie');

    // Set authentication cookie
    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    // Set secure cookie that expires in 24 hours
    const cookieStore = await cookies();
    cookieStore.set('admin-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/', // Changed from '/admin' to '/' to work with API routes
    });

    return response;

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin/auth - Check authentication status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin-auth');

    console.log('Auth check - Cookie value:', authCookie?.value);

    if (authCookie?.value === 'authenticated') {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/auth - Logout
export async function DELETE() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear authentication cookie
    const cookieStore = await cookies();
    cookieStore.delete('admin-auth');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
