import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Link from '@/lib/models/Link';

interface RedirectPageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = await params;
  
  try {
    await dbConnect();
    
    // Build the full short URL to match what's stored in database
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullShortUrl = `${baseUrl}/${shortCode}`;
    
    // Find the link by exact match of the short URL
    const link = await Link.findOne({ 
      shortUrl: fullShortUrl
    });
    
    if (!link) {
      console.log(`No link found for short code: ${shortCode}, full URL: ${fullShortUrl}`);
      // If link not found, redirect to home page
      redirect('/');
    }
    
    console.log(`Redirecting ${shortCode} to ${link.originalUrl}`);
    
    // Increment click count
    await Link.findByIdAndUpdate(link._id, { 
      $inc: { clicks: 1 } 
    });
    
    // Redirect to the original URL
    
    // Redirect to the original URL
    redirect(link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    redirect('/');
  }
}
