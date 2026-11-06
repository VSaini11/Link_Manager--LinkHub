import type { Metadata } from "next"
import { Link2, Check, Zap, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16 sm:py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
          <Zap className="h-4 w-4 text-emerald-600" />
          100% Free Forever
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          Simple, Transparent{" "}
          <span className="gradient-text pb-2">Pricing</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          LinkHub is completely free. No hidden costs, no premium tiers, no surprise fees.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-4xl mx-auto px-6 pb-20 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <h2 className="text-6xl lg:text-8xl font-heading font-extrabold text-slate-900 mb-2">
                $0
                <span className="text-2xl lg:text-3xl text-slate-400 font-normal">/forever</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium">All features included right out of the box</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-10 text-left max-w-2xl mx-auto pt-4 border-t border-slate-100">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm font-medium text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/20"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20 w-full mt-6">
        <h2 className="text-3xl font-heading font-extrabold text-slate-900 text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">Is LinkHub really free?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Yes! LinkHub is completely free with no hidden costs, premium plans, or usage limits. We believe reliable link tools should be accessible to everyone.</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">Are there any limits on the number of links?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">No limits. Create as many shortened URLs as you need. Our system is built to comfortably handle both personal projects and business workloads.</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">How do you manage costs if it's free?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">LinkHub is engineered with efficient serverless architecture, caching, and lightweight storage to minimize infrastructure overhead.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
