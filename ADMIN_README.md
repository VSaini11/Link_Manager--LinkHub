# Admin Interface Documentation

## Overview
The LinkHub Admin Interface provides a comprehensive dashboard for managing customer reviews and platform operations. The admin system is now protected with password authentication for security.

## Authentication

### Admin Login
- **Admin URL**: `http://localhost:3000/admin/login`
- **Default Password**: `LinkHub@Admin123`

### Environment Configuration
The admin password is configured in `.env.local`:
```env
ADMIN_PASSWORD=LinkHub@Admin123
```
**Important**: Change this password before deploying to production!

### Security Features
- ✅ Secure HTTP-only cookies
- ✅ CSRF protection with SameSite cookies  
- ✅ Automatic session expiry (24 hours)
- ✅ Middleware-level route protection
- ✅ Environment-based password configuration

## Features

### Review Management (`/admin/reviews`)
- **View All Reviews**: See pending, approved, and rejected reviews
- **Approve/Reject**: Moderate customer reviews before they appear publicly
- **Feature Reviews**: Mark exceptional reviews as featured content
- **Search & Filter**: Find specific reviews by name, company, or content
- **Statistics**: View review counts and distribution

### Admin Dashboard (`/admin`)
- **Quick Stats**: Overview of platform metrics
- **Navigation**: Easy access to all admin features
- **Future Modules**: Blog management, user management, analytics

## Review Workflow

1. **Customer Submits Review**: Via the ReviewForm on `/reviews` page
2. **Review Status**: Initially set to `approved: false` (pending)
3. **Admin Moderation**: Admin reviews and approves/rejects via admin interface
4. **Public Display**: Only approved reviews (`approved: true`) appear on public pages

## API Endpoints

### Admin Reviews API (`/api/admin/reviews`)
- `GET`: Fetch all reviews with admin-level access
- `PATCH`: Update review status (approve/reject/feature)
- `DELETE`: Permanently delete reviews

### Public Reviews API (`/api/reviews`)
- `GET`: Fetch only approved reviews for public display
- `POST`: Submit new review (sets `approved: false`)

## Database Schema

### Review Fields
- `approved`: Boolean - Whether review is approved for public display
- `rejected`: Boolean - Whether review has been rejected
- `featured`: Boolean - Whether review should be highlighted
- `approvedAt`: Date - When review was approved
- `rejectedAt`: Date - When review was rejected

## Security Notes

- Admin pages include `noindex, nofollow` meta tags
- Sensitive data (email, IP) excluded from public API responses
- TODO: Add authentication/authorization for admin access

## Access

- **Public Access**: `/admin` (currently no authentication)
- **Admin Dashboard**: `/admin`
- **Review Management**: `/admin/reviews`

## Future Enhancements

1. **Authentication**: Add login system for admin access
2. **Blog Management**: CRUD operations for blog posts
3. **User Management**: View and manage user accounts
4. **Analytics Dashboard**: Platform usage statistics
5. **Settings Panel**: Configure platform options
