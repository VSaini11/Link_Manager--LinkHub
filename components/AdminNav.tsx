'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, ArrowLeft, LogOut, Menu, X } from 'lucide-react';

export default function AdminNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/reviews">
            <Button variant="ghost" size="sm">
              Reviews
            </Button>
          </Link>
          <Link href="/admin/blogs">
            <Button variant="ghost" size="sm">
              Blogs
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">Admin Panel</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Site
                  </Button>
                </Link>
                <Link href="/admin" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/reviews" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    Reviews
                  </Button>
                </Link>
                <Link href="/admin/blogs" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    Blogs
                  </Button>
                </Link>
                <div className="border-t pt-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm" 
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm text-gray-600">Admin Panel</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Right Side - Just the title and logout */}
        <div className="md:hidden flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Admin</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
