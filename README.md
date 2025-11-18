# 🗺️ Civic Reporter - Community Issue Tracking with Time Travel

A modern civic engagement platform that allows citizens to report and track community issues with advanced features like time travel visualization and AI-powered search using Qdrant vector database.

## ✨ Features

### 🎯 Core Features

- **Interactive Map** - Report and view issues on an interactive dark-themed map
- **Smart Search** - AI-powered semantic search using Qdrant vector database
- **Category Filtering** - Filter by Infrastructure, Safety, Aesthetics, Environment
- **Real-time Updates** - Live issue tracking and community engagement

### 🕰️ Time Travel

- **Historical View** - Travel back in time to see how issues evolved
- **Playback Controls** - Play/pause timeline with variable speeds (0.5x to 5x)
- **Timeline Scrubber** - Jump to any point in time instantly
- **Pattern Recognition** - Identify trends and issue hotspots over time

### 🧠 AI-Powered Insights

- **Vector Search** - Find similar issues using semantic understanding
- **Issue Clustering** - Automatically group related problems
- **Predictive Analytics** - Identify potential issue hotspots
- **Community Sentiment** - Track mood and engagement patterns

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for Qdrant)
- Mapbox API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd civic-reporter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   # Add your Mapbox API key to .env.local
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

   The app will start with an empty state. To add data, you'll need to enable Qdrant.

## 🗄️ **Enable Qdrant for Data Persistence**

To store and retrieve reports, you need to set up Qdrant:

### **Option A: Docker Compose (Recommended)**

```bash
npm run qdrant:compose
```

### **Option B: Direct Docker**

```bash
npm run qdrant
```

### **Option C: Manual Docker**

```bash
docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage:z qdrant/qdrant
```

### **Seed with Data**

```bash
npm run seed
```

### **Stop Qdrant**

```bash
npm run qdrant:stop
```

## 🏗️ Architecture

### Component Structure

```
components/
├── map/
│   ├── MapContainer.tsx      # Main map component
│   ├── ReportMarker.tsx      # Individual report markers
│   └── ReportPopup.tsx       # Report detail popups
├── time-travel/
│   └── TimeTravelModal.tsx   # Time travel controls
└── ui/                       # Reusable UI components
```

### Data Flow

```
Frontend (Next.js) → API Routes → Qdrant Vector DB
                                      ↓
                              Vector Embeddings
                              Semantic Search
                              Geospatial Queries
```

### Qdrant Integration

- **Collection**: `reports` with 384-dimensional vectors
- **Embeddings**: Text embeddings for semantic search
- **Metadata**: Full report data stored as payload
- **Filters**: Date ranges, categories, geospatial queries

## 🎮 Usage

### Basic Operations

1. **View Reports** - Browse issues on the interactive map
2. **Search** - Use natural language to find similar issues
3. **Filter** - Filter by category, date, or location
4. **Report Issues** - Click the + button to add new reports

### Time Travel Feature

1. **Open Time Travel** - Click the clock icon in bottom right
2. **Set Date Range** - Choose start and end dates
3. **Start Journey** - Click "Start Time Travel"
4. **Navigate** - Use playback controls or scrub the timeline
5. **Analyze** - Watch issues appear chronologically

### Advanced Search

- **Semantic Search**: "broken streetlights" finds "damaged lighting"
- **Location Search**: "issues near Central Park"
- **Category Search**: "safety problems downtown"
- **Trend Analysis**: "recurring issues this month"

## 🔧 API Endpoints

### Reports

- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/search?q=query` - Semantic search

### Database

- `POST /api/reports/seed` - Seed with sample data

## 🎨 Customization

### Adding New Categories

1. Update `lib/config.ts` with new category
2. Add corresponding icon from Lucide React
3. Update TypeScript types in `types/report.ts`

### Extending Search

1. Modify `lib/qdrant.ts` for new search parameters
2. Add API endpoints in `app/api/`
3. Update frontend search components

## 🚀 Deployment

### Qdrant Cloud

1. Sign up for Qdrant Cloud
2. Update `QDRANT_URL` and `QDRANT_API_KEY` in environment variables
3. Deploy to Vercel/Netlify

### Self-Hosted

1. Deploy Qdrant using Docker Compose
2. Configure environment variables
3. Deploy Next.js app to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Qdrant** - Vector database for AI-powered search
- **Mapbox** - Interactive mapping platform
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

---

Built with ❤️ for better communities
