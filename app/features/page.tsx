import type { Metadata } from "next"
import { Link2, BarChart3, QrCode, Shield, Zap, Users, Globe, Smartphone, TrendingUp, Check, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16 sm:py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
          Platform Capabilities
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-slate-900 mb-6 tracking-tight">
          Powerful Features for{" "}
          <span className="gradient-text">Modern Link Management</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Everything you need to create, track, and optimize your shortened URLs with clean, legible analytics.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{feature.description}</p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-slate-100">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-xs font-medium text-slate-500">
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center px-6 py-16 border-t border-slate-200 bg-white mt-auto">
        <h2 className="text-3xl font-heading font-bold text-slate-900 mb-3 tracking-tight">Ready to Get Started?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto text-sm sm:text-base">
          Join thousands of users who trust LinkHub for their link management needs. Free forever.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/20"
        >
          Start Free Today
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
