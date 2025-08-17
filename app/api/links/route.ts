import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/lib/models/Link";

// Helper to generate short URL
function generateShortUrl(request?: NextRequest): string {
  const shortCode = Math.random().toString(36).substr(2, 8);
  
  // Try to get base URL from environment, then from request, fallback to localhost
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl && request) {
    const url = new URL(request.url);
    baseUrl = url.origin;
  }
  
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }
  
  return `${baseUrl}/${shortCode}`;
}

// GET all links for a logged-in user
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userLinks = await Link.find({ userId: sessionId });

    return NextResponse.json(userLinks);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST a new shortened link
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { originalUrl, customName, shortUrl } = await request.json();

    const newLink = await Link.create({
      userId: sessionId,
      originalUrl,
      customName,
      shortUrl: shortUrl || generateShortUrl(request), // Use provided shortUrl or generate one
      clicks: 0,
      createdAt: new Date(),
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
