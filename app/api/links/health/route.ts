import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/lib/models/Link";

// Social / Bot-walled domains that return 999, 403, or fake 404 to automated server requests
// even when the public profile/page is completely live in a real user's browser.
const BOT_WALLED_DOMAINS = [
  "linkedin.com",
  "instagram.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "threads.net",
  "netflix.com",
];

function isBotWalledDomain(urlStr: string): boolean {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return BOT_WALLED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

// POST /api/links/health - Scans all user links (or a specific link) for 404/broken status
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = request.cookies.get("session")?.value;
    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const query: Record<string, any> = { userId: sessionId };
    if (body.linkId) {
      query._id = body.linkId;
    }

    const userLinks = await Link.find(query);

    const results = await Promise.all(
      userLinks.map(async (link) => {
        let status: "healthy" | "broken" = "healthy";
        let code = 200;

        try {
          // Validate URL format first
          const parsedUrl = new URL(link.originalUrl);

          // If it's a known bot-walled social platform (e.g. LinkedIn returns 999/404 to server fetch),
          // verify the URL structure is valid and mark as healthy
          if (isBotWalledDomain(parsedUrl.toString())) {
            status = "healthy";
            code = 200;
          } else {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(link.originalUrl, {
              method: "GET",
              redirect: "follow",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
              signal: controller.signal,
            });
            clearTimeout(timeout);

            code = response.status;
            // Only true 404 (Not Found), 410 (Gone), or 5xx (Server Down) are dead links.
            // 401/403/429/999 mean the server is alive behind auth or bot protection.
            if (code === 404 || code === 410 || code >= 500) {
              status = "broken";
            } else {
              status = "healthy";
            }
          }
        } catch {
          // Domain does not exist (DNS failure) or connection refused
          status = "broken";
          code = 0;
        }

        await Link.findByIdAndUpdate(link._id, {
          healthStatus: status,
          lastHealthCode: code,
          lastCheckedAt: new Date(),
        });

        return {
          _id: link._id,
          customName: link.customName,
          originalUrl: link.originalUrl,
          healthStatus: status,
          lastHealthCode: code,
        };
      })
    );

    return NextResponse.json({
      checkedCount: results.length,
      brokenCount: results.filter((r) => r.healthStatus === "broken").length,
      results,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ message: "Health check failed" }, { status: 500 });
  }
}
