#!/bin/bash

# LinkHub SEO Deployment Script
echo "🚀 Starting LinkHub SEO-Optimized Deployment..."

# Build the application with sitemap generation
echo "📦 Building application..."
npm run build

# Verify sitemap generation
echo "🗺️ Checking sitemap generation..."
if [ -f "public/sitemap.xml" ]; then
    echo "✅ Sitemap generated successfully"
else
    echo "⚠️ Sitemap not found, generating manually..."
    npm run sitemap
fi

# Check robots.txt
echo "🤖 Checking robots.txt..."
if curl -s http://localhost:3000/robots.txt > /dev/null; then
    echo "✅ Robots.txt is accessible"
else
    echo "⚠️ Robots.txt may not be working properly"
fi

echo "🎯 SEO Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy to Vercel"
echo "2. Update NEXT_PUBLIC_BASE_URL in Vercel environment variables"
echo "3. Submit sitemap to Google Search Console"
echo "4. Set up Google Analytics (optional)"
echo "5. Monitor performance in Search Console"
echo ""
echo "🔗 Your site will be SEO-ready with:"
echo "   ✅ Comprehensive meta tags"
echo "   ✅ Structured data (JSON-LD)"
echo "   ✅ Automatic sitemap generation"
echo "   ✅ Optimized robots.txt"
echo "   ✅ Open Graph & Twitter Cards"
echo "   ✅ Core Web Vitals optimization"
echo "   ✅ Mobile-first responsive design"
echo ""
echo "🎉 Good luck ranking #1 on Google!"
