'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="relative flex items-center justify-between p-4 sm:p-6 lg:px-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        <span className="text-xl sm:text-2xl font-bold text-white">LinkHub</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/blog" className="px-4 py-2 text-white hover:text-purple-300 transition-colors">
          Blog
        </Link>
        <Link href="/reviews" className="px-4 py-2 text-white hover:text-purple-300 transition-colors">
          Reviews
        </Link>
        <Link href="/admin" className="px-3 py-2 text-white/60 hover:text-white/80 transition-colors text-sm">
          Admin
        </Link>
        <Link href="/login" className="px-4 py-2 text-white hover:text-purple-300 transition-colors">
          Login
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 bg-white text-purple-900 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-white hover:text-purple-300 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-slate-900 border-l border-slate-700 z-50 md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                onClick={closeMenu}
                className="p-1 text-white hover:text-purple-300 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col p-4 space-y-3">
              <Link 
                href="/blog" 
                className="px-4 py-3 text-white hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Blog
              </Link>
              <Link 
                href="/reviews" 
                className="px-4 py-3 text-white hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Reviews
              </Link>
              <Link 
                href="/admin" 
                className="px-4 py-3 text-white/60 hover:text-white/80 hover:bg-slate-800 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Admin
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-3 text-white hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-center mt-4"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
