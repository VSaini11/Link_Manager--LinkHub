import mongoose from 'mongoose';

const ClickAnalyticsSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isBot: {
    type: Boolean,
    default: false
  },
  deviceType: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet'],
    default: 'Desktop',
    required: true
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  region: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: ''
  },
  referrerDomain: {
    type: String,
    default: 'Direct'
  },
  referrerSource: {
    type: String,
    enum: ['Direct', 'Social Media', 'Search', 'Messaging', 'Email', 'AI / Referral', 'QR Scan', 'Other'],
    default: 'Direct'
  },
  isQRScan: {
    type: Boolean,
    default: false
  },
  qrLocationTag: {
    type: String,
    default: ''
  },
  routedTo: {
    type: String,
    default: 'primary' // 'primary' | 'mobile' | 'ab_variant' | 'fallback'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast duplicate/debounce & unique visitor checks
ClickAnalyticsSchema.index({ 
  linkId: 1, 
  ipAddress: 1, 
  userAgent: 1, 
  timestamp: -1 
});

// Index for analytics aggregation queries
ClickAnalyticsSchema.index({ linkId: 1, isBot: 1, timestamp: -1 });
ClickAnalyticsSchema.index({ timestamp: -1 });

// Ensure schema updates apply in dev hot-reload
if (mongoose.models.ClickAnalytics) {
  delete mongoose.models.ClickAnalytics;
}

const ClickAnalytics = mongoose.model('ClickAnalytics', ClickAnalyticsSchema);

export default ClickAnalytics;
