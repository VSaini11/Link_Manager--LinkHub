import mongoose, { Schema, models, model } from "mongoose";

export interface ILink extends mongoose.Document {
  userId: string;
  originalUrl: string;
  customName: string;
  shortUrl: string;
  clicks: number;
  qrScans: number;
  // Revenue Attribution (#1)
  conversions: number;
  revenue: number;
  conversionValue: number; // default value per conversion (₹)
  // Smart Routing & A/B Testing (#4)
  mobileUrl?: string;
  iosUrl?: string;
  androidUrl?: string;
  abTestUrl?: string;
  abSplitPercent?: number; // e.g., 50 for 50/50 split
  // Link Health Monitor (#5)
  fallbackUrl?: string;
  healthStatus?: "healthy" | "broken" | "unchecked";
  lastHealthCode?: number;
  lastCheckedAt?: Date;
  // Team & Affiliate Tracking (#7)
  affiliateName?: string;
  commissionRate?: number; // percentage e.g. 10%
  // Click-to-Lead Capture (#8)
  leadCaptureEnabled?: boolean;
  leadPromptText?: string;
  leadsCount?: number;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  userId: { type: String, required: true },
  originalUrl: { type: String, required: true },
  customName: { type: String },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  qrScans: { type: Number, default: 0 },
  // Revenue Attribution
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  conversionValue: { type: Number, default: 0 },
  // Smart Routing & A/B Testing
  mobileUrl: { type: String, default: "" },
  iosUrl: { type: String, default: "" },
  androidUrl: { type: String, default: "" },
  abTestUrl: { type: String, default: "" },
  abSplitPercent: { type: Number, default: 50 },
  // Link Health Monitor
  fallbackUrl: { type: String, default: "" },
  healthStatus: { type: String, enum: ["healthy", "broken", "unchecked"], default: "unchecked" },
  lastHealthCode: { type: Number, default: 200 },
  lastCheckedAt: { type: Date },
  // Team & Affiliate Tracking
  affiliateName: { type: String, default: "" },
  commissionRate: { type: Number, default: 10 },
  // Click-to-Lead Capture
  leadCaptureEnabled: { type: Boolean, default: false },
  leadPromptText: { type: String, default: "Enter your email or phone to continue to destination" },
  leadsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Link) {
  delete mongoose.models.Link;
}

export default models.Link || model<ILink>("Link", LinkSchema);
