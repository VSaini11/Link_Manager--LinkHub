import type React from "react"
import { Link2, QrCode, BarChart3, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <Link2 className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">LinkHub</span>
        </div>
        <div className="flex items-center space-x-4">
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
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight">
          Manage Your
          <span className="block gradient-text">Links Like a Pro</span>
        </h1>
        <p className="text-xl text-purple-200 mb-12 max-w-2xl">
          Generate QR codes, shorten URLs, and organize your links in one beautiful dashboard. Built for developers and
          creators who value simplicity and power.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-purple-300 "
          >
            Get Started Free
          </Link>
          <Link
            href="/demo"
            className="px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-purple-300 "
          >
            View Demo
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-20 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16 ">Everything you need to manage links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="h-8 w-8 " />}
              title="QR Code Generator"
              description="Generate beautiful QR codes for any link instantly. Perfect for sharing and marketing."
            />
            <FeatureCard
              icon={<Link2 className="h-8 w-8" />}
              title="Link Shortener"
              description="Create short, memorable links that are easy to share and track performance."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Analytics Dashboard"
              description="Track clicks, monitor performance, and gain insights into your link engagement."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="Your data is encrypted and secure. We respect your privacy and never sell your data."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast"
              description="Built with modern technology for instant loading and seamless user experience."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Collaboration"
              description="Share and manage links with your team. Perfect for agencies and organizations."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your link management?</h2>
          <p className="text-xl text-purple-200 mb-8">
            Join thousands of developers and creators who trust LinkHub for their link management needs.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-purple-300  "
          >
            Start Building Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-800 px-6 py-8 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Link2 className="h-6 w-6 text-white" />
            <span className="text-lg font-semibold text-white">LinkHub</span>
          </div>
          <p className="text-purple-300">© 2024 LinkHub.</p>
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
    <div className="glass-card rounded-xl p-6 card-hover">
      <div className="text-purple-300 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-purple-200">{description}</p>
    </div>
  )
}
