import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/lib/models/Link";

// POST /api/conversions
// Supports 1-click conversion recording from dashboard OR webhook payload from Shopify / WooCommerce / Razorpay / Stripe
export async function POST(request: NextRequest) {
  // Handle CORS preflight & cross-origin tracking from vybexai.vercel.app or any customer website
  const origin = request.headers.get("origin") || "*";

  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));

    // Extract Razorpay nested notes (payload.payment.entity.notes) or direct notes
    const rzNotes =
      body.payload?.payment?.entity?.notes ||
      body.payload?.subscription?.entity?.notes ||
      body.notes ||
      body.metadata ||
      {};

    // Extract link identifier
    const linkId = body.linkId || rzNotes.linkId;
    const shortCode =
      body.shortCode ||
      body.lh_link ||
      body.ref ||
      rzNotes.lh_link ||
      rzNotes.shortCode ||
      rzNotes.ref ||
      rzNotes.campaign;

    // Extract sale amount dynamically in ₹:
    // 1. Direct API body: { amount: 799 } or { revenue: 799 }
    // 2. Razorpay Webhook: payload.payment.entity.amount (in paise)
    // 3. Stripe Webhook: data.object.amount (in cents)
    let amount = Number(body.amount ?? body.revenue ?? body.total_price ?? 0);

    if (body.entity === "event" && body.payload?.payment?.entity?.amount) {
      // Razorpay webhook format (amount in paise -> convert to ₹)
      amount = Number(body.payload.payment.entity.amount) / 100;
    } else if (body.type?.startsWith("charge.") || body.type?.startsWith("payment_intent.")) {
      // Stripe webhook format (amount in cents -> convert to ₹ or $)
      const stripeAmount = body.data?.object?.amount;
      if (stripeAmount) amount = Number(stripeAmount) / 100;
    }

    let link = linkId ? await Link.findById(linkId) : null;
    if (!link && shortCode) {
      link = await Link.findOne({
        shortUrl: { $regex: `/${shortCode}$`, $options: "i" },
      });
    }

    // Dynamic Fallback 1: Match by domain if passed in body, notes, or origin
    const siteHint =
      body.sourceSite ||
      body.origin ||
      rzNotes.sourceSite ||
      rzNotes.site ||
      request.headers.get("origin") ||
      "";

    if (!link && siteHint) {
      const site = siteHint.replace(/^https?:\/\//, '').split('/')[0];
      if (site) {
        link = await Link.findOne({
          destinationUrl: { $regex: site, $options: "i" }
        }).sort({ updatedAt: -1 });
      }
    }

    // Dynamic Fallback 2: If Webhook came from Razorpay without notes, attribute to the user's active campaign link pointing to vybexai
    if (!link && (body.entity === "event" || body.event?.startsWith("payment.") || body.event?.startsWith("subscription."))) {
      link = await Link.findOne({
        destinationUrl: { $regex: "vybexai", $options: "i" }
      }).sort({ updatedAt: -1 });

      // Fallback 3: If no vybex link found, attribute to the most recently created active campaign link
      if (!link) {
        link = await Link.findOne({}).sort({ createdAt: -1 });
      }
    }

    if (!link) {
      return NextResponse.json(
        { message: "Target link not found for attribution" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // If no amount was sent in request, fall back to the dynamic conversionValue set on this specific Link
    const finalRevenueToAdd = amount > 0 ? amount : (link.conversionValue || 0);

    const updated = await Link.findByIdAndUpdate(
      link._id,
      {
        $inc: {
          conversions: 1,
          revenue: finalRevenueToAdd,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Sale & ₹${finalRevenueToAdd} revenue attributed to link "${updated?.customName || link.shortUrl}"`,
        linkName: updated?.customName,
        shortUrl: updated?.shortUrl,
        plan: body.plan || body.metadata?.plan,
        attributedAmount: finalRevenueToAdd,
        totalRevenue: updated?.revenue,
        totalConversions: updated?.conversions,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Conversion webhook error:", error);
    return NextResponse.json(
      { message: "Failed to attribute conversion", error: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// OPTIONS handler for cross-origin CORS requests from vybexai.vercel.app
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

