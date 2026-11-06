'use client';

import React, { useState } from "react"
import { Link2, QrCode, BarChart3, Shield, Zap, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import MultilingualWelcome from "@/components/MultilingualWelcome"

export default function HomePage() {
  const [showMainContent, setShowMainContent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative subtle light grid & radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-24 text-center min-h-[75vh]">
        {!showMainContent && (
          <MultilingualWelcome onComplete={() => setShowMainContent(true)} />
        )}
        
        <div 
          className={`w-full max-w-5xl mx-auto flex flex-col items-center justify-center transition-all duration-700 ${
            showMainContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Simple, Sober & Free URL Shortener
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight text-center">
            Free URL Shortener with{" "}
            <span className="gradient-text">Advanced Analytics</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto text-center leading-relaxed font-normal">
            Create shortened URLs with clean analytics, QR codes, and real-time tracking. Get geographic data, device insights, and visitor traffic without bloated interfaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 mb-8 justify-center items-center w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-indigo-600/20 text-center flex items-center justify-center gap-2"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-semibold text-base hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-center shadow-sm"
            >
              View Features
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-500 max-w-3xl mx-auto">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Watermarks</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Analytics</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant QR Codes</span>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
              Why Choose LinkHub?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Get more than just shortened URLs. Enjoy simple, clear analytics and powerful link utilities designed to stay clean and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<Link2 className="h-6 w-6 text-indigo-600" />}
              title="Smart URL Shortening"
              description="Create clean custom shortened links with memorable aliases. Fast, reliable redirects with instant link validation."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-indigo-600" />}
              title="Analytics Dashboard"
              description="Real-time click tracking with geographic distribution, device insights, and traffic sources in a clean, legible dashboard."
            />
            <FeatureCard
              icon={<QrCode className="h-6 w-6 text-indigo-600" />}
              title="QR Code Generator"
              description="Instantly generate crisp, downloadable QR codes for any link. Ideal for cards, presentations, and product packaging."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-indigo-600" />}
              title="Click Spam Protection"
              description="Smart deduplication filtering to eliminate duplicate click bursts and keep your analytics data honest and accurate."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-indigo-600" />}
              title="Lightning Performance"
              description="Built on Next.js 15 for near-zero redirect latency. Seamless experience on mobile and desktop alike."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-indigo-600" />}
              title="Geographic & Device Insights"
              description="Inspect visitors by country, city, browser, and OS to understand where your audience actually comes from."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-b from-indigo-50/60 to-white rounded-3xl p-8 sm:p-14 border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to short and measure your links?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Start in seconds without complicated setups. Completely free with all analytics unlocked.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-6 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-indigo-600/20"
              >
                Create Free Account
              </Link>
              <Link
                href="/features"
                className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-semibold text-base hover:bg-slate-50 transition-all duration-200 shadow-sm"
              >
                Explore Features
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-slate-500 pt-2">
              <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
                Free Pricing
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/features" className="hover:text-indigo-600 transition-colors">
                All Features
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/help" className="hover:text-indigo-600 transition-colors">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-8 lg:px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-heading font-bold text-slate-900">LinkHub</span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} LinkHub. All rights reserved.
          </p>
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
    <div className="glass-card rounded-2xl p-6 sm:p-7 card-hover flex flex-col items-start text-left">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
