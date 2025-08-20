import { Metadata } from 'next';
import AdminNav from '@/components/AdminNav';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import AdminBlogsClient from './AdminBlogsClient';

export const metadata: Metadata = {
  title: 'Admin - Blog Management | LinkHub',
  description: 'Manage blog submissions and posts for LinkHub URL shortener',
  robots: 'noindex, nofollow',
};

export default function AdminBlogsPage() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <AdminBlogsClient />
      </div>
    </AdminAuthWrapper>
  );
}
