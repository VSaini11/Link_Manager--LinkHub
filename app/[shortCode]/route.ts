import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Link from '@/lib/models/Link';
import ClickAnalytics from '@/lib/models/ClickAnalytics';
import { UAParser } from 'ua-parser-js';

// Comprehensive bot/spider/preview crawler pattern
const BOT_USER_AGENT_REGEX = /bot|crawler|spider|crawling|facebookexternalhit|facebot|linkedinbot|twitterbot|whatsapp|telegrambot|discordbot|slackbot|skypeuripreview|pinterest|vkshare|W3C_Validator|redditbot|applebot|bingbot|googlebot|yandex|baiduspider|duckduckbot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|headlesschrome|phantomjs|puppeteer|playwright|selenium|curl|wget|python-requests|axios|go-http-client|postman/i;

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function getCountryFullName(codeOrName: string): string {
  if (!codeOrName || codeOrName === 'Unknown') return 'Unknown';
  const trimmed = codeOrName.trim();
  if (trimmed.length === 2) {
    try {
      return regionNames.of(trimmed.toUpperCase()) || trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function normalizeDeviceType(rawType?: string, ua: string = ''): 'Mobile' | 'Desktop' | 'Tablet' {
  const lowerType = (rawType || '').toLowerCase();
  if (lowerType === 'tablet' || /ipad|tablet|kindle|playbook|silk/i.test(ua)) {
    return 'Tablet';
  }
  if (
    lowerType === 'mobile' ||
    lowerType === 'wearable' ||
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

function classifyReferrer(referrerHeader: string, requestUrl: URL): { domain: string; source: 'Direct' | 'Social Media' | 'Search' | 'Messaging' | 'Email' | 'AI / Referral' | 'Other' } {
  // 1. Check UTM / ref query parameters on the short link itself (very useful when apps strip Referer header)
  const utmSource = (
    requestUrl.searchParams.get('utm_source') ||
    requestUrl.searchParams.get('ref') ||
    requestUrl.searchParams.get('source') ||
    ''
  ).toLowerCase();

  const utmMedium = (requestUrl.searchParams.get('utm_medium') || '').toLowerCase();

  const checkToken = (token: string): { domain: string; source: 'Direct' | 'Social Media' | 'Search' | 'Messaging' | 'Email' | 'AI / Referral' | 'Other' } | null => {
    if (!token) return null;
    if (/linkedin|lnkd\.in/.test(token)) return { domain: 'linkedin.com', source: 'Social Media' };
    if (/twitter|x\.com|t\.co/.test(token)) return { domain: 'x.com', source: 'Social Media' };
    if (/instagram|ig\.me/.test(token)) return { domain: 'instagram.com', source: 'Social Media' };
    if (/facebook|fb\.com|fb\.me|m\.facebook/.test(token)) return { domain: 'facebook.com', source: 'Social Media' };
    if (/youtube|youtu\.be/.test(token)) return { domain: 'youtube.com', source: 'Social Media' };
    if (/reddit|redd\.it/.test(token)) return { domain: 'reddit.com', source: 'Social Media' };
    if (/tiktok/.test(token)) return { domain: 'tiktok.com', source: 'Social Media' };
    if (/pinterest|pin\.it/.test(token)) return { domain: 'pinterest.com', source: 'Social Media' };
    if (/threads\.net/.test(token)) return { domain: 'threads.net', source: 'Social Media' };
    if (/github\.com/.test(token)) return { domain: 'github.com', source: 'Social Media' };

    if (/whatsapp|wa\.me/.test(token)) return { domain: 'whatsapp.com', source: 'Messaging' };
    if (/telegram|t\.me/.test(token)) return { domain: 'telegram.org', source: 'Messaging' };
    if (/discord|discordapp/.test(token)) return { domain: 'discord.com', source: 'Messaging' };
    if (/slack/.test(token)) return { domain: 'slack.com', source: 'Messaging' };
    if (/teams\.microsoft/.test(token)) return { domain: 'teams.microsoft.com', source: 'Messaging' };

    if (/google|bing|yahoo|duckduckgo|baidu|yandex|brave|ecosia/.test(token)) {
      return { domain: token.includes('.') ? token : `${token}.com`, source: 'Search' };
    }

    if (/chatgpt|openai|perplexity|claude\.ai|gemini\.google|copilot\.microsoft/.test(token)) {
      return { domain: token.includes('.') ? token : 'ai-assistant', source: 'AI / Referral' };
    }

    if (/gmail|outlook|mail\.yahoo|proton\.me| protonmail|newsletter|email/.test(token) || utmMedium === 'email') {
      return { domain: token.includes('.') ? token : 'Email Client', source: 'Email' };
    }
    return null;
  };

  // If UTM parameter is present, prioritize it if Referer is empty
  if (!referrerHeader || referrerHeader.trim() === '') {
    const fromUtm = checkToken(utmSource);
    if (fromUtm) return fromUtm;
    if (utmSource) return { domain: utmSource, source: 'Other' };
    return { domain: 'Direct', source: 'Direct' };
  }

  // Handle special Android app-uri referrers e.g. android-app://com.linkedin.android/
  if (referrerHeader.startsWith('android-app://')) {
    const pkg = referrerHeader.replace('android-app://', '').split('/')[0].toLowerCase();
    const matched = checkToken(pkg);
    if (matched) return matched;
    return { domain: pkg, source: 'Other' };
  }

  try {
    const referrerUrl = new URL(referrerHeader);
    const host = referrerUrl.hostname.replace(/^www\./i, '').toLowerCase();

    // Ignore self-referrals (clicking from own dashboard or localhost)
    const selfHost = requestUrl.hostname.replace(/^www\./i, '').toLowerCase();
    if (
      host === selfHost ||
      host === 'localhost' ||
      host.includes('127.0.0.1') ||
      host.startsWith('192.168.')
    ) {
      return { domain: 'Direct', source: 'Direct' };
    }

    const matched = checkToken(host);
    if (matched) {
      return { domain: host, source: matched.source };
    }

    return { domain: host, source: 'Other' };
  } catch {
    return { domain: 'Direct', source: 'Direct' };
  }
}

async function resolveLocation(request: NextRequest, clientIp: string): Promise<{ country: string; city: string; region: string }> {
  // 1. Check edge network headers first (Vercel / Cloudflare / CloudFront) - 0ms latency!
  const headerCountry =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('cloudfront-viewer-country');

  const headerCity =
    request.headers.get('x-vercel-ip-city') ||
    request.headers.get('cf-ipcity');

  const headerRegion =
    request.headers.get('x-vercel-ip-country-region') ||
    request.headers.get('cf-region');

  if (headerCountry && headerCountry !== 'XX') {
    return {
      country: getCountryFullName(headerCountry),
      city: headerCity ? decodeURIComponent(headerCity) : 'Unknown',
      region: headerRegion ? decodeURIComponent(headerRegion) : 'Unknown'
    };
  }

  // 2. Localhost / private network fallback
  if (
    !clientIp ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp.startsWith('192.168.') ||
    clientIp.startsWith('10.') ||
    clientIp.startsWith('172.')
  ) {
    return { country: 'India', city: 'New Delhi', region: 'Delhi' };
  }

  // 3. Primary lookup via ipinfo.io (with optional token if configured)
  try {
    const tokenParam = process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    const geoResponse = await fetch(`https://ipinfo.io/${clientIp}/json${tokenParam}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData && geoData.country) {
        return {
          country: getCountryFullName(geoData.country),
          city: geoData.city || 'Unknown',
          region: geoData.region || 'Unknown'
        };
      }
    }
  } catch {
    // Proceed to backup
  }

  // 4. Backup lookup via ip-api.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const backupRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (backupRes.ok) {
      const data = await backupRes.json();
      if (data.status === 'success' && data.country) {
        return {
          country: data.country,
          city: data.city || 'Unknown',
          region: data.regionName || 'Unknown'
        };
      }
    }
  } catch {
    // Ignore
  }

  return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  try {
    await dbConnect();

    const escapedCode = shortCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find link matching the shortCode at the end of shortUrl
    let link = await Link.findOne({
      shortUrl: { $regex: `/${escapedCode}$`, $options: 'i' }
    });

    if (!link) {
      const requestUrl = new URL(request.url);
      const fullShortUrl = `${requestUrl.origin}/${shortCode}`;
      link = await Link.findOne({ shortUrl: fullShortUrl });
    }

    if (!link) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const requestUrl = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const rawIp =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

    const clientIp = rawIp.replace(/^::ffff:/, '');
    const referrerHeader = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Check if request is a bot/preview crawler or browser prefetch
    const purpose = (
      request.headers.get('purpose') ||
      request.headers.get('x-purpose') ||
      request.headers.get('sec-purpose') ||
      request.headers.get('x-moz') ||
      ''
    ).toLowerCase();

    const isPrefetch = purpose.includes('preview') || purpose.includes('prefetch') || purpose.includes('prerender');
    const isBot = BOT_USER_AGENT_REGEX.test(userAgent) || isPrefetch;

    // Parse User-Agent accurately
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const deviceType = normalizeDeviceType(device.type, userAgent);
    const browserName = browser.name || (isBot ? 'Bot / Crawler' : 'Other');
    const osName = os.name || 'Other';

    // Classify Referrer & Traffic Source
    let { domain: referrerDomain, source: referrerSource } = classifyReferrer(referrerHeader, requestUrl);

    // Offline-to-online QR Analytics (#6)
    const isQRScan = requestUrl.searchParams.get('qr') === '1' || requestUrl.searchParams.get('utm_medium') === 'qr';
    const qrLocationTag = requestUrl.searchParams.get('loc') || requestUrl.searchParams.get('store') || '';
    if (isQRScan) {
      referrerSource = 'QR Scan' as any;
      referrerDomain = qrLocationTag ? `QR (${qrLocationTag})` : 'QR Code';
    }

    // Smart Routing (#4) & Link Health Fallback (#5)
    let destinationUrl = link.originalUrl;
    let routedTo = 'primary';

    // If link is marked broken and has a fallbackUrl, route to fallback
    if (link.healthStatus === 'broken' && link.fallbackUrl && link.fallbackUrl.trim() !== '') {
      destinationUrl = link.fallbackUrl;
      routedTo = 'fallback';
    } else if (deviceType === 'Mobile' && link.mobileUrl && link.mobileUrl.trim() !== '') {
      destinationUrl = link.mobileUrl;
      routedTo = 'mobile';
    } else if (link.abTestUrl && link.abTestUrl.trim() !== '') {
      const split = typeof link.abSplitPercent === 'number' ? link.abSplitPercent : 50;
      if (Math.random() * 100 < split) {
        destinationUrl = link.abTestUrl;
        routedTo = 'ab_variant';
      }
    }

    // Anti-double-click debounce (10 seconds window for accidental double taps)
    const debounceWindowMs = 10 * 1000;
    const cutoffTime = new Date(Date.now() - debounceWindowMs);

    const accidentalDoubleClick = await ClickAnalytics.findOne({
      linkId: link._id,
      ipAddress: clientIp,
      userAgent,
      timestamp: { $gte: cutoffTime }
    });

    if (!accidentalDoubleClick) {
      const locationData = await resolveLocation(request, clientIp);

      try {
        await ClickAnalytics.create({
          linkId: link._id,
          userId: link.userId || 'session-user',
          ipAddress: clientIp,
          userAgent,
          isBot,
          deviceType,
          browser: browserName,
          os: osName,
          country: locationData.country,
          city: locationData.city,
          region: locationData.region,
          referrer: referrerHeader,
          referrerDomain,
          referrerSource,
          isQRScan,
          qrLocationTag,
          routedTo,
          timestamp: new Date()
        });

        // Only increment human click counter on the Link document if it's NOT a bot/crawler
        if (!isBot) {
          const incFields: Record<string, number> = { clicks: 1 };
          if (isQRScan) incFields.qrScans = 1;
          await Link.findByIdAndUpdate(link._id, {
            $inc: incFields
          });
        }
      } catch (err) {
        console.error('Error recording click analytics:', err);
      }
    }

    // Click-to-Lead Capture Gate (#8) - only for real humans if enabled and not already unlocked
    const leadUnlocked = requestUrl.searchParams.get('lead_unlocked') === '1';
    if (!isBot && link.leadCaptureEnabled && !leadUnlocked) {
      const gateUrl = new URL(`/lead-gate/${shortCode}`, request.url);
      gateUrl.searchParams.set('dest', destinationUrl);
      gateUrl.searchParams.set('linkId', link._id.toString());
      gateUrl.searchParams.set('title', link.customName || 'Continue to Destination');
      if (link.leadPromptText) {
        gateUrl.searchParams.set('prompt', link.leadPromptText);
      }
      return NextResponse.redirect(gateUrl);
    }

    // Append click attribution parameter so destination stores (Shopify/Razorpay/Stripe) can attribute sales
    try {
      const target = new URL(destinationUrl);
      if (!target.searchParams.has('lh_link')) {
        target.searchParams.set('lh_link', shortCode);
      }
      return NextResponse.redirect(target);
    } catch {
      return NextResponse.redirect(new URL(destinationUrl));
    }
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
