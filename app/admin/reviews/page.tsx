import { Metadata } from 'next';
import AdminNav from '@/components/AdminNav';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import AdminReviewsClient from './AdminReviewsClient';

export const metadata: Metadata = {
  title: 'Admin - Review Management | LinkHub',
  description: 'Manage customer reviews and testimonials for LinkHub URL shortener',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default function AdminReviewsPage() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <AdminReviewsClient />
      </div>
    </AdminAuthWrapper>
  );
}
