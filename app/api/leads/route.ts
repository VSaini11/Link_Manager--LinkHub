import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import Link from "@/lib/models/Link";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { linkId, shortCode, contact, name } = await request.json();

    if (!contact) {
      return NextResponse.json({ message: "Contact is required" }, { status: 400 });
    }

    let link = linkId ? await Link.findById(linkId) : null;
    if (!link && shortCode) {
      link = await Link.findOne({ shortUrl: { $regex: `/${shortCode}$`, $options: "i" } });
    }

    if (!link) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 });
    }

    // Detect deviceType and country for the captured lead
    const ua = request.headers.get("user-agent") || "";
    const deviceType = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)
      ? "Mobile"
      : /tablet|ipad/i.test(ua)
      ? "Tablet"
      : "Desktop";

    const countryHeader =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      "India";

    const newLead = await Lead.create({
      linkId: link._id,
      userId: link.userId,
      contact: contact.trim(),
      name: (name || "Visitor").trim(),
      country: countryHeader === "IN" ? "India" : countryHeader,
      deviceType,
      createdAt: new Date(),
    });

    await Link.findByIdAndUpdate(link._id, {
      $inc: { leadsCount: 1 },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = request.cookies.get("session")?.value;
    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const leads = await Lead.find({ userId: sessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("linkId", "customName shortUrl")
      .lean();

    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
