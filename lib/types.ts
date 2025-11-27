import { CloudProvider } from './data/exchanges';

export interface LatencyData {
  exchangeId: string;
  latency: number;
  timestamp: number;
  status: 'success' | 'warning' | 'error';
}

export interface LatencyConnection {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  latency: number;
  color: string;
}

export interface HistoricalLatency {
  exchangeId: string;
  data: Array<{
    timestamp: number;
    latency: number;
  }>;
  stats: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface FilterState {
  providers: CloudProvider[];
  exchanges: string[];
  latencyRange: [number, number];
  showRealtime: boolean;
  showHistorical: boolean;
  showRegions: boolean;
  showAnalytical: boolean;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';
