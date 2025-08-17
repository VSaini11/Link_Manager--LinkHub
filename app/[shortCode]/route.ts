import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Link from '@/lib/models/Link';
import ClickAnalytics from '@/lib/models/ClickAnalytics';
import { UAParser } from 'ua-parser-js';

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;
  
  try {
    await dbConnect();
    
    console.log(`Looking for short code: ${shortCode}`);
    
    // Try multiple search strategies - be more flexible with URL matching
    let link = null;
    
    // Strategy 1: Look for any URL ending with this short code
    link = await Link.findOne({ 
      shortUrl: { $regex: `/${shortCode}$` }
    });
    
    // Strategy 2: If that fails, look for the short code anywhere in the URL
    if (!link) {
      console.log('Ending pattern search failed, trying contains search...');
      link = await Link.findOne({ 
        shortUrl: { $regex: shortCode, $options: 'i' }
      });
    }
    
    // Strategy 3: Try with current request origin
    if (!link) {
      console.log('Contains search failed, trying with request origin...');
      const requestUrl = new URL(request.url);
      const requestOrigin = requestUrl.origin;
      const fullShortUrl = `${requestOrigin}/${shortCode}`;
      
      link = await Link.findOne({ 
        shortUrl: fullShortUrl
      });
    }
    
    if (!link) {
      console.log(`No link found for short code: ${shortCode}`);
      // Let's debug what links exist
      const allLinks = await Link.find({}).limit(5);
      console.log('Sample links in database:', allLinks.map(l => ({ shortUrl: l.shortUrl, originalUrl: l.originalUrl })));
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log(`Found link! Redirecting ${shortCode} to ${link.originalUrl}`);

    // Get user information for analytics
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('cf-connecting-ip') || // Cloudflare
               '127.0.0.1';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Parse user agent
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Determine referrer domain and source
    let referrerDomain = 'Direct';
    let referrerSource = 'Direct';
    
    console.log('Raw referrer header:', referrer);
    
    if (referrer && referrer.trim() !== '') {
      try {
        const referrerUrl = new URL(referrer);
        referrerDomain = referrerUrl.hostname;
        
        console.log('Parsed referrer domain:', referrerDomain);
        
        // Check if referrer is from the same application (localhost or your domain)
        if (referrerDomain === 'localhost' || referrerDomain.includes('127.0.0.1') || referrerDomain.includes('192.168.')) {
          console.log('Self-referral detected (same application), treating as Direct');
          referrerDomain = 'Direct';
          referrerSource = 'Direct';
        } else if (referrerDomain.includes('google') || referrerDomain.includes('bing') || referrerDomain.includes('yahoo')) {
          referrerSource = 'Search';
        } else if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter') || referrerDomain.includes('instagram') || 
                   referrerDomain.includes('linkedin') || referrerDomain.includes('tiktok') || referrerDomain.includes('youtube')) {
          referrerSource = 'Social Media';
        } else if (referrerDomain.includes('gmail') || referrerDomain.includes('outlook') || referrerDomain.includes('mail')) {
          referrerSource = 'Email';
        } else {
          referrerSource = 'Other';
        }
        
        console.log('Categorized referrer source:', referrerSource);
      } catch (error) {
        console.log('Error parsing referrer:', error);
        referrerDomain = 'Direct';
        referrerSource = 'Direct';
      }
    } else {
      console.log('No referrer detected, setting as Direct');
      referrerDomain = 'Direct';
      referrerSource = 'Direct';
    }

    // Get location data from IP (for now we'll use a simple geolocation API)
    let locationData = { country: 'Unknown', city: 'Unknown' };
    const clientIp = ip.split(',')[0].trim();
    
    console.log('Client IP for geolocation:', clientIp);
    
    try {
      // Skip localhost/private IPs and set default location for development
      if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
        console.log('Private/localhost IP detected, using default location for India');
        locationData = { country: 'India', city: 'New Delhi' }; // Default for development/localhost
      } else {
        // Use ipinfo.io for geolocation (free tier allows 50k requests/month)
        const geoResponse = await fetch(`https://ipinfo.io/${clientIp}/json`);
        console.log('Geolocation API response status:', geoResponse.status);
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          console.log('Geolocation data received:', geoData);
          
          locationData = {
            country: geoData.country || 'Unknown',
            city: geoData.city || 'Unknown'
          };
          
          // Map country codes to full names
          const countryMap: { [key: string]: string } = {
            'IN': 'India',
            'US': 'United States',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France',
            'JP': 'Japan',
            'CN': 'China',
            'BR': 'Brazil'
          };
          
          if (countryMap[locationData.country]) {
            locationData.country = countryMap[locationData.country];
          }
          
        } else {
          console.log('Geolocation API failed with status:', geoResponse.status);
          locationData = { country: 'India', city: 'New Delhi' }; // Default fallback
        }
      }
    } catch (error) {
      console.error('Geolocation lookup failed:', error);
      locationData = { country: 'India', city: 'New Delhi' }; // Default fallback for errors
    }
    
    console.log('Final location data:', locationData);

    // Check for duplicate clicks within a time window (15 minutes)
    const duplicateWindow = 15 * 60 * 1000; // 15 minutes in milliseconds
    const cutoffTime = new Date(Date.now() - duplicateWindow);
    
    // Check for recent clicks from same IP + User Agent + Link combination
    const recentClick = await ClickAnalytics.findOne({
      linkId: link._id,
      ipAddress: ip.split(',')[0].trim(),
      userAgent: userAgent,
      timestamp: { $gte: cutoffTime }
    });
    
    console.log('Checking for duplicate clicks...');
    console.log('- IP:', ip.split(',')[0].trim());
    console.log('- User Agent:', userAgent);
    console.log('- Cutoff time:', cutoffTime);
    console.log('- Recent click found:', !!recentClick);

    // Only count as new click if no recent duplicate found
    const isUniqueClick = !recentClick;
    
    if (isUniqueClick) {
      console.log('✅ Unique click detected - counting and saving analytics');
      
      // Save detailed analytics
      try {
        const analyticsData = {
          linkId: link._id,
          userId: 'session-user', // You might want to get this from session if available
          ipAddress: ip.split(',')[0].trim(),
          userAgent,
          deviceType: device.type ? (device.type.charAt(0).toUpperCase() + device.type.slice(1)) : 'Desktop',
          browser: browser.name || 'Unknown',
          os: os.name || 'Unknown',
          country: locationData.country,
          city: locationData.city,
          region: 'Unknown', // Could be extracted from geo data if available
          referrer: referrer,
          referrerDomain: referrerDomain, // This should be 'Direct' for copy/paste
          timestamp: new Date()
        };
        
        console.log('Final analytics data to save:');
        console.log('- Referrer:', referrer);
        console.log('- Referrer Domain:', referrerDomain);
        console.log('- Referrer Source:', referrerSource);
        console.log('Saving analytics data:', analyticsData);
        const savedAnalytics = await ClickAnalytics.create(analyticsData);
        console.log('Analytics saved successfully:', savedAnalytics._id);
      } catch (error) {
        console.error('Error saving analytics:', error);
      }

      // Increment click count only for unique clicks
      await Link.findByIdAndUpdate(link._id, { 
        $inc: { clicks: 1 } 
      });
      
      console.log('Click count incremented for unique click');
    } else {
      console.log('⚠️ Duplicate click detected - skipping count increment');
      console.log('Recent click details:', {
        timestamp: recentClick.timestamp,
        timeSinceLastClick: Date.now() - recentClick.timestamp.getTime(),
        windowMs: duplicateWindow
      });
    }
    
    // Redirect to the original URL
    return NextResponse.redirect(new URL(link.originalUrl));
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
