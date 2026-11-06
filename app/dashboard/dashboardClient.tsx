"use client";

import React, { useState, useEffect } from "react";
import { 
  Link2, 
  BarChart3, 
  QrCode, 
  TrendingUp, 
  Plus, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ShieldAlert,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Users,
  UserCheck,
  Split,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import ModernAnalyticsView from "@/components/ModernAnalyticsView";

interface LinkItem {
  _id: string;
  originalUrl: string;
  shortCode: string;
  customName: string;
  shortUrl: string;
  clicks: number;
  qrScans?: number;
  conversions?: number;
  revenue?: number;
  conversionValue?: number;
  mobileUrl?: string;
  abTestUrl?: string;
  abSplitPercent?: number;
  fallbackUrl?: string;
  healthStatus?: "healthy" | "broken" | "unknown";
  lastHealthCode?: number;
  affiliateName?: string;
  commissionRate?: number;
  leadCaptureEnabled?: boolean;
  leadPromptText?: string;
  leadsCount?: number;
  createdAt: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
}

interface DashboardClientProps {
  user?: {
    name: string;
    email: string;
  };
}

export default function DashboardClient({ user }: DashboardClientProps = {}) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [currentView, setCurrentView] = useState<"dashboard" | "analytics">("dashboard");
  const [selectedAnalyticsLinkId, setSelectedAnalyticsLinkId] = useState<string>("all");
  const [linksPage, setLinksPage] = useState<number>(1);
  const linksPerPage = 6;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedInCreate, setShowAdvancedInCreate] = useState(false);

  // Modals for the 8 Business Features
  const [qrModalLink, setQrModalLink] = useState<LinkItem | null>(null);
  const [qrLocationTag, setQrLocationTag] = useState<string>("");
  const [qrEditDestination, setQrEditDestination] = useState<string>("");
  const [isSavingQrDest, setIsSavingQrDest] = useState(false);

  const [configModalLink, setConfigModalLink] = useState<LinkItem | null>(null);
  const [saleModalLink, setSaleModalLink] = useState<LinkItem | null>(null);
  const [saleAmount, setSaleAmount] = useState<string>("499");
  const [saleSource, setSaleSource] = useState<string>("Razorpay");
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    originalUrl: "",
    customName: "",
    conversionValue: "",
    mobileUrl: "",
    abTestUrl: "",
    abSplitPercent: 50,
    fallbackUrl: "",
    affiliateName: "",
    commissionRate: 10,
    leadCaptureEnabled: false,
    leadPromptText: "Enter your email or WhatsApp number to continue",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [linksRes, userRes] = await Promise.all([
        fetch("/api/links", { cache: "no-store" }),
        fetch("/api/user/profile", { cache: "no-store" }),
      ]);

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData.links || linksData || []);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user || userData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          originalUrl: "",
          customName: "",
          conversionValue: "",
          mobileUrl: "",
          abTestUrl: "",
          abSplitPercent: 50,
          fallbackUrl: "",
          affiliateName: "",
          commissionRate: 10,
          leadCaptureEnabled: false,
          leadPromptText: "Enter your email or WhatsApp number to continue",
        });
        setShowAddForm(false);
        setShowAdvancedInCreate(false);
        fetchInitialData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to shorten URL");
      }
    } catch (error) {
      alert("Error creating link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLinkConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/links/${configModalLink._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configModalLink),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks((prev) => prev.map((l) => (l._id === configModalLink._id ? data.link : l)));
        setConfigModalLink(null);
      }
    } catch (err) {
      alert("Failed to update link settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDynamicQrDestination = async () => {
    if (!qrModalLink || !qrEditDestination) return;
    setIsSavingQrDest(true);
    try {
      const res = await fetch(`/api/links/${qrModalLink._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: qrEditDestination }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks((prev) => prev.map((l) => (l._id === qrModalLink._id ? data.link : l)));
        setQrModalLink(data.link);
      }
    } catch (err) {
      alert("Failed to update QR destination");
    } finally {
      setIsSavingQrDest(false);
    }
  };

  const handleRecordConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleModalLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: saleModalLink._id,
          amount: Number(saleAmount) || 0,
          source: saleSource,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks((prev) => prev.map((l) => (l._id === saleModalLink._id ? data.link : l)));
        setSaleModalLink(null);
      }
    } catch (err) {
      alert("Failed to record conversion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanLinkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/links/health", { method: "POST" });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (err) {
      console.error("Health check failed:", err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l._id !== id));
      }
    } catch (err) {
      alert("Error deleting link");
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const getQrTargetUrl = (link: LinkItem, locTag: string) => {
    const cleanTag = locTag.trim();
    if (cleanTag) {
      return `${link.shortUrl}?qr=1&loc=${encodeURIComponent(cleanTag)}`;
    }
    return `${link.shortUrl}?qr=1`;
  };

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalRevenue = links.reduce((sum, link) => sum + (link.revenue || 0), 0);
  const totalConversions = links.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const brokenLinksCount = links.filter((l) => l.healthStatus === "broken").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <a href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <Link2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-heading font-extrabold text-slate-900">
                Link<span className="text-indigo-600">Hub</span>
              </span>
            </a>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => { setCurrentView("dashboard"); setSidebarOpen(false); }}
                className={`flex items-center space-x-3 px-3.5 py-2.5 w-full text-left rounded-xl text-sm font-semibold transition-all ${
                  currentView === "dashboard" 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Links & Revenue</span>
              </button>
              <button
                onClick={() => { setCurrentView("analytics"); setSidebarOpen(false); }}
                className={`flex items-center space-x-3 px-3.5 py-2.5 w-full text-left rounded-xl text-sm font-semibold transition-all ${
                  currentView === "analytics" 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>AI & Fraud Analytics</span>
              </button>
            </nav>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-xs truncate">{currentUser.name}</p>
                  <p className="text-slate-400 text-xs truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden text-slate-600 hover:text-slate-900 p-1"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                  {currentView === "dashboard" ? "Links & Revenue Overview" : "AI Insights, Revenue & Fraud Analytics"}
                </h1>
              </div>
            </div>

            {currentView === "dashboard" && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleScanLinkHealth}
                  disabled={isCheckingHealth}
                  title="Scan all destination URLs for 404 or dead pages"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 text-emerald-600 ${isCheckingHealth ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">{isCheckingHealth ? "Scanning..." : "Scan Link Health"}</span>
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Link</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {currentView === "dashboard" ? (
            <div>
              {/* Top 4 Business KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Active Links</p>
                    <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">{links.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Dynamic QR & routing ready</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Link2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Verified Clicks</p>
                    <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">{totalClicks.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Bot-filtered human traffic</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Attributed Revenue</p>
                    <p className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-700">
                      ₹{totalRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{totalConversions} sales tracked</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Link Health Monitor</p>
                    <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                      {brokenLinksCount === 0 ? "100% OK" : `${brokenLinksCount} Dead`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {brokenLinksCount === 0 ? "Zero 404 ad-spend waste" : "Auto-routing to fallback URL"}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
                    brokenLinksCount === 0
                      ? "bg-violet-50 border-violet-100 text-violet-600"
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}>
                    {brokenLinksCount === 0 ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Links Grid Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-heading font-bold text-slate-900">Your Shortened URLs</h2>
                <span className="text-xs text-slate-500">{links.length} total · Page {linksPage}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {links
                  .slice((linksPage - 1) * linksPerPage, linksPage * linksPerPage)
                  .map((link) => (
                  <div key={link._id} className="glass-card rounded-2xl p-5 card-hover flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading font-bold text-slate-900 text-base truncate">
                              {link.customName || link.shortCode}
                            </h3>
                            {link.healthStatus === "broken" ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-full">
                                404 Dead
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                Healthy
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setQrModalLink(link);
                              setQrEditDestination(link.originalUrl);
                              setQrLocationTag("");
                            }}
                            title="Dynamic QR Code & Location Tags"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfigModalLink({ ...link })}
                            title="Configure Smart Routing, A/B Test, Lead Gate & Affiliate"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link._id)}
                            title="Delete Link"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Active Feature Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {(link.revenue || 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            ₹{(link.revenue || 0).toLocaleString("en-IN")} ({link.conversions || 1} sales)
                          </span>
                        )}
                        {link.mobileUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                            <Smartphone className="w-3 h-3" /> Mobile Route
                          </span>
                        )}
                        {link.abTestUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[10px] font-semibold">
                            <Split className="w-3 h-3" /> A/B {link.abSplitPercent || 50}%
                          </span>
                        )}
                        {link.affiliateName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold">
                            <Users className="w-3 h-3" /> {link.affiliateName} ({link.commissionRate || 10}%)
                          </span>
                        )}
                        {link.leadCaptureEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-semibold">
                            <UserCheck className="w-3 h-3" /> Lead Gate ({link.leadsCount || 0})
                          </span>
                        )}
                      </div>

                      {/* Original URL */}
                      <div className="mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Destination</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <p className="text-xs text-slate-500 truncate flex-1">{link.originalUrl}</p>
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Shortened URL */}
                      <div className="mb-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Short Link</span>
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 mt-0.5">
                          <span className="text-xs font-semibold text-indigo-600 truncate mr-2">
                            {link.shortUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(link.shortUrl, link._id)}
                            className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-xs font-medium"
                          >
                            {copiedId === link._id ? (
                              <span className="text-emerald-600 font-semibold text-[11px]">Copied!</span>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => {
                          setSelectedAnalyticsLinkId(link._id);
                          setCurrentView("analytics");
                        }}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{link.clicks || 0} clicks · Analytics</span>
                      </button>

                      <button
                        onClick={() => {
                          setSaleModalLink(link);
                          setSaleAmount(link.conversionValue ? String(link.conversionValue) : "499");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors"
                      >
                        + ₹ Sale
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Links Pagination Bar */}
              {links.length > linksPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200/70">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{(linksPage - 1) * linksPerPage + 1}</span> to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(linksPage * linksPerPage, links.length)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{links.length}</span> links
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLinksPage((p) => Math.max(1, p - 1))}
                      disabled={linksPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    {Array.from({ length: Math.ceil(links.length / linksPerPage) }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setLinksPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          linksPage === pageNum
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setLinksPage((p) => Math.min(Math.ceil(links.length / linksPerPage), p + 1))}
                      disabled={linksPage === Math.ceil(links.length / linksPerPage)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-colors"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {links.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
                    <Link2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">No links created yet</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    Shorten your first destination URL and start tracking clicks, ₹ revenue, and Click Quality Scores.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Add Your First Link
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ModernAnalyticsView linkId={selectedAnalyticsLinkId} />
          )}
        </main>
      </div>

      {/* Add Link Modal (with collapsible Advanced Business Features) */}
      {showAddForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-content rounded-2xl p-6 sm:p-7 w-full max-w-lg mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-heading font-bold text-slate-900">Create Smart Short Link</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Primary Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="https://yourstore.com/product"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Custom Label / Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customName}
                  onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="e.g. Diwali Sale Instagram Bio"
                  disabled={isSubmitting}
                />
              </div>

              {/* Toggle Advanced Business Options */}
              <button
                type="button"
                onClick={() => setShowAdvancedInCreate(!showAdvancedInCreate)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700 transition-colors"
              >
                <span>Smart Routing, Revenue (₹), Affiliate & Lead Capture (Optional)</span>
                {showAdvancedInCreate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedInCreate && (
                <div className="space-y-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Default Order Value (₹)</label>
                      <input
                        type="number"
                        value={formData.conversionValue}
                        onChange={(e) => setFormData({ ...formData, conversionValue: e.target.value })}
                        placeholder="e.g. 999"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile-Only Redirect URL</label>
                      <input
                        type="url"
                        value={formData.mobileUrl}
                        onChange={(e) => setFormData({ ...formData, mobileUrl: e.target.value })}
                        placeholder="https://app.yourstore.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">A/B Test Variant B URL</label>
                      <input
                        type="url"
                        value={formData.abTestUrl}
                        onChange={(e) => setFormData({ ...formData, abTestUrl: e.target.value })}
                        placeholder="https://yourstore.com/landing-b"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">A/B Split %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.abSplitPercent}
                        onChange={(e) => setFormData({ ...formData, abSplitPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">404 Broken-Link Fallback URL</label>
                    <input
                      type="url"
                      value={formData.fallbackUrl}
                      onChange={(e) => setFormData({ ...formData, fallbackUrl: e.target.value })}
                      placeholder="https://yourstore.com/all-products"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Affiliate / Influencer Name</label>
                      <input
                        type="text"
                        value={formData.affiliateName}
                        onChange={(e) => setFormData({ ...formData, affiliateName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.commissionRate}
                        onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.leadCaptureEnabled}
                        onChange={(e) => setFormData({ ...formData, leadCaptureEnabled: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Enable Pre-Redirect Click-to-Lead Capture Gate</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Shorten Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Offline-to-Online QR Code Modal (#6) */}
      {qrModalLink && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="modal-content rounded-2xl p-6 sm:p-7 w-full max-w-md mx-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-heading font-bold text-slate-900">Dynamic Offline-to-Online QR</h2>
              <button onClick={() => setQrModalLink(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Compare flyers/stores with location tags & change the destination even after printing.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mb-4">
              <img
                src={generateQRCode(getQrTargetUrl(qrModalLink, qrLocationTag))}
                alt="Dynamic QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="text-left space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Print Location Tag (Compare Store A vs Store B)
                </label>
                <input
                  type="text"
                  value={qrLocationTag}
                  onChange={(e) => setQrLocationTag(e.target.value)}
                  placeholder="e.g. Store-A-Flyer, Packaging-Box, Counter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Dynamic Destination URL (Edit anytime after printing)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={qrEditDestination}
                    onChange={(e) => setQrEditDestination(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDynamicQrDestination}
                    disabled={isSavingQrDest}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    {isSavingQrDest ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-medium text-indigo-700 break-all mb-4 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
              Encoded QR URL: {getQrTargetUrl(qrModalLink, qrLocationTag)}
            </p>

            <button
              onClick={() => setQrModalLink(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Configure Smart Routing, A/B Test, Fallback, Affiliate & Lead Gate Modal (#4, #5, #7, #8) */}
      {configModalLink && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-content rounded-2xl p-6 sm:p-7 w-full max-w-lg mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-900">
                  Configure: {configModalLink.customName}
                </h2>
                <p className="text-xs text-slate-500">Smart Routing, A/B Testing, Fallback, Affiliate & Lead Capture</p>
              </div>
              <button onClick={() => setConfigModalLink(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLinkConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Destination URL (Dynamic Edit)</label>
                <input
                  type="url"
                  required
                  value={configModalLink.originalUrl}
                  onChange={(e) => setConfigModalLink({ ...configModalLink, originalUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Visitors URL (#4 Smart Route)</label>
                  <input
                    type="url"
                    value={configModalLink.mobileUrl || ""}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, mobileUrl: e.target.value })}
                    placeholder="https://m.yourstore.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">404 Dead-Link Fallback URL (#5)</label>
                  <input
                    type="url"
                    value={configModalLink.fallbackUrl || ""}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, fallbackUrl: e.target.value })}
                    placeholder="https://yourstore.com/backup"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">A/B Test Variant B URL (#4)</label>
                  <input
                    type="url"
                    value={configModalLink.abTestUrl || ""}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, abTestUrl: e.target.value })}
                    placeholder="https://yourstore.com/variant-b"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variant B Split %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={configModalLink.abSplitPercent ?? 50}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, abSplitPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affiliate / Salesperson (#7)</label>
                  <input
                    type="text"
                    value={configModalLink.affiliateName || ""}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, affiliateName: e.target.value })}
                    placeholder="e.g. Priya Verma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={configModalLink.commissionRate ?? 10}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(configModalLink.leadCaptureEnabled)}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, leadCaptureEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Enable Click-to-Lead Capture Gate before Redirect (#8)</span>
                </label>
                {configModalLink.leadCaptureEnabled && (
                  <input
                    type="text"
                    value={configModalLink.leadPromptText || ""}
                    onChange={(e) => setConfigModalLink({ ...configModalLink, leadPromptText: e.target.value })}
                    placeholder="Custom prompt message shown to visitor"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfigModalLink(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click-to-Revenue Attribution & Webhook Modal (#1) */}
      {saleModalLink && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="modal-content rounded-2xl p-6 sm:p-7 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-heading font-bold text-slate-900">
                Click-to-Revenue Attribution (₹)
              </h2>
              <button onClick={() => setSaleModalLink(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Record a sale manually or connect your Razorpay, Shopify, WooCommerce, or Stripe webhook to attribute ₹ earned to <strong>{saleModalLink.customName}</strong>.
            </p>

            <form onSubmit={handleRecordConversion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Payment Platform / Source
                </label>
                <select
                  value={saleSource}
                  onChange={(e) => setSaleSource(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                >
                  <option value="Razorpay">Razorpay (1-Click Webhook)</option>
                  <option value="Shopify">Shopify Order</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Stripe">Stripe Checkout</option>
                  <option value="Manual">Direct / Offline Sale</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Order Sale Amount (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-indigo-900">Zero-Code Webhook Endpoint:</p>
                <code className="block bg-white px-2 py-1 rounded border border-indigo-100 text-indigo-700 break-all">
                  POST /api/conversions &#123; &quot;shortCode&quot;: &quot;{saleModalLink.shortUrl.split("/").pop()}&quot;, &quot;amount&quot;: {saleAmount || 499} &#125;
                </code>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSaleModalLink(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  {isSubmitting ? "Recording..." : `Record ₹${saleAmount} Sale`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
