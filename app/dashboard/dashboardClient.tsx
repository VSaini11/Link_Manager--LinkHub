"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Link2,
  QrCode,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  UserIcon,
  LogOut,
  Menu,
  X,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AnalyticsView from "@/components/ModernAnalyticsView";

interface Link {
  _id: string;
  id: string;
  originalUrl: string;
  shortUrl: string;
  customName: string;
  clicks: number;
  createdAt: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
}

export default function DashboardClient({ user }: { user: User }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard'); // Add view state
  const [formData, setFormData] = useState({
    originalUrl: "",
    customName: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchLinks();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const linksData = await response.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    }
  };

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.originalUrl.trim() || !formData.customName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!isValidUrl(formData.originalUrl)) {
      alert("Please enter a valid URL (include http:// or https://)");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting URL shortening process...");
      console.log("Original URL:", formData.originalUrl);

      // Generate a short code using dynamic base URL
      let shortUrl = "";
      
      // Use environment variable if available, otherwise use current origin
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const shortCode = Math.random().toString(36).substring(2, 8);
      shortUrl = `${baseUrl}/${shortCode}`;

      console.log("Generated short URL:", shortUrl);

      // Save to your database
      const response = await fetch("/api/links", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          originalUrl: formData.originalUrl,
          shortUrl: shortUrl,
          customName: formData.customName,
        }),
      });

      console.log("Database save response status:", response.status);

      if (response.ok) {
        const newLink = await response.json();
        console.log("New link created:", newLink);
        setLinks([newLink, ...links]);
        setFormData({ originalUrl: "", customName: "" });
        setShowAddForm(false);
        alert("Link created successfully!");
      } else {
        const errorData = await response.text();
        console.error("Database save failed:", errorData);
        alert(`Failed to save shortened URL: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("An error occurred during shortening:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((link) => link._id !== id));
        alert("Link deleted successfully!");
      } else {
        alert("Failed to delete link");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the link");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Copied to clipboard!");
      } catch (fallbackError) {
        alert("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm sm:text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Link2 className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">LinkHub</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:text-purple-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'text-white bg-white/10' 
                    : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${
                  currentView === 'analytics' 
                    ? 'text-white bg-white/10' 
                    : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{currentUser.name}</p>
                  <p className="text-purple-300 text-sm truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white hover:text-purple-300">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {currentView === 'dashboard' ? 'Dashboard' : 'Analytics'}
              </h1>
            </div>
            {currentView === 'dashboard' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white text-purple-900 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-50 transition-colors text-sm sm:text-base"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Link</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {currentView === 'dashboard' ? (
            <div className="p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-xs sm:text-sm">Total Links</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{links.length}</p>
                    </div>
                    <Link2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                </div>
                <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-xs sm:text-sm">Total Clicks</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{links.reduce((sum, link) => sum + link.clicks, 0)}</p>
                    </div>
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                </div>
                <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-xs sm:text-sm">QR Codes</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{links.length}</p>
                    </div>
                    <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {links.map((link) => (
                  <div key={link._id} className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 card-hover">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate pr-2">{link.customName}</h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => setShowQRCode(link.shortUrl)}
                          className="text-purple-300 hover:text-white transition-colors p-1"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <p className="text-purple-300 text-xs sm:text-sm mb-1">Original URL</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white text-xs sm:text-sm truncate flex-1">{link.originalUrl}</p>
                          <button
                            onClick={() => window.open(link.originalUrl, "_blank")}
                            className="text-purple-300 hover:text-white transition-colors p-1 flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-purple-300 text-xs sm:text-sm mb-1">Short URL</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white text-xs sm:text-sm truncate flex-1">{link.shortUrl}</p>
                          <button
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="text-purple-300 hover:text-white transition-colors p-1 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-purple-300 text-xs sm:text-sm font-medium">{link.clicks} clicks</span>
                        <span className="text-purple-300 text-sm">{new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {links.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                  <Link2 className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No links yet</h3>
                  <p className="text-purple-300 mb-6 text-sm sm:text-base">Create your first link to get started</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm sm:text-base"
                  >
                    Add Your First Link
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AnalyticsView />
          )}
        </main>
      </div>

      {/* Add Link Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Add New Link</h2>
            <form onSubmit={handleAddLink} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-2">Original URL</label>
                <input
                  type="url"
                  required
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-2">Custom Name</label>
                <input
                  type="text"
                  required
                  value={formData.customName}
                  onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="My awesome link"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex space-x-3 sm:space-x-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 sm:py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 sm:py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-sm mx-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">QR Code</h2>
            <div className="bg-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <img src={generateQRCode(showQRCode)} alt="QR Code" className="w-full h-auto" />
            </div>
            <p className="text-purple-200 text-xs sm:text-sm mb-4 sm:mb-6 break-all">{showQRCode}</p>
            <button
              onClick={() => setShowQRCode(null)}
              className="w-full py-2 sm:py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}