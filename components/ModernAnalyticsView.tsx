"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart2,
  Users,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  ShieldCheck,
  Clock,
  Filter,
  Sparkles,
  Laptop,
  Share2,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Download,
  QrCode,
  Award,
  UserCheck,
  Mail,
  MessageCircle
} from "lucide-react";

interface LinkItem {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  customName: string;
  clicks: number;
  createdAt: string;
}

interface RecentClickItem {
  _id: string;
  linkName: string;
  shortUrl: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  os: string;
  referrerDomain: string;
  referrerSource: string;
  isBot: boolean;
  isQRScan?: boolean;
  qrLocationTag?: string;
  routedTo?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface AnalyticsData {
  summary: {
    totalLinks: number;
    totalClicks: number;
    uniqueClicks: number;
    botClicksBlocked: number;
    averageClicksPerLink: number;
    ctr: number;
    totalRevenue?: number;
    totalConversions?: number;
    epc?: number;
    totalQRScans?: number;
    totalLeadsCount?: number;
    clickQualityScore?: number;
    fraudRate?: number;
    rawAttemptedClicks?: number;
  };
  aiInsights?: string[];
  timeline: Array<{
    date: string;
    isoDate?: string;
    clicks: number;
    uniqueClicks?: number;
  }>;
  geographic: Array<{
    country: string;
    clicks: number;
    percentage: number;
  }>;
  cities?: Array<{
    city: string;
    country: string;
    clicks: number;
    percentage: number;
  }>;
  devices: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  browsers?: Array<{
    name: string;
    clicks: number;
    percentage: number;
  }>;
  operatingSystems?: Array<{
    name: string;
    clicks: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  affiliateLeaderboard?: Array<{
    _id: string;
    affiliateName: string;
    linkName: string;
    shortUrl: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commissionRate: number;
    commissionEarned: number;
  }>;
  qrLocations?: Array<{
    location: string;
    scans: number;
  }>;
  smartRoutingBreakdown?: Array<{
    route: string;
    clicks: number;
  }>;
  leads?: Array<{
    _id: string;
    linkName: string;
    contact: string;
    name: string;
    country: string;
    deviceType: string;
    createdAt: string;
  }>;
  recentClicks?: RecentClickItem[];
}

export default function ModernAnalyticsView({ linkId: initialLinkId }: { linkId?: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string>(initialLinkId || "all");
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [analyticsViewTab, setAnalyticsViewTab] = useState<"overview" | "audience" | "business" | "logs">("overview");
  const [businessTab, setBusinessTab] = useState<"affiliates" | "qr" | "leads">("affiliates");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedLinkId && selectedLinkId !== "all") {
        params.set("linkId", selectedLinkId);
      }
      params.set("period", selectedPeriod);

      const [analyticsRes, linksRes] = await Promise.all([
        fetch(`/api/analytics?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/links", { cache: "no-store" })
      ]);

      if (!analyticsRes.ok) {
        throw new Error("Failed to load analytics metrics");
      }

      const analyticsJson = await analyticsRes.json();
      setAnalytics(analyticsJson);

      if (linksRes.ok) {
        const linksJson = await linksRes.json();
        setLinks(Array.isArray(linksJson) ? linksJson : linksJson.links || []);
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err?.message || "Unable to load analytics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLinkId, selectedPeriod]);

  useEffect(() => {
    setCurrentPage(1);
    fetchAnalyticsData(false);
  }, [fetchAnalyticsData]);

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // #2 Downloadable Ad-Fraud Dispute Report (CSV)
  const handleDownloadFraudReport = () => {
    if (!analytics) return;
    const rows = [
      ["Timestamp", "Link Name", "Status", "Country", "City", "Device", "Browser", "OS", "Source", "Routed To"],
      ...(analytics.recentClicks || []).map((c) => [
        new Date(c.timestamp).toISOString(),
        `"${(c.linkName || "").replace(/"/g, '""')}"`,
        c.isBot ? "BOT / FAKE CLICK (DISPUTE ELIGIBLE)" : "VERIFIED HUMAN",
        c.country,
        c.city,
        c.deviceType,
        c.browser,
        c.os,
        c.referrerSource,
        c.routedTo || "primary"
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LinkHub_Ad_Fraud_Dispute_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // #3 Share Plain-Language AI Digest to WhatsApp or Email
  const handleShareWhatsAppDigest = () => {
    if (!analytics) return;
    const digestText = [
      "📊 *LinkHub Weekly AI Business Digest*",
      `• Verified Human Clicks: ${analytics.summary.totalClicks}`,
      `• Attributed Revenue: ₹${(analytics.summary.totalRevenue || 0).toLocaleString("en-IN")} (${analytics.summary.totalConversions || 0} sales)`,
      `• Click Quality Score: ${analytics.summary.clickQualityScore ?? 100}% (${analytics.summary.botClicksBlocked || 0} bots blocked)`,
      "",
      "*Key AI Insights:*",
      ...(analytics.aiInsights || []).map((i) => `• ${i}`)
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(digestText)}`, "_blank");
  };

  const handleShareEmailDigest = () => {
    if (!analytics) return;
    const subject = "LinkHub Weekly AI Insights & Revenue Digest";
    const body = [
      "LinkHub Weekly Business Performance Digest",
      "------------------------------------------",
      `Verified Human Clicks: ${analytics.summary.totalClicks}`,
      `Attributed Revenue: Rs. ${(analytics.summary.totalRevenue || 0).toLocaleString("en-IN")}`,
      `Click Quality Score: ${analytics.summary.clickQualityScore ?? 100}% (${analytics.summary.botClicksBlocked || 0} fake/bot clicks filtered)`,
      "",
      "Plain-Language AI Insights:",
      ...(analytics.aiInsights || []).map((i) => `- ${i}`)
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-14 bg-white rounded-2xl border border-slate-200" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 border border-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl h-80 border border-slate-200" />
            <div className="bg-white rounded-2xl h-80 border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <div className="text-red-600 text-lg font-heading font-bold">Error loading analytics</div>
          <div className="text-slate-500 mt-2 text-sm">{error}</div>
          <button
            onClick={() => fetchAnalyticsData(false)}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    summary,
    aiInsights = [],
    timeline = [],
    devices = [],
    browsers = [],
    operatingSystems = [],
    geographic = [],
    cities = [],
    trafficSources = [],
    affiliateLeaderboard = [],
    qrLocations = [],
    smartRoutingBreakdown = [],
    leads = [],
    recentClicks = []
  } = analytics;

  const activeDevices = devices.filter((d) => d.value > 0);
  const totalPages = Math.max(1, Math.ceil(recentClicks.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedClicks = recentClicks.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 text-sm">
      {/* Top Filter & Control Bar */}
      <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Link:</span>
          </div>
          <select
            value={selectedLinkId}
            onChange={(e) => setSelectedLinkId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 min-w-[240px]"
          >
            <option value="all">All Links ({links.length})</option>
            {links.map((link) => (
              <option key={link._id} value={link._id}>
                {link.customName || link.shortUrl.split("/").pop()} ({link.clicks || 0} clicks)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          {/* Time Period Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7D" },
              { id: "30d", label: "Last 30D" },
              { id: "all", label: "All Time" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeriod(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPeriod === tab.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Download Ad-Fraud Report Button (#2) */}
          <button
            onClick={handleDownloadFraudReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Dispute Report (CSV)</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalyticsData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* #3 AI Insights in Plain Language + WhatsApp & Email Digest */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                AI Business Insights in Plain Language
              </h3>
              <p className="text-xs text-slate-500">
                Actionable revenue, peak timing, and ad-fraud takeaways—ready to send to WhatsApp or Email
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShareWhatsAppDigest}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Digest</span>
            </button>
            <button
              onClick={handleShareEmailDigest}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email Digest</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed"
            >
              {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Top 4 High-Impact Business KPI Cards (#1 Revenue + #2 Click Quality Score + Human Clicks + Unique) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* #1 Click-to-Revenue Attribution */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attributed Revenue</p>
              <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-emerald-700 mt-1">
                ₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            <span className="font-bold text-emerald-700">{summary.totalConversions || 0} sales</span> · ₹{summary.epc || 0} earned/click
          </p>
        </div>

        {/* #2 Click Quality Score (Ad-Fraud Detection) */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Click Quality Score</p>
              <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1">
                {summary.clickQualityScore ?? 100}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Of {summary.rawAttemptedClicks || summary.totalClicks} hits,{" "}
            <span className="font-bold text-amber-700">{summary.botClicksBlocked || 0} were bots/fake</span>
          </p>
        </div>

        {/* Verified Human Clicks */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Human Clicks</p>
              <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1">
                {summary.totalClicks.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <MousePointer className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            100% real browsers ({summary.totalQRScans || 0} QR scans)
          </p>
        </div>

        {/* True Unique Visitors & Leads */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Visitors & Leads</p>
              <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1">
                {summary.uniqueClicks.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            <span className="font-bold text-indigo-600">{summary.ctr}% unique</span> · {summary.totalLeadsCount || 0} leads captured
          </p>
        </div>
      </div>

      {/* Modern Compact Section Tabs Navigation (No Endless Scrolling) */}
      <div className="flex items-center justify-start gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setAnalyticsViewTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            analyticsViewTab === "overview"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          <span>Timeline & Traffic Sources</span>
        </button>

        <button
          onClick={() => setAnalyticsViewTab("audience")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            analyticsViewTab === "audience"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Geographic, Devices & Browsers</span>
        </button>

        <button
          onClick={() => setAnalyticsViewTab("business")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            analyticsViewTab === "business"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4 text-violet-600" />
          <span>Affiliates, QR & Leads ({affiliateLeaderboard.length + qrLocations.length + leads.length})</span>
        </button>

        <button
          onClick={() => setAnalyticsViewTab("logs")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            analyticsViewTab === "logs"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Live Click Activity Stream ({recentClicks.length})</span>
        </button>
      </div>

      {/* Main Timeline Chart + Traffic Sources */}
      {analyticsViewTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Daily Clicks & Unique Visitors Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">Click Performance Over Time</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Real-time daily human clicks vs. distinct visitors
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Total Clicks
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Unique Visitors
                </span>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                      fontSize: "13px",
                      color: "#0f172a"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Total Clicks"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                  />
                  <Area
                    type="monotone"
                    dataKey="uniqueClicks"
                    name="Unique Visitors"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUnique)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">Traffic Sources</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Where your visitors originate</p>
                </div>
                <Share2 className="w-5 h-5 text-indigo-600" />
              </div>

              {trafficSources.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-semibold text-slate-600">No referrer data yet</p>
                  <p className="text-xs text-slate-400 mt-1">Share your short links to track sources</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {trafficSources.map((source, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          {source.name}
                        </span>
                        <span className="text-slate-600 font-medium">
                          <strong className="text-slate-900 font-bold">{source.value}</strong> ({source.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(4, source.percentage)}%`,
                            backgroundColor: source.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Supports HTTP Referer, QR tags & <code className="text-indigo-600 font-semibold">?utm_source=</code>
            </div>
          </div>
        </div>
      )}

      {/* Compact Tabbed Business Suite (#6 QR Locations, #7 Affiliate Leaderboard, #8 Captured Leads) */}
      {analyticsViewTab === "business" && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Revenue Attribution, QR Locations & Lead Capture
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Switch tabs to view Affiliate Commissions (#7), Print QR Comparisons (#6), or Captured Customer Leads (#8)
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setBusinessTab("affiliates")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  businessTab === "affiliates"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Affiliates & Revenue ({affiliateLeaderboard.length})</span>
              </button>
              <button
                onClick={() => setBusinessTab("qr")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  businessTab === "qr"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Locations ({qrLocations.length})</span>
              </button>
              <button
                onClick={() => setBusinessTab("leads")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  businessTab === "leads"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Captured Leads ({leads.length})</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab 1: Affiliate & Revenue Leaderboard */}
          {businessTab === "affiliates" && (
            <div>
              {affiliateLeaderboard.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-sm font-semibold text-slate-700">No affiliate or revenue links recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use the &quot;+ ₹ Sale&quot; or Settings button on any link in the Dashboard to assign an influencer or record a sale.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] sm:text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Affiliate / Partner</th>
                        <th className="py-3 px-4">Campaign Link</th>
                        <th className="py-3 px-4">Clicks</th>
                        <th className="py-3 px-4">Sales</th>
                        <th className="py-3 px-4">Revenue Generated</th>
                        <th className="py-3 px-4 text-right">Commission Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {affiliateLeaderboard.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{item.affiliateName}</td>
                          <td className="py-3 px-4 text-slate-600">{item.linkName}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{item.clicks}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">{item.conversions}</td>
                          <td className="py-3 px-4 font-bold text-emerald-700">
                            ₹{item.revenue.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-indigo-600">
                            ₹{item.commissionEarned.toLocaleString("en-IN")} ({item.commissionRate}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Offline-to-Online Dynamic QR Location Comparison & Smart Routing */}
          {businessTab === "qr" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-3.5">
                  QR Scans by Print Location (?qr=1&loc=...)
                </h4>
                {qrLocations.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-400 py-6">
                    No QR scans yet. Open the QR modal on any link and add a location tag like <code>Store-A</code> vs <code>Store-B</code>.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {qrLocations.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/70 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800">{q.location}</span>
                        <span className="font-bold text-indigo-600">{q.scans} scans</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-3.5">
                  Smart Routing & A/B Variant Split (#4)
                </h4>
                <div className="space-y-2.5">
                  {smartRoutingBreakdown.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/70 text-xs sm:text-sm">
                      <span className="font-semibold text-slate-800 capitalize">
                        {r.route === "ab_variant" ? "A/B Variant B" : r.route === "mobile" ? "Mobile App/Store Route" : r.route === "fallback" ? "404 Fallback Page" : "Primary Destination"}
                      </span>
                      <span className="font-bold text-slate-900">{r.clicks} visitors</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Click-to-Lead Captured Contacts */}
          {businessTab === "leads" && (
            <div>
              {leads.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-sm font-semibold text-slate-700">No customer leads captured yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Enable &quot;Click-to-Lead Capture Gate&quot; in a link&apos;s settings to collect visitor email or phone numbers before redirecting.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] sm:text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Visitor Name</th>
                        <th className="py-3 px-4">Email / WhatsApp Phone</th>
                        <th className="py-3 px-4">Link</th>
                        <th className="py-3 px-4">Location & Device</th>
                        <th className="py-3 px-4 text-right">Captured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-semibold text-slate-900">{lead.name}</td>
                          <td className="py-3 px-4 font-bold text-indigo-600">{lead.contact}</td>
                          <td className="py-3 px-4 text-slate-600">{lead.linkName}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {lead.country} · {lead.deviceType}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 font-medium">
                            {formatTimeAgo(lead.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Second Row: Geographic (Countries & Cities) + Devices + Browsers & OS */}
      {analyticsViewTab === "audience" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
        {/* Card 1: Geographic Breakdown */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900">Geographic Locations</h3>
                  <p className="text-xs text-slate-500">Top countries & city hotspots</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                {geographic.length} {geographic.length === 1 ? "Country" : "Countries"}
              </span>
            </div>

            {geographic.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <Globe className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No location data yet</p>
                <p className="text-xs text-slate-400 mt-1">Countries & cities appear on first click</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Countries List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Top Countries</span>
                    <span>Visits & Share</span>
                  </div>
                  {geographic.slice(0, 4).map((loc, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-emerald-200 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-100/80 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-slate-800">{loc.country}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900">{loc.clicks}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                            {loc.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${Math.max(6, loc.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top Cities List */}
                {cities && cities.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>City Hotspots</span>
                      <span>Clicks</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {cities.slice(0, 4).map((c, idx) => (
                        <div
                          key={idx}
                          className="relative overflow-hidden flex items-center justify-between text-xs py-2 px-3 bg-slate-50/90 hover:bg-slate-100/70 rounded-xl border border-slate-200/70 transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-emerald-500/8 pointer-events-none"
                            style={{ width: `${Math.max(8, c.percentage)}%` }}
                          />
                          <div className="relative flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{c.city}</span>
                            <span className="text-[11px] text-slate-400 truncate">({c.country})</span>
                          </div>
                          <div className="relative flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] text-slate-400 font-medium">{c.percentage}%</span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 font-extrabold text-slate-900 shadow-2xs">
                              {c.clicks}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Resolved via Edge IP & Geo-DNS</span>
            <span className="font-semibold text-emerald-600">
              {cities && cities[0] ? `Top: ${cities[0].city}` : "Live Geo"}
            </span>
          </div>
        </div>

        {/* Card 2: Device Types */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900">Device Types</h3>
                  <p className="text-xs text-slate-500">Desktop, Mobile & Tablet split</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-bold">
                {summary.totalClicks} Visits
              </span>
            </div>

            {/* Donut Chart with Center Summary Label */}
            {activeDevices.length > 0 ? (
              <div className="relative h-44 mb-5 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeDevices}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {activeDevices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-heading font-extrabold text-slate-900 leading-none">
                    {summary.totalClicks}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Total Visits
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-44 mb-5 flex items-center justify-center text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">No device visits recorded yet</p>
              </div>
            )}

            {/* Device Rows with Progress Bars */}
            <div className="space-y-2.5">
              {devices.map((device, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-indigo-200 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="p-1.5 rounded-lg border"
                        style={{
                          backgroundColor: `${device.color}12`,
                          borderColor: `${device.color}30`,
                          color: device.color
                        }}
                      >
                        {device.name === "Mobile" && <Smartphone className="h-3.5 w-3.5" />}
                        {device.name === "Desktop" && <Monitor className="h-3.5 w-3.5" />}
                        {device.name === "Tablet" && <Tablet className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-slate-800 font-bold text-xs">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900 font-extrabold text-xs">{device.value}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${device.color}15`,
                          color: device.color
                        }}
                      >
                        {device.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${device.value > 0 ? Math.max(5, device.percentage) : 0}%`,
                        backgroundColor: device.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Smart Device Detection</span>
            <span className="font-semibold text-indigo-600">
              {activeDevices[0] ? `Primary: ${activeDevices[0].name} (${activeDevices[0].percentage}%)` : "Ready"}
            </span>
          </div>
        </div>

        {/* Card 3: Browsers & Operating Systems */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900">Browsers & OS</h3>
                  <p className="text-xs text-slate-500">Client software environment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200/60 text-[11px] font-bold">
                {browsers.length} Browsers
              </span>
            </div>

            <div className="space-y-5">
              {/* Top Browsers */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  <span>Top Browsers</span>
                  <span>Share</span>
                </div>
                {browsers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">No browser data yet</p>
                ) : (
                  <div className="space-y-2">
                    {browsers.slice(0, 4).map((b, i) => {
                      const cleanBrowserName = b.name === "Unknown" ? "In-App / WebView" : b.name;
                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/70 hover:border-violet-200 transition-all"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-violet-500" />
                              {cleanBrowserName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-extrabold">{b.clicks}</strong>
                              <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-bold text-[10px]">
                                {b.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                              style={{ width: `${Math.max(6, b.percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Operating Systems */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  <span>Operating Systems</span>
                  <span>Share</span>
                </div>
                {operatingSystems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">No OS data yet</p>
                ) : (
                  <div className="space-y-2">
                    {operatingSystems.slice(0, 4).map((os, i) => {
                      const cleanOsName = os.name === "Unknown" ? "Other / Mobile OS" : os.name;
                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/70 hover:border-indigo-200 transition-all"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              {cleanOsName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-extrabold">{os.clicks}</strong>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                                {os.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
                              style={{ width: `${Math.max(6, os.percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>User-Agent Parser</span>
            <span className="font-semibold text-violet-600">
              {browsers[0] && operatingSystems[0]
                ? `Top: ${browsers[0].name} · ${operatingSystems[0].name}`
                : "Live Client"}
            </span>
          </div>
        </div>
      </div>
      )}

      {/* Live Recent Activity Feed (Multi-Page Paginated System) */}
      {analyticsViewTab === "logs" && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Click Activity Log
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time stream of latest visits, locations, devices, smart routing, and bot-filter status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <span className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                {recentClicks.length} total events
              </span>
            </div>
          </div>

          {recentClicks.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/60">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No click events recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Open one of your short URLs in a new tab to see live tracking appear here immediately.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200/80">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Link</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Device & Environment</th>
                      <th className="py-3 px-4">Source / Route</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {paginatedClicks.map((click) => (
                      <tr key={click._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 truncate max-w-[190px]">
                          {click.linkName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{click.country}</span>
                          {click.city && click.city !== "Unknown" ? `, ${click.city}` : ""}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{click.deviceType}</span>
                          {" · "}
                          {click.browser} ({click.os})
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs">
                            {click.referrerSource}
                          </span>
                          {click.qrLocationTag && (
                            <span className="ml-1.5 px-2 py-0.5 rounded bg-pink-50 text-pink-700 text-xs font-semibold">
                              QR: {click.qrLocationTag}
                            </span>
                          )}
                          {click.routedTo && click.routedTo !== "primary" && (
                            <span className="ml-1.5 px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-xs font-semibold">
                              {click.routedTo}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {click.isBot ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs">
                              Bot Filtered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
                              Verified Human
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-medium whitespace-nowrap">
                          {formatTimeAgo(click.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Multi-Pagination Footer Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-3.5 border-t border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(startIndex + pageSize, recentClicks.length)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{recentClicks.length}</span> clicks
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const isVisible =
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - safePage) <= 1;

                        if (!isVisible) {
                          if (pageNum === 2 || pageNum === totalPages - 1) {
                            return (
                              <span key={pageNum} className="px-1.5 text-xs text-slate-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                              safePage === pageNum
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm font-semibold transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
