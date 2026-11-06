import type { Metadata } from "next"
import { Link2, HelpCircle, MessageCircle, Book, Mail, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: "Help Center - Support & Documentation | LinkHub",
  description: "Get help with LinkHub's URL shortener. Find answers to common questions, learn how to use analytics, and get support for link management.",
  keywords: [
    "LinkHub help",
    "URL shortener support",
    "how to use LinkHub",
    "link analytics help",
    "QR code generator help",
    "troubleshooting",
    "user guide"
  ],
  openGraph: {
    title: "Help Center - Support & Documentation | LinkHub",
    description: "Get help with LinkHub's URL shortener and analytics features.",
    url: '/help',
  },
  alternates: {
    canonical: '/help',
  },
}

export default function HelpPage() {
  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create my first shortened URL?",
          a: "After signing up, go to your dashboard and paste any URL into the input field. Click 'Shorten' and you'll get a custom short link instantly."
        },
        {
          q: "Is LinkHub really free?",
          a: "Yes! LinkHub is completely free with unlimited link shortening, full analytics, and QR code generation. No hidden fees or premium plans."
        },
        {
          q: "Do I need to sign up to use LinkHub?",
          a: "Yes, you need to create a free account to use LinkHub. This allows us to provide you with analytics, link management, and personalized features."
        }
      ]
    },
    {
      category: "Analytics & Tracking",
      questions: [
        {
          q: "What analytics data can I see?",
          a: "You can track clicks, geographic locations (country/city), device types, browsers, traffic sources, and real-time performance trends."
        },
        {
          q: "How accurate is the click tracking?",
          a: "Very accurate! We use advanced deduplication to prevent spam clicks and provide genuine analytics. Each unique visitor is tracked properly."
        },
        {
          q: "Can I export my analytics data?",
          a: "Currently, you can view all analytics in your dashboard. Data export features are planned for future releases."
        }
      ]
    },
    {
      category: "QR Codes",
      questions: [
        {
          q: "How do I generate QR codes?",
          a: "QR codes are automatically available for every shortened URL. You can download them directly from your dashboard."
        },
        {
          q: "What format are the QR codes?",
          a: "QR codes are provided in high-quality PNG format, perfect for both digital and print use."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "My shortened URL isn't working. What should I do?",
          a: "First, check if the original URL is working. If the issue persists, contact our support team with the short URL details."
        },
        {
          q: "Can I customize my short URLs?",
          a: "Yes! You can add custom names to your links for better organization and branding."
        },
        {
          q: "Is there a limit on how many URLs I can shorten?",
          a: "No limits! Create as many shortened URLs as you need, completely free."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16 sm:py-20 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-slate-900 mb-5 tracking-tight">
          Help <span className="gradient-text">Center</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Find fast answers to common questions and learn how to get the most out of your links.
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card rounded-2xl p-7 text-center card-hover flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Book className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">User Guide</h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">Learn how to make the most of all LinkHub tools</p>
            <Link href="#faq" className="mt-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Browse FAQ →
            </Link>
          </div>
          
          <div className="glass-card rounded-2xl p-7 text-center card-hover flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">Get direct assistance from our development team</p>
            <a href="mailto:support@linkhub.dev" className="mt-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Email Support →
            </a>
          </div>
          
          <div className="glass-card rounded-2xl p-7 text-center card-hover flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <ExternalLink className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">Quick Start</h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">Jump right in and create your first short URL</p>
            <Link href="/signup" className="mt-auto text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Get Started →
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="max-w-4xl mx-auto px-6 pb-20 w-full">
        <h2 className="text-3xl font-heading font-extrabold text-slate-900 text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
        
        <div className="space-y-10">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-heading font-bold text-indigo-600 mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {category.category}
              </h3>
              
              <div className="space-y-3.5">
                {category.questions.map((item, questionIndex) => (
                  <div key={questionIndex} className="glass-card rounded-2xl p-6">
                    <h4 className="text-base font-heading font-bold text-slate-900 mb-2">{item.q}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mb-3 tracking-tight">Still Need Help?</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Can't find what you're looking for? Reach out and we'll help you get sorted out quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <a
              href="mailto:support@linkhub.dev"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/20"
            >
              Email Support
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
