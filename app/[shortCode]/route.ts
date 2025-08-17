import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Link from '@/lib/models/Link';

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
    
    // Increment click count
    await Link.findByIdAndUpdate(link._id, { 
      $inc: { clicks: 1 } 
    });
    
    // Redirect to the original URL
    return NextResponse.redirect(new URL(link.originalUrl));
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
