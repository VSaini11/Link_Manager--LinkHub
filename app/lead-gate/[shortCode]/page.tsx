"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Link2, ArrowRight, ShieldCheck, Lock } from "lucide-react";

function LeadGateForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const shortCode = params?.shortCode as string;

  const dest = searchParams.get("dest") || "/";
  const linkId = searchParams.get("linkId") || "";
  const title = searchParams.get("title") || "Continue to Link";
  const promptText =
    searchParams.get("prompt") ||
    "Enter your email or WhatsApp number to unlock and continue to the destination.";

  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          shortCode,
          contact: contact.trim(),
          name: name.trim(),
        }),
      });
    } catch {
      // Proceed even if logging fails
    } finally {
      window.location.href = dest;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-7 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Link2 className="w-6 h-6" />
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Safe Destination
        </span>

        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mb-2">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {promptText}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Email or Phone Number *
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com or +91 98765..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? "Redirecting..." : "Continue to Link"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> Consent-based lead capture
          </span>
          <a href={dest} className="hover:text-slate-600 underline">
            Skip
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LeadGatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <LeadGateForm />
    </Suspense>
  );
}

