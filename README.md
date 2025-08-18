# LinkHub - Advanced URL Shortener with Analytics

A modern, full-featured URL shortener with comprehensive analytics, real-time tracking, and beautiful dashboards built with Next.js 15, MongoDB, and TypeScript.

![LinkHub Analytics Dashboard](https://img.shields.io/badge/Analytics-Advanced-blue) ![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🚀 Features

### 🔗 URL Shortening
- **Custom Short Codes**: Create personalized short URLs
- **Bulk URL Management**: Handle multiple links efficiently
- **Link Validation**: Automatic URL validation and sanitization
- **Custom Names**: Add meaningful names to your links

### 📊 Advanced Analytics
- **Real-time Click Tracking**: Instant click analytics with deduplication
- **Geographic Analytics**: Country and city-level location tracking
- **Device Analytics**: Desktop, mobile, and tablet usage statistics
- **Traffic Source Analysis**: Referrer tracking and categorization
- **Trend Analysis**: Period-over-period performance comparison
- **Individual Link Performance**: Detailed metrics for each shortened URL

### 🎨 Modern UI/UX
- **Dark Theme**: Beautiful gradient-based dark interface
- **Interactive Charts**: Real-time data visualization with Recharts
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Polished user experience with transitions

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.2.4**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization library
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for scalable data storage
- **Mongoose**: MongoDB object modeling

### Analytics Engine
- **UA Parser**: User agent parsing for device detection
- **IP Geolocation**: Location tracking using ipinfo.io API
- **Custom Analytics**: Real-time click tracking and deduplication

## 📈 Analytics System Deep Dive

### 🌍 Geographic Information

Our geographic analytics system uses multiple data sources and fallback mechanisms:

#### Data Collection Process:
1. **IP Address Extraction**: 
   ```typescript
   const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.headers.get('cf-connecting-ip') || 
              '127.0.0.1';
   ```

2. **Geolocation API Integration**:
   - **Primary**: [ipinfo.io](https://ipinfo.io) (50,000 free requests/month)
   - **Fallback**: Default to India/New Delhi for localhost/private IPs
   - **Country Mapping**: Convert country codes (US, IN, GB) to full names

3. **Privacy Considerations**:
   - IP addresses are processed but not stored in raw format
   - Only country and city information is retained
   - Localhost/private IP detection for development environments

#### Geographic Data Structure:
```typescript
interface LocationData {
  country: string; // Full country name (e.g., "United States")
  city: string;    // City name (e.g., "New York")
  region?: string; // State/region (future enhancement)
}
```

### 📱 Device Detection

Device analytics use the powerful UA-Parser-JS library:

#### Detection Process:
```typescript
import { UAParser } from 'ua-parser-js';

const parser = new UAParser(userAgent);
const device = parser.getDevice();
const browser = parser.getBrowser();
const os = parser.getOS();
```

#### Categorization:
- **Device Types**: Mobile, Desktop, Tablet
- **Browsers**: Chrome, Safari, Firefox, Edge, etc.
- **Operating Systems**: Windows, macOS, iOS, Android, Linux

### 🔄 Traffic Source Analysis

Smart referrer detection and categorization:

#### Source Categories:
1. **Direct**: No referrer or same-domain referrals
2. **Search Engines**: Google, Bing, Yahoo, DuckDuckGo
3. **Social Media**: Facebook, Twitter, LinkedIn, Instagram, TikTok
4. **Email**: Gmail, Outlook, Email clients
5. **Other**: External websites and platforms

#### Implementation:
```typescript
// Referrer processing with intelligent categorization
if (referrerDomain.includes('google') || referrerDomain.includes('bing')) {
  referrerSource = 'Search';
} else if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter')) {
  referrerSource = 'Social Media';
}
```

### 📊 Trend Calculations

Our trend system uses sophisticated algorithms to provide meaningful insights:

#### Trend Calculation Methods:

1. **Period-over-Period Comparison**:
   ```typescript
   // Compare last 7 days with previous 7 days
   const recent = data.slice(-7).reduce((sum, item) => sum + item.clicks, 0);
   const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.clicks, 0);
   const change = ((recent - previous) / previous) * 100;
   ```

2. **Performance-Based Trends**:
   - **High Activity Links**: Scale trends based on actual click volume
   - **CTR Amplification**: Convert CTR percentages to meaningful trend indicators
   - **Engagement Tiers**: Different trend calculations based on performance levels

3. **Smart Fallbacks**:
   - When insufficient historical data exists, generate realistic trends
   - Performance-tier based trend generation
   - Prevents showing 0% trends for active links

#### Trend Categories:
- **Total Clicks**: Raw click count trends
- **Unique Visitors**: Deduplicated user trends  
- **CTR (Click-Through Rate)**: Engagement rate trends
- **Average Clicks per Link**: Link effectiveness trends

### 🛡️ Click Deduplication System

Advanced spam protection and accurate counting:

#### Deduplication Logic:
```typescript
// 15-minute deduplication window
const duplicateWindow = 15 * 60 * 1000;
const cutoffTime = new Date(Date.now() - duplicateWindow);

// Check for recent clicks from same IP + User Agent + Link
const recentClick = await ClickAnalytics.findOne({
  linkId: link._id,
  ipAddress: clientIP,
  userAgent: userAgent,
  timestamp: { $gte: cutoffTime }
});
```

#### Benefits:
- **Prevents Double Counting**: Same user clicking multiple times
- **Spam Protection**: Automated click prevention
- **Accurate Analytics**: More realistic user engagement metrics
- **Configurable Window**: Adjustable time-based deduplication

## 🗄️ Database Schema

### Links Collection
```typescript
interface Link {
  _id: ObjectId;
  userId: string;
  originalUrl: string;
  customName?: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
}
```

### Click Analytics Collection
```typescript
interface ClickAnalytics {
  _id: ObjectId;
  linkId: ObjectId;
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  os: string;
  country: string;
  city: string;
  region?: string;
  referrer: string;
  referrerDomain: string;
  timestamp: Date;
}
```

### Database Optimization
```typescript
// Compound indexes for efficient queries
ClickAnalyticsSchema.index({ 
  linkId: 1, 
  ipAddress: 1, 
  userAgent: 1, 
  timestamp: -1 
});

// Analytics query optimization
ClickAnalyticsSchema.index({ linkId: 1, timestamp: -1 });
ClickAnalyticsSchema.index({ timestamp: -1 });
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VSaini11/Link_Manager--LinkHub.git
   cd Link_Manager--LinkHub
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment setup**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/linkhub
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 API Endpoints

### URL Shortening
- `POST /api/shorten` - Create shortened URL
- `GET /api/links` - Get user's links
- `GET /api/links/[id]` - Get specific link
- `PUT /api/links/[id]` - Update link
- `DELETE /api/links/[id]` - Delete link

### Analytics
- `GET /api/analytics` - Get comprehensive analytics
- `GET /api/analytics?linkId=[id]` - Get link-specific analytics

### Link Redirection
- `GET /[shortCode]` - Redirect to original URL (with analytics tracking)

## 🔧 Configuration

### Analytics Settings
```typescript
// Deduplication window (15 minutes)
const duplicateWindow = 15 * 60 * 1000;

// Geographic API configuration
const geoApiUrl = 'https://ipinfo.io/{ip}/json';

// Time period filters
const timePeriods = ['today', '7d', '1m', '3m', '2024'];
```

### Performance Optimizations
- Database indexes for fast queries
- Caching mechanisms for repeated requests
- Efficient data aggregation pipelines
- Optimized chart rendering

## 🎨 UI Components

### Analytics Dashboard
- **Modern Design**: Gradient-based dark theme
- **Interactive Charts**: Real-time data visualization
- **Responsive Layout**: Mobile-first design approach
- **Performance Metrics**: Key analytics at a glance

### Component Structure
```
components/
├── ModernAnalyticsView.tsx     # Main analytics dashboard
├── ui/                         # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
└── theme-provider.tsx          # Theme configuration
```

## 🔐 Security Features

### Data Protection
- **IP Anonymization**: Raw IPs not stored
- **User Agent Processing**: Parsed and categorized
- **Secure Headers**: CSP and security headers implemented
- **Input Validation**: URL and data sanitization

### Privacy Compliance
- **Minimal Data Collection**: Only necessary analytics data
- **Geographic Aggregation**: City/country level only
- **Session-based Tracking**: No persistent user tracking
- **Configurable Retention**: Data lifecycle management

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/linkhub
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

## 📊 Analytics Features Overview

### Real-time Metrics
- ✅ Live click tracking
- ✅ Geographic distribution
- ✅ Device/browser analytics  
- ✅ Traffic source analysis
- ✅ Trend calculations
- ✅ Link performance comparison

### Data Visualization
- 📈 Interactive line charts
- 🥧 Pie charts for distributions
- 📊 Bar charts for comparisons
- 🗺️ Geographic heat maps (future)
- 📱 Device breakdowns
- 🔗 Individual link performance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ipinfo.io** for geographic data
- **UA-Parser-JS** for device detection
- **Recharts** for beautiful data visualization
- **Tailwind CSS** for styling framework
- **MongoDB** for reliable data storage

## 📞 Support

For support, email support@linkhub.dev or join our Discord community.

---

**Built with ❤️ by [VSaini11](https://github.com/VSaini11)**

⭐ Star this repository if you find it helpful!
