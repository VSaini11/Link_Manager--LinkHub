'use client';

import React, { useState } from "react"
import { Link2, QrCode, BarChart3, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import MultilingualWelcome from "@/components/MultilingualWelcome"

export default function HomePage() {
  const [showMainContent, setShowMainContent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center min-h-[80vh]">
        {!showMainContent && (
          <MultilingualWelcome onComplete={() => setShowMainContent(true)} />
        )}
        
        <div 
          className={`w-full max-w-6xl mx-auto flex flex-col items-center justify-center transition-all duration-700 ${
            showMainContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight text-center">
            Free URL Shortener with
            <span className="block gradient-text">Advanced Analytics</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-purple-200 mb-8 sm:mb-12 max-w-3xl mx-auto text-center px-2">
            Create shortened URLs with powerful analytics, QR codes, and real-time tracking. Sign up free to get started with the best alternative to bit.ly - featuring geographic data, device insights, and comprehensive traffic analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center items-center">
            <Link
              href="/signup"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-900 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-purple-300 text-center"
            >
              Start Free Today
            </Link>
            <Link
              href="/features"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-white/30 text-white rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all duration-300 text-center"
            >
              View All Features
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-purple-300 max-w-4xl mx-auto">
            <span>✓ 100% Free Forever</span>
            <span>✓ No Ads or Watermarks</span>
            <span className="hidden sm:inline">✓ Advanced Analytics</span>
            <span className="hidden sm:inline">✓ Unlimited Links</span>
            <span className="sm:hidden">✓ Analytics</span>
            <span className="sm:hidden">✓ Unlimited</span>
            <span>✓ Quick Setup</span>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-3 sm:mb-4">
            Why Choose LinkHub for URL Shortening?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-purple-200 text-center mb-8 sm:mb-16 max-w-3xl mx-auto px-2">
            Get more than just shortened URLs. Our advanced analytics and tracking features help you understand your audience and optimize your content strategy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<Link2 className="h-8 w-8" />}
              title="Smart URL Shortening"
              description="Create custom shortened URLs with memorable names. Support for bulk processing and instant link validation for better user experience."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Advanced Analytics Dashboard"
              description="Real-time click tracking with geographic data, device insights, traffic sources, and performance trends. Better than basic link shorteners."
            />
            <FeatureCard
              icon={<QrCode className="h-8 w-8 " />}
              title="QR Code Generator"
              description="Instantly generate high-quality QR codes for your shortened URLs. Perfect for marketing campaigns, business cards, and mobile sharing."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Click Spam Protection"
              description="Advanced deduplication system prevents fake clicks and spam. Get accurate analytics with 15-minute intelligent filtering windows."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast Performance"
              description="Built with Next.js 15 and optimized for speed. Instant redirects, real-time analytics, and seamless user experience across all devices."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Geographic & Device Tracking"
              description="Track clicks by country, city, device type, browser, and operating system. Understand your global audience with detailed insights."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Start Shortening URLs for Free?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-purple-200 mb-6 sm:mb-8 px-2">
            Join thousands of marketers, developers, and content creators who trust LinkHub for professional link management with advanced analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-900 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-purple-300"
            >
              Create Free Account
            </Link>
            <Link
              href="/features"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 border border-white/30 text-white rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all duration-300"
            >
              Explore Features
            </Link>
          </div>
          
          {/* Additional SEO links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link href="/pricing" className="text-purple-300 hover:text-white transition-colors">
              Free Pricing
            </Link>
            <Link href="/features" className="text-purple-300 hover:text-white transition-colors">
              All Features
            </Link>
            <Link href="/help" className="text-purple-300 hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-800 px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <span className="text-base sm:text-lg font-semibold text-white">LinkHub</span>
          </div>
          <p className="text-purple-300 text-sm sm:text-base">© 2025 LinkHub.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 card-hover">
      <div className="text-purple-300 mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{title}</h3>
      <p className="text-purple-200 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  )
}
