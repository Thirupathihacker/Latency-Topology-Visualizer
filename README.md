# Latency Topology Visualizer

Real-time 3D visualization of cryptocurrency exchange server locations and latency data across AWS, GCP, and Azure co-location regions.

## Features

- **3D Interactive Globe**: Rotate, zoom, and explore exchange locations worldwide
- **Real-time Latency Monitoring**: Live latency measurements updated every 8 seconds
- **Historical Data Analysis**: View trends over 1h, 24h, 7d, and 30d periods
- **Multi-Cloud Support**: Visualize AWS, GCP, and Azure infrastructure
- **Advanced Filtering**: Filter by provider, exchange, and latency ranges
- **Dark/Light Theme**: Toggle between themes for optimal viewing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Efficient 3D rendering with WebGL

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **3D Visualization**: React Globe GL + Three.js
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **State Management**: Zustand
- **Database**: Upstash Redis (for historical data)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd latency-visualizer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (optional for local development)
```bash
# Create .env.local file with Upstash Redis credentials
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
```

4. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
latency-visualizer/
├── app/
│   ├── api/
│   │   ├── latency/          # Real-time latency endpoints
│   │   │   ├── route.ts      # Actual ping measurements
│   │   │   └── mock/         # Simulated data fallback
│   │   └── historical/       # Historical data endpoints
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── globe/                # 3D globe visualization
│   ├── controls/             # Filter and control panels
│   ├── charts/               # Historical charts
│   ├── stats/                # Statistics dashboard
│   ├── layout/               # Header and layout components
│   ├── providers/            # Theme provider
│   ├── ui/                   # shadcn/ui components
│   └── MainApp.tsx           # Main application component
├── lib/
│   ├── data/
│   │   └── exchanges.ts      # Exchange and region data
│   ├── types.ts              # TypeScript types
│   ├── store.ts              # Zustand state management
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Data Sources

### Exchange Locations

The application includes 12 major cryptocurrency exchanges:
- Binance (Tokyo, Virginia)
- Bybit (Singapore)
- OKX (Singapore)
- Deribit (Amsterdam)
- Kraken (Frankfurt)
- Coinbase (Virginia)
- Bitfinex (London)
- Huobi (Tokyo)
- KuCoin (Singapore)
- Gate.io (Seoul)
- MEXC (Singapore)

### Latency Measurement

- **Primary**: Direct HTTP ping to exchange API endpoints
- **Fallback**: Realistic simulated data with variations and spikes
- **Update Interval**: 8 seconds
- **Timeout**: 5 seconds per request

## Vercel KV Integration

To enable persistent historical data storage:

1. Add Vercel KV to your project:
```bash
vercel env pull
```

2. Install the Vercel KV package:
```bash
npm install @vercel/kv
```

3. Update `app/api/historical/route.ts` to use Vercel KV instead of mock data

## Environment Variables

Create a `.env.local` file for local development:

```env
# Vercel KV (optional - for historical data persistence)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import project in Vercel dashboard

3. Configure environment variables (if using Vercel KV)

4. Deploy

The application is optimized for Vercel with:
- Edge runtime support
- Automatic API route optimization
- Static asset optimization
- Image optimization

## Data Persistence

The application uses **Upstash Redis** to store historical latency data:

- **Automatic Storage**: Every latency measurement is automatically stored in Redis
- **Sorted Sets**: Data is stored using Redis sorted sets with timestamps as scores
- **Time-based Queries**: Efficiently retrieve data for specific time ranges (1h, 24h, 7d, 30d)
- **Auto-Expiration**: Data automatically expires after 30 days
- **Fallback**: If Redis is unavailable, the app falls back to mock data

### Redis Data Structure

```
Key: latency:{exchangeId}
Type: Sorted Set
Score: timestamp (milliseconds)
Member: JSON { timestamp, latency, status }
```

### API Endpoints

- `GET /api/historical?exchangeId={id}&timeRange={range}` - Fetch historical data
- `POST /api/historical` - Store latency measurement
- `GET /api/latency/mock` - Get current latency (auto-stores to Redis)

## Performance Optimizations

- Dynamic imports for 3D components (reduces initial bundle)
- Memoized calculations for filtered data
- Efficient re-rendering with Zustand
- WebGL-based 3D rendering
- Optimized chart rendering with Recharts
- CSS-based animations where possible
- Redis for fast historical data retrieval

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL support required for 3D visualization.

## License

MIT

## Acknowledgments

- Exchange location data based on public infrastructure information
- 3D globe powered by react-globe.gl
- UI components from shadcn/ui
