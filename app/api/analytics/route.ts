import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Link from '@/lib/models/Link';
import ClickAnalytics from '@/lib/models/ClickAnalytics';
import Lead from '@/lib/models/Lead';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkIdParam = searchParams.get('linkId');
    const periodParam = searchParams.get('period') || '30d'; // 'today' | '7d' | '30d' | 'all'

    // Get all links owned by the authenticated user
    const userLinks = await Link.find({ userId: sessionId }).sort({ createdAt: -1 });

    // Determine target links based on optional linkId filter
    const filteredLinks =
      linkIdParam && linkIdParam !== 'all'
        ? userLinks.filter((l) => l._id.toString() === linkIdParam)
        : userLinks;

    const targetLinkIds = filteredLinks.map((l) => new mongoose.Types.ObjectId(l._id as string));

    // Calculate date range filter
    let startDate: Date | null = null;
    const now = new Date();
    if (periodParam === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (periodParam === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodParam === '30d' || periodParam === '1m') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (periodParam === '3m') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const baseMatch: Record<string, any> = {
      linkId: { $in: targetLinkIds }
    };
    if (startDate) {
      baseMatch.timestamp = { $gte: startDate };
    }

    // Human clicks filter (exclude bots or records where isBot is true)
    const humanMatch = {
      ...baseMatch,
      isBot: { $ne: true }
    };

    const botMatch = {
      ...baseMatch,
      isBot: true
    };

    // Run aggregations in parallel for speed
    const [
      humanAnalyticsCount,
      botClicksCount,
      uniqueVisitorsAgg,
      deviceStats,
      browserStats,
      osStats,
      geoStats,
      cityStats,
      sourceStats,
      dailyTimelineAgg,
      recentClicksDocs,
      qrLocationStats,
      routingStats,
      hourlyStats,
      capturedLeadsDocs
    ] = await Promise.all([
      ClickAnalytics.countDocuments(humanMatch),
      ClickAnalytics.countDocuments(botMatch),

      // True Unique Visitors (distinct IP + UserAgent among human clicks)
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: { ip: '$ipAddress', ua: '$userAgent' }
          }
        },
        { $count: 'uniqueCount' }
      ]),

      // Device Type Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Browser Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),

      // OS Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),

      // Country Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),

      // City Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: { city: '$city', country: '$country' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),

      // Traffic Source Breakdown
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: {
              $ifNull: [
                '$referrerSource',
                {
                  $cond: [
                    { $eq: ['$referrerDomain', 'Direct'] },
                    'Direct',
                    {
                      $cond: [
                        { $regexMatch: { input: '$referrerDomain', regex: 'google|bing|yahoo|duckduckgo', options: 'i' } },
                        'Search',
                        {
                          $cond: [
                            { $regexMatch: { input: '$referrerDomain', regex: 'facebook|twitter|x\\.com|t\\.co|instagram|linkedin|lnkd\\.in|tiktok|youtube|reddit', options: 'i' } },
                            'Social Media',
                            {
                              $cond: [
                                { $regexMatch: { input: '$referrerDomain', regex: 'whatsapp|wa\\.me|telegram|t\\.me|discord|slack', options: 'i' } },
                                'Messaging',
                                {
                                  $cond: [
                                    { $regexMatch: { input: '$referrerDomain', regex: 'gmail|outlook|mail', options: 'i' } },
                                    'Email',
                                    'Other'
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Real Daily Click Timeline (last 14 days or selected window)
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            clicks: { $sum: 1 },
            uniqueSet: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            _id: 1,
            clicks: 1,
            uniqueClicks: { $size: '$uniqueSet' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Recent Live Clicks Feed (latest 100 events including bot flag for multi-page table)
      ClickAnalytics.find(baseMatch)
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('linkId', 'customName shortUrl originalUrl')
        .lean(),

      // Offline-to-online QR Scans by Location Tag (#6)
      ClickAnalytics.aggregate([
        { $match: { ...humanMatch, isQRScan: true } },
        {
          $group: {
            _id: { $cond: [{ $eq: ['$qrLocationTag', ''] }, 'General QR Print', '$qrLocationTag'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Smart Routing & A/B Variant Split (#4)
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: { $ifNull: ['$routedTo', 'primary'] },
            count: { $sum: 1 }
          }
        }
      ]),

      // Peak Hour Analysis for Plain-Language AI Insights (#3)
      ClickAnalytics.aggregate([
        { $match: humanMatch },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),

      // Captured Customer Leads (#8)
      Lead.find({ linkId: { $in: targetLinkIds } })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('linkId', 'customName shortUrl')
        .lean()
    ]);

    const totalLinks = filteredLinks.length;
    const linkCounterSum = filteredLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalClicks = startDate ? humanAnalyticsCount : Math.max(linkCounterSum, humanAnalyticsCount);
    const denomClicks = Math.max(humanAnalyticsCount, 1);

    const rawUnique = uniqueVisitorsAgg[0]?.uniqueCount || 0;
    const uniqueClicks = rawUnique > 0 ? rawUnique : (totalClicks > 0 ? 1 : 0);

    const averageClicksPerLink =
      totalLinks > 0 ? parseFloat((totalClicks / totalLinks).toFixed(1)) : 0;

    const uniqueVisitorRate =
      totalClicks > 0 ? Math.min(100, parseFloat(((uniqueClicks / totalClicks) * 100).toFixed(1))) : 0;

    // #1 Click-to-Revenue Attribution Summary
    const totalRevenue = filteredLinks.reduce((sum, link) => sum + (link.revenue || 0), 0);
    const totalConversions = filteredLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
    const totalQRScans = filteredLinks.reduce((sum, link) => sum + (link.qrScans || 0), 0);
    const totalLeadsCount = filteredLinks.reduce((sum, link) => sum + (link.leadsCount || 0), 0);
    const epc = totalClicks > 0 ? parseFloat((totalRevenue / totalClicks).toFixed(2)) : 0;

    // #2 Click Quality Score (Ad-Fraud Detection)
    const rawAttemptedClicks = totalClicks + botClicksCount;
    const clickQualityScore =
      rawAttemptedClicks > 0
        ? Math.round((totalClicks / rawAttemptedClicks) * 100)
        : 100;
    const fraudRate = 100 - clickQualityScore;

    // Build continuous daily timeline
    const daysCount = periodParam === '7d' ? 7 : 14;
    const timelineMap = new Map<string, { clicks: number; uniqueClicks: number }>();
    dailyTimelineAgg.forEach((item: any) => {
      timelineMap.set(item._id, { clicks: item.clicks, uniqueClicks: item.uniqueClicks });
    });

    const timeline = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const found = timelineMap.get(isoKey);
      timeline.push({
        date: label,
        isoDate: isoKey,
        clicks: found ? found.clicks : 0,
        uniqueClicks: found ? found.uniqueClicks : 0
      });
    }

    // Format Device Data
    const deviceColors: Record<string, string> = {
      Desktop: '#4f46e5',
      Mobile: '#7c3aed',
      Tablet: '#10b981'
    };
    const devices = ['Desktop', 'Mobile', 'Tablet'].map((name) => {
      const stat = deviceStats.find((s: any) => s._id === name);
      const val = stat ? stat.count : 0;
      return {
        name,
        value: val,
        percentage: humanAnalyticsCount > 0 ? Math.round((val / denomClicks) * 100) : 0,
        color: deviceColors[name] || '#64748b'
      };
    });

    // Format Browsers
    const browsers = browserStats.map((b: any) => ({
      name: b._id || 'Other',
      clicks: b.count,
      percentage: Math.round((b.count / denomClicks) * 100)
    }));

    // Format OS
    const operatingSystems = osStats.map((o: any) => ({
      name: o._id || 'Other',
      clicks: o.count,
      percentage: Math.round((o.count / denomClicks) * 100)
    }));

    // Format Geographic Data
    const geoData = geoStats.map((g: any) => ({
      country: g._id || 'Unknown',
      clicks: g.count,
      percentage: Math.round((g.count / denomClicks) * 100)
    }));

    const cities = cityStats
      .filter((c: any) => c._id?.city && c._id.city !== 'Unknown')
      .map((c: any) => ({
        city: c._id.city,
        country: c._id.country || '',
        clicks: c.count,
        percentage: Math.round((c.count / denomClicks) * 100)
      }));

    // Format Traffic Sources
    const sourcePalette: Record<string, string> = {
      Direct: '#4f46e5',
      'Social Media': '#7c3aed',
      Messaging: '#10b981',
      Search: '#f59e0b',
      Email: '#06b6d4',
      'QR Scan': '#ec4899',
      'AI / Referral': '#8b5cf6',
      Other: '#64748b'
    };

    const trafficSources = sourceStats.map((s: any) => {
      const name = s._id || 'Other';
      return {
        name,
        value: s.count,
        percentage: Math.round((s.count / denomClicks) * 100),
        color: sourcePalette[name] || '#64748b'
      };
    });

    // Top Performing Links (including Revenue & Health)
    const topLinks = [...filteredLinks]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0) || (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map((link) => ({
        _id: link._id,
        name: link.customName || link.shortUrl.split('/').pop() || 'Link',
        clicks: link.clicks || 0,
        conversions: link.conversions || 0,
        revenue: link.revenue || 0,
        qrScans: link.qrScans || 0,
        healthStatus: link.healthStatus || 'healthy',
        affiliateName: link.affiliateName || '',
        commissionRate: link.commissionRate || 10,
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        createdAt: link.createdAt
      }));

    // #7 Affiliate & Team Leaderboard
    const affiliateLeaderboard = filteredLinks
      .filter((l) => l.affiliateName || (l.revenue && l.revenue > 0))
      .map((l) => {
        const rev = l.revenue || 0;
        const rate = l.commissionRate ?? 10;
        return {
          _id: l._id,
          affiliateName: l.affiliateName || 'Direct Owner',
          linkName: l.customName || l.shortUrl.split('/').pop() || 'Short Link',
          shortUrl: l.shortUrl,
          clicks: l.clicks || 0,
          conversions: l.conversions || 0,
          revenue: rev,
          commissionRate: rate,
          commissionEarned: Math.round(rev * (rate / 100))
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks);

    // #6 QR Location Breakdown
    const qrLocations = qrLocationStats.map((q: any) => ({
      location: q._id || 'General QR Print',
      scans: q.count
    }));

    // #4 Smart Routing Breakdown
    const smartRoutingBreakdown = routingStats.map((r: any) => ({
      route: r._id || 'primary',
      clicks: r.count
    }));

    // #3 Plain-Language AI Insights Generator
    const aiInsights: string[] = [];

    // Insight 1: Revenue & Money-making link
    const topMoneyLink = [...filteredLinks].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
    if (topMoneyLink && (topMoneyLink.revenue || 0) > 0) {
      aiInsights.push(
        `💰 "${topMoneyLink.customName}" is your #1 money-maker with ₹${(topMoneyLink.revenue || 0).toLocaleString('en-IN')} earned across ${topMoneyLink.conversions || 1} sales (₹${epc} earned per click).`
      );
    } else if (filteredLinks.length > 0) {
      const topClickLink = [...filteredLinks].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
      aiInsights.push(
        `📈 "${topClickLink.customName}" leads traffic with ${topClickLink.clicks || 0} human clicks. Connect a Razorpay/Shopify webhook or log a sale to track ₹ earned per click.`
      );
    }

    // Insight 2: Best city + device combination
    const topCityObj = cities[0];
    const topDeviceObj = [...devices].sort((a, b) => b.value - a.value)[0];
    if (topCityObj && topDeviceObj && topDeviceObj.value > 0) {
      aiInsights.push(
        `📍 ${topDeviceObj.name} users from ${topCityObj.city} (${topCityObj.country}) drive ${topCityObj.percentage}% of your engaged traffic (${topCityObj.clicks} visits).`
      );
    } else if (geoData[0]) {
      aiInsights.push(
        `🌍 Visitors from ${geoData[0].country} represent ${geoData[0].percentage}% of all verified clicks.`
      );
    }

    // Insight 3: Peak time of day
    if (hourlyStats.length > 0 && hourlyStats[0]._id !== null && hourlyStats[0]._id !== undefined) {
      // Convert UTC hour to IST (+5:30 approx +5h for readable window)
      const istHour = (Number(hourlyStats[0]._id) + 5) % 24;
      const periodLabel = istHour >= 12 ? `${istHour === 12 ? 12 : istHour - 12} PM` : `${istHour === 0 ? 12 : istHour} AM`;
      aiInsights.push(
        `⏰ Your links get peak engagement around ${periodLabel} IST (${hourlyStats[0].count} clicks in that window)—schedule WhatsApp & Instagram posts right before then.`
      );
    }

    // Insight 4: Ad-Fraud & Bot protection savings
    if (botClicksCount > 0) {
      aiInsights.push(
        `🛡️ Of ${rawAttemptedClicks} total hits, ${botClicksCount} (${fraudRate}%) were bots or link-preview crawlers. Your Click Quality Score is ${clickQualityScore}%—download the Dispute Report to claim ad-spend credits.`
      );
    } else {
      aiInsights.push(
        `✅ 100% Click Quality Score: Every recorded click in this period came from a verified human browser with zero ad-fraud waste.`
      );
    }

    // Insight 5: Dead / Broken or Dying link warning
    const brokenLink = filteredLinks.find((l) => l.healthStatus === 'broken');
    const zeroClickLink = filteredLinks.find((l) => (l.clicks || 0) === 0);
    if (brokenLink) {
      aiInsights.push(
        `🚨 Alert: "${brokenLink.customName}" returned HTTP ${brokenLink.lastHealthCode || 404}. Visitors are being routed to your fallback URL so you don't waste ad spend.`
      );
    } else if (zeroClickLink && filteredLinks.length > 1) {
      aiInsights.push(
        `⚠️ "${zeroClickLink.customName}" has 0 clicks so far—consider testing a fresh headline or enabling Smart A/B Routing.`
      );
    }

    // Format Recent Live Clicks
    const recentClicks = recentClicksDocs.map((doc: any) => ({
      _id: doc._id,
      linkName: doc.linkId?.customName || 'Short Link',
      shortUrl: doc.linkId?.shortUrl || '',
      country: doc.country || 'Unknown',
      city: doc.city || 'Unknown',
      deviceType: doc.deviceType || 'Desktop',
      browser: doc.browser || 'Unknown',
      os: doc.os || 'Unknown',
      referrerDomain: doc.referrerDomain || 'Direct',
      referrerSource: doc.referrerSource || 'Direct',
      isBot: !!doc.isBot,
      isQRScan: !!doc.isQRScan,
      qrLocationTag: doc.qrLocationTag || '',
      routedTo: doc.routedTo || 'primary',
      ipAddress: doc.ipAddress || '',
      userAgent: doc.userAgent || '',
      timestamp: doc.timestamp
    }));

    // Format Leads
    const leads = capturedLeadsDocs.map((lead: any) => ({
      _id: lead._id,
      linkName: lead.linkId?.customName || 'Short Link',
      contact: lead.contact,
      name: lead.name || 'Visitor',
      country: lead.country || 'Unknown',
      deviceType: lead.deviceType || 'Desktop',
      createdAt: lead.createdAt
    }));

    return NextResponse.json({
      summary: {
        totalLinks,
        totalClicks,
        uniqueClicks,
        botClicksBlocked: botClicksCount,
        averageClicksPerLink,
        ctr: uniqueVisitorRate,
        totalRevenue,
        totalConversions,
        epc,
        totalQRScans,
        totalLeadsCount,
        clickQualityScore,
        fraudRate,
        rawAttemptedClicks
      },
      aiInsights,
      timeline,
      devices,
      browsers,
      operatingSystems,
      geographic: geoData,
      cities,
      trafficSources,
      topLinks,
      affiliateLeaderboard,
      qrLocations,
      smartRoutingBreakdown,
      leads,
      recentClicks
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
