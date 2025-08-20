import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    default: 'LinkHub Team'
  },
  authorEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  submitterName: {
    type: String,
    trim: true
  },
  submitterEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['URL Shortening', 'Analytics', 'Marketing', 'Tips & Tricks', 'Industry News', 'Tutorials']
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredImage: {
    type: String,
    default: '/placeholder-blog.jpg'
  },
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
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
  adminNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'published'],
    default: 'pending'
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create text index for search functionality
BlogSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text'
});

// Auto-generate slug from title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set metaTitle and metaDescription if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.title.slice(0, 60);
  }
  if (!this.metaDescription) {
    this.metaDescription = this.excerpt.slice(0, 160);
  }
  
  // Calculate read time based on content length (average 200 words per minute)
  const wordCount = this.content.split(' ').length;
  this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  
  // Set publishedAt when publishing
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
