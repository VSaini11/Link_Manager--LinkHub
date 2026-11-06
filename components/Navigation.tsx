'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="relative flex items-center justify-between p-4 sm:p-6 lg:px-8 max-w-7xl mx-auto w-full z-20">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2.5 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Link2 className="h-5 w-5" />
        </div>
        <span className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
          Link<span className="text-indigo-600">Hub</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
        <Link 
          href="/features" 
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
        >
          Features
        </Link>
        <Link 
          href="/pricing" 
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
        >
          Pricing
        </Link>
        <Link 
          href="/blog" 
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
        >
          Blog
        </Link>
        <Link 
          href="/reviews" 
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
        >
          Reviews
        </Link>
        <Link 
          href="/help" 
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
        >
          Help
        </Link>
        <Link 
          href="/admin" 
          className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          Admin
        </Link>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-sm shadow-indigo-500/25"
        >
          Get Started Free
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden" 
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="text-base font-heading font-bold text-slate-900">Navigation</span>
              <button
                onClick={closeMenu}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col p-4 space-y-1.5 flex-1">
              <Link 
                href="/features" 
                className="px-4 py-2.5 text-slate-700 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="px-4 py-2.5 text-slate-700 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Pricing
              </Link>
              <Link 
                href="/blog" 
                className="px-4 py-2.5 text-slate-700 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Blog
              </Link>
              <Link 
                href="/reviews" 
                className="px-4 py-2.5 text-slate-700 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Reviews
              </Link>
              <Link 
                href="/help" 
                className="px-4 py-2.5 text-slate-700 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Help Center
              </Link>
              <Link 
                href="/admin" 
                className="px-4 py-2.5 text-slate-400 font-medium hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                onClick={closeMenu}
              >
                Admin
              </Link>

              <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
                <Link 
                  href="/login" 
                  className="block px-4 py-2.5 text-center text-slate-700 font-semibold hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-sm"
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center text-sm shadow-sm"
                  onClick={closeMenu}
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
