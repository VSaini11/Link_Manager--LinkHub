import type { Metadata } from "next"
import { Link2, HelpCircle, MessageCircle, Book, Mail, ExternalLink } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="text-center px-6 py-16">
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
          Help Center
        </h1>
        <p className="text-xl text-purple-200 mb-12 max-w-3xl mx-auto">
          Get answers to common questions and learn how to make the most of LinkHub's features.
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <Book className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">User Guide</h3>
            <p className="text-gray-300 mb-4">Learn how to use all LinkHub features effectively</p>
            <Link href="#faq" className="text-purple-400 hover:text-purple-300 transition-colors">
              Browse FAQ →
            </Link>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Contact Support</h3>
            <p className="text-gray-300 mb-4">Get direct help from our support team</p>
            <a href="mailto:support@linkhub.dev" className="text-blue-400 hover:text-blue-300 transition-colors">
              Email Support →
            </a>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <ExternalLink className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Quick Start</h3>
            <p className="text-gray-300 mb-4">Jump right in and create your first link</p>
            <Link href="/signup" className="text-green-400 hover:text-green-300 transition-colors">
              Get Started →
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-2xl font-semibold text-purple-300 mb-6 flex items-center">
                <HelpCircle className="h-6 w-6 mr-2" />
                {category.category}
              </h3>
              
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => (
                  <div key={questionIndex} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-3">{item.q}</h4>
                    <p className="text-gray-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl p-8 border border-white/10 text-center">
          <Mail className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of LinkHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@linkhub.dev"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300"
            >
              Email Support
            </a>
            <Link
              href="/"
              className="inline-block px-8 py-4 border border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
