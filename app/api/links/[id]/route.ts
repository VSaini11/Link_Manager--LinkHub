import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/lib/models/Link";

// In a real app, you'd use a proper database
const links: Array<{
  id: string;
  userId: string;
  originalUrl: string;
  shortUrl: string;
  customName: string;
  clicks: number;
  createdAt: string;
}> = [];

// GET - Fetch all links for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Get all links for the authenticated user
    const userLinks = await Link.find({ userId: sessionId }).sort({ createdAt: -1 });

    return NextResponse.json(userLinks);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new shortened link
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { originalUrl, shortUrl, customName } = body;

    // Validate required fields
    if (!originalUrl || !shortUrl || !customName) {
      return NextResponse.json(
        { message: "Missing required fields: originalUrl, shortUrl, customName" }, 
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
    }

    // Check if custom name already exists for this user
    const existingLink = await Link.findOne({ 
      userId: sessionId, 
      customName: customName 
    });

    if (existingLink) {
      return NextResponse.json(
        { message: "Custom name already exists" }, 
        { status: 409 }
      );
    }

    // Create new link
    const newLink = new Link({
      userId: sessionId,
      originalUrl,
      shortUrl,
      customName,
      clicks: 0,
      createdAt: new Date().toISOString(),
    });

    const savedLink = await newLink.save();

    return NextResponse.json(savedLink, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a specific link (you already have this, but here's an improved version)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const deletedLink = await Link.findOneAndDelete({
      _id: params.id,
      userId: sessionId, // Ensure user can only delete their own links
    });

    if (!deletedLink) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}