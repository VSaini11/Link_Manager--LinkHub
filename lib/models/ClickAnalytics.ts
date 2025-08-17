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
  deviceType: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet'],
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for efficient duplicate detection
ClickAnalyticsSchema.index({ 
  linkId: 1, 
  ipAddress: 1, 
  userAgent: 1, 
  timestamp: -1 
});

// Add index for analytics queries
ClickAnalyticsSchema.index({ linkId: 1, timestamp: -1 });
ClickAnalyticsSchema.index({ timestamp: -1 });

const ClickAnalytics = mongoose.models.ClickAnalytics || mongoose.model('ClickAnalytics', ClickAnalyticsSchema);

export default ClickAnalytics;
