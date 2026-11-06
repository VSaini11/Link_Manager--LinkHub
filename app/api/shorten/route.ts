import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/lib/models/Link";

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const sessionId = request.cookies.get("session")?.value;
    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      originalUrl,
      customName,
      conversionValue,
      mobileUrl,
      abTestUrl,
      abSplitPercent,
      fallbackUrl,
      affiliateName,
      commissionRate,
      leadCaptureEnabled,
      leadPromptText,
    } = body;

    if (!originalUrl) {
      return NextResponse.json({ message: "Original URL is required" }, { status: 400 });
    }

    // Determine the base URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      const url = new URL(request.url);
      baseUrl = url.origin;
    }

    const shortCode = generateShortCode();
    const shortUrl = `${baseUrl.replace(/\/$/, "")}/${shortCode}`;

    const newLink = await Link.create({
      userId: sessionId,
      originalUrl,
      customName: customName || shortCode,
      shortUrl,
      clicks: 0,
      conversionValue: Number(conversionValue) || 0,
      mobileUrl: mobileUrl || "",
      abTestUrl: abTestUrl || "",
      abSplitPercent: abSplitPercent !== undefined ? Number(abSplitPercent) : 50,
      fallbackUrl: fallbackUrl || "",
      affiliateName: affiliateName || "",
      commissionRate: Number(commissionRate) || 10,
      leadCaptureEnabled: Boolean(leadCaptureEnabled),
      leadPromptText: leadPromptText || "Enter your email or WhatsApp number to continue",
      createdAt: new Date(),
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error: any) {
    console.error("Shorten URL error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create short link" },
      { status: 500 }
    );
  }
}
