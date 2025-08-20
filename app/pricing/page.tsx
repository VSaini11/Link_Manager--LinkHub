import type { Metadata } from "next"
import { Link2, Check, Zap } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: "Pricing - Free URL Shortener | LinkHub",
  description: "LinkHub is completely free! Get unlimited URL shortening, advanced analytics, QR codes, and geographic tracking at no cost. No hidden fees, no premium plans.",
  keywords: [
    "free URL shortener",
    "free link shortener",
    "no cost URL shortener",
    "free analytics",
    "free QR codes",
    "unlimited links",
    "free forever",
    "no subscription"
  ],
  openGraph: {
    title: "Pricing - Free URL Shortener | LinkHub",
    description: "LinkHub is completely free! Get unlimited URL shortening and advanced analytics.",
    url: '/pricing',
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingPage() {
  const features = [
    "Unlimited URL shortening",
    "Advanced analytics dashboard", 
    "QR code generation",
    "Geographic tracking",
    "Device & browser analytics",
    "Traffic source analysis",
    "Real-time click tracking",
    "Click deduplication",
    "Custom short codes",
    "Link management tools",
    "Export analytics data",
    "No ads or watermarks"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16">
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Simple, Transparent
          <span className="block gradient-text pb-2">Pricing</span>
        </h1>
        <p className="text-xl text-purple-200 mb-12 max-w-3xl mx-auto">
          LinkHub is completely free, forever. No hidden costs, no premium plans, no limits.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white font-semibold mb-8">
              <Zap className="h-5 w-5 mr-2" />
              100% Free Forever
            </div>
            
            <div className="mb-8">
              <h2 className="text-6xl lg:text-8xl font-bold text-white mb-4">
                $0
                <span className="text-2xl lg:text-3xl text-gray-400 font-normal">/month</span>
              </h2>
              <p className="text-xl text-purple-200">Everything included, no catch</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg"
            >
              Get Started Now - It's Free!
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Is LinkHub really free?</h3>
            <p className="text-gray-300">Yes! LinkHub is completely free with no hidden costs, premium plans, or usage limits. We believe powerful link management tools should be accessible to everyone.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Are there any limits on the number of links?</h3>
            <p className="text-gray-300">No limits! Create as many shortened URLs as you need. Our service is designed to handle everything from personal use to business-scale requirements.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">How do you make money if it's free?</h3>
            <p className="text-gray-300">LinkHub is a passion project focused on providing value to the community. We keep costs low through efficient architecture and may explore ethical monetization options in the future.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Will it always be free?</h3>
            <p className="text-gray-300">Our core features will always remain free. If we ever introduce premium features, the current functionality will continue to be available at no cost.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
