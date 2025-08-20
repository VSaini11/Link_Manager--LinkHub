import type { Metadata } from "next"
import { Link2, BarChart3, QrCode, Shield, Zap, Users, Globe, Smartphone, TrendingUp } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: "Features - Advanced URL Shortener Tools | LinkHub",
  description: "Discover LinkHub's powerful features: URL shortening, QR code generation, advanced analytics, geographic tracking, device insights, and real-time click monitoring. Perfect for businesses and marketers.",
  keywords: [
    "URL shortener features",
    "link analytics",
    "QR code generator",
    "geographic tracking",
    "device analytics",
    "click tracking",
    "real-time analytics",
    "traffic analysis",
    "link management features",
    "business tools"
  ],
  openGraph: {
    title: "Features - Advanced URL Shortener Tools | LinkHub",
    description: "Discover LinkHub's powerful features: URL shortening, QR codes, analytics, and more.",
    url: '/features',
  },
  alternates: {
    canonical: '/features',
  },
}

export default function FeaturesPage() {
  const features = [
    {
      icon: Link2,
      title: "Smart URL Shortening",
      description: "Create custom shortened URLs with personalized names and easy-to-remember codes.",
      benefits: ["Custom short codes", "Bulk URL processing", "Link validation", "Clean URLs"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights with real-time click tracking, geographic data, and performance metrics.",
      benefits: ["Real-time tracking", "Geographic analytics", "Device insights", "Traffic sources"]
    },
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Instantly generate QR codes for your shortened URLs for easy mobile sharing.",
      benefits: ["Instant QR codes", "Mobile optimized", "High resolution", "Multiple formats"]
    },
    {
      icon: Shield,
      title: "Click Deduplication",
      description: "Accurate analytics with intelligent spam protection and duplicate click filtering.",
      benefits: ["Spam protection", "Accurate counts", "15-min windows", "Smart filtering"]
    },
    {
      icon: Globe,
      title: "Geographic Tracking",
      description: "Track clicks by country and city with detailed geographic analytics.",
      benefits: ["Country tracking", "City-level data", "IP geolocation", "Privacy-safe"]
    },
    {
      icon: Smartphone,
      title: "Device Analytics",
      description: "Understand your audience with detailed device, browser, and OS analytics.",
      benefits: ["Device types", "Browser data", "OS analytics", "Mobile insights"]
    },
    {
      icon: TrendingUp,
      title: "Performance Trends",
      description: "Monitor link performance with period-over-period trend analysis.",
      benefits: ["Trend analysis", "Growth metrics", "Performance tiers", "Smart insights"]
    },
    {
      icon: Users,
      title: "Traffic Source Analysis",
      description: "Identify where your clicks come from with intelligent referrer categorization.",
      benefits: ["Source tracking", "Social media", "Search engines", "Direct traffic"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16">
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
          Powerful Features for
          <span className="block gradient-text">Modern Link Management</span>
        </h1>
        <p className="text-xl text-purple-200 mb-12 max-w-3xl mx-auto">
          Everything you need to create, track, and optimize your shortened URLs with advanced analytics and insights.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
              <div className="flex items-center mb-4">
                <feature.icon className="h-8 w-8 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-300 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-400">
                    <Zap className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center px-6 py-16 border-t border-white/10">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust LinkHub for their link management needs.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg"
        >
          Start Free Today
        </Link>
      </div>
    </div>
  )
}
