import { Metadata } from 'next';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  MessageSquare
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | LinkHub',
  description: 'LinkHub administration dashboard',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default function AdminDashboard() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your LinkHub platform</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Review Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Review Management</CardTitle>
                  <CardDescription>Approve, reject, and manage customer reviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage customer testimonials and reviews. Approve new submissions and feature the best ones.
              </p>
              <Link href="/admin/reviews">
                <Button className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Manage Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Blog Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Blog Management</CardTitle>
                  <CardDescription>Review and manage blog submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Review user-submitted blog posts, approve quality content, and manage published articles.
              </p>
              <Link href="/admin/blogs">
                <Button className="w-full" variant="outline">
                  Manage Blog Posts
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and manage user accounts, monitor usage, and handle support requests.
              </p>
              <Button className="w-full" variant="outline" disabled>
                <Users className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>View platform statistics and insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Monitor link clicks, user growth, and platform performance metrics.
              </p>
              <Button className="w-full" variant="outline" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Settings className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Platform Settings</CardTitle>
                  <CardDescription>Configure platform settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage platform configuration, API settings, and system preferences.
              </p>
              <Button className="w-full" variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription>Platform overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Links</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clicks</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Reviews</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" disabled>
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
              <p className="text-sm">Activities will appear here as they occur</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
    </AdminAuthWrapper>
  );
}
