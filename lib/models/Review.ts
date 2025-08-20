import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  avatar: {
    type: String,
    default: '/placeholder-user.jpg'
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  approved: {
    type: Boolean,
    default: false
  },
  rejected: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Create index for efficient queries
ReviewSchema.index({ approved: 1, createdAt: -1 });
ReviewSchema.index({ rejected: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ featured: 1 });

// Virtual for getting days since review
ReviewSchema.virtual('daysSince').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    { $match: { approved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get rating distribution
ReviewSchema.statics.getRatingDistribution = async function() {
  const result = await this.aggregate([
    { $match: { approved: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  
  // Create array with all ratings (1-5) initialized to 0
  const distribution = Array.from({ length: 5 }, (_, i) => ({ rating: 5 - i, count: 0 }));
  
  // Fill in actual counts
  result.forEach(item => {
    const index = distribution.findIndex(d => d.rating === item._id);
    if (index !== -1) {
      distribution[index].count = item.count;
    }
  });
  
  return distribution;
};

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
