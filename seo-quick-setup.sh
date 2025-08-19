#!/bin/bash

# LinkHub SEO Quick Setup Script
# Run this after setting up Google Search Console

echo "🚀 LinkHub SEO Quick Indexing Setup"
echo "======================================"
echo ""
echo "Your website: https://golinkhub.vercel.app/"
echo ""

# Submit to search engines programmatically
echo "📤 Submitting sitemap to search engines..."

# Google Search Console (requires manual setup first)
echo "🔍 Google Search Console:"
echo "1. Go to: https://search.google.com/search-console/"
echo "2. Add property: https://golinkhub.vercel.app"
echo "3. Verify ownership"
echo "4. Submit sitemap: https://golinkhub.vercel.app/sitemap.xml"
echo ""

# Bing Webmaster Tools
echo "🔍 Bing Webmaster Tools:"
echo "1. Go to: https://www.bing.com/webmasters/"
echo "2. Add site: https://golinkhub.vercel.app"
echo "3. Submit sitemap: https://golinkhub.vercel.app/sitemap.xml"
echo ""

# Submit to IndexNow (for faster indexing)
echo "⚡ IndexNow Quick Indexing:"
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "golinkhub.vercel.app",
    "key": "your-indexnow-key",
    "urlList": [
      "https://golinkhub.vercel.app/",
      "https://golinkhub.vercel.app/features",
      "https://golinkhub.vercel.app/pricing",
      "https://golinkhub.vercel.app/help",
      "https://golinkhub.vercel.app/signup"
    ]
  }'

echo ""
echo "✅ Manual submission URLs for Google Search Console:"
echo "https://golinkhub.vercel.app/"
echo "https://golinkhub.vercel.app/features"
echo "https://golinkhub.vercel.app/pricing"
echo "https://golinkhub.vercel.app/help"
echo "https://golinkhub.vercel.app/signup"
echo ""

echo "📈 Next steps:"
echo "1. Set up Google Analytics"
echo "2. Create social media profiles"
echo "3. Submit to product directories"
echo "4. Start content marketing"
echo ""

echo "🎯 Expected timeline:"
echo "- 1-3 days: Google discovers your site"
echo "- 1-2 weeks: Basic indexing"
echo "- 2-4 weeks: Branded search visibility"
echo "- 1-3 months: Competitive keyword rankings"
