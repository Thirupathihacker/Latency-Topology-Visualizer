export type CloudProvider = 'AWS' | 'GCP' | 'Azure';

export interface ExchangeServer {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  cloudProvider: CloudProvider;
  region: string;
  endpoints: string[];
}

export const EXCHANGE_SERVERS: ExchangeServer[] = [
  {
    id: 'binance-tokyo',
    name: 'Binance',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    cloudProvider: 'AWS',
    region: 'ap-northeast-1',
    endpoints: ['https://api.binance.com/api/v3/ping']
  },
  {
    id: 'binance-virginia',
    name: 'Binance',
    location: 'Virginia, USA',
    lat: 37.4316,
    lng: -78.6569,
    cloudProvider: 'AWS',
    region: 'us-east-1',
    endpoints: ['https://api.binance.us/api/v3/ping']
  },
  {
    id: 'bybit-singapore',
    name: 'Bybit',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    cloudProvider: 'AWS',
    region: 'ap-southeast-1',
    endpoints: ['https://api.bybit.com/v5/market/time']
  },
  {
    id: 'okx-singapore',
    name: 'OKX',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    cloudProvider: 'AWS',
    region: 'ap-southeast-1',
    endpoints: ['https://www.okx.com/api/v5/public/time']
  },
  {
    id: 'deribit-amsterdam',
    name: 'Deribit',
    location: 'Amsterdam, Netherlands',
    lat: 52.3676,
    lng: 4.9041,
    cloudProvider: 'GCP',
    region: 'europe-west4',
    endpoints: ['https://www.deribit.com/api/v2/public/get_time']
  },
  {
    id: 'kraken-frankfurt',
    name: 'Kraken',
    location: 'Frankfurt, Germany',
    lat: 50.1109,
    lng: 8.6821,
    cloudProvider: 'AWS',
    region: 'eu-central-1',
    endpoints: ['https://api.kraken.com/0/public/Time']
  },
  {
    id: 'coinbase-virginia',
    name: 'Coinbase',
    location: 'Virginia, USA',
    lat: 37.4316,
    lng: -78.6569,
    cloudProvider: 'AWS',
    region: 'us-east-1',
    endpoints: ['https://api.coinbase.com/v2/time']
  },
  {
    id: 'bitfinex-london',
    name: 'Bitfinex',
    location: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    cloudProvider: 'Azure',
    region: 'uk-south',
    endpoints: ['https://api-pub.bitfinex.com/v2/platform/status']
  },
  {
    id: 'huobi-tokyo',
    name: 'Huobi',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    cloudProvider: 'AWS',
    region: 'ap-northeast-1',
    endpoints: ['https://api.huobi.pro/v1/common/timestamp']
  },
  {
    id: 'kucoin-singapore',
    name: 'KuCoin',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    cloudProvider: 'AWS',
    region: 'ap-southeast-1',
    endpoints: ['https://api.kucoin.com/api/v1/timestamp']
  },
  {
    id: 'gateio-seoul',
    name: 'Gate.io',
    location: 'Seoul, South Korea',
    lat: 37.5665,
    lng: 126.9780,
    cloudProvider: 'AWS',
    region: 'ap-northeast-2',
    endpoints: ['https://api.gateio.ws/api/v4/spot/time']
  },
  {
    id: 'mexc-singapore',
    name: 'MEXC',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    cloudProvider: 'GCP',
    region: 'asia-southeast1',
    endpoints: ['https://api.mexc.com/api/v3/ping']
  }
];

export interface CloudRegion {
  id: string;
  provider: CloudProvider;
  name: string;
  code: string;
  location: string;
  lat: number;
  lng: number;
}

export const CLOUD_REGIONS: CloudRegion[] = [
  {
    id: 'aws-us-east-1',
    provider: 'AWS',
    name: 'US East (N. Virginia)',
    code: 'us-east-1',
    location: 'Virginia, USA',
    lat: 37.4316,
    lng: -78.6569
  },
  {
    id: 'aws-us-west-2',
    provider: 'AWS',
    name: 'US West (Oregon)',
    code: 'us-west-2',
    location: 'Oregon, USA',
    lat: 45.5152,
    lng: -122.6784
  },
  {
    id: 'aws-eu-central-1',
    provider: 'AWS',
    name: 'EU (Frankfurt)',
    code: 'eu-central-1',
    location: 'Frankfurt, Germany',
    lat: 50.1109,
    lng: 8.6821
  },
  {
    id: 'aws-ap-northeast-1',
    provider: 'AWS',
    name: 'Asia Pacific (Tokyo)',
    code: 'ap-northeast-1',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503
  },
  {
    id: 'aws-ap-southeast-1',
    provider: 'AWS',
    name: 'Asia Pacific (Singapore)',
    code: 'ap-southeast-1',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198
  },
  {
    id: 'aws-ap-northeast-2',
    provider: 'AWS',
    name: 'Asia Pacific (Seoul)',
    code: 'ap-northeast-2',
    location: 'Seoul, South Korea',
    lat: 37.5665,
    lng: 126.9780
  },
  {
    id: 'gcp-us-central1',
    provider: 'GCP',
    name: 'US Central (Iowa)',
    code: 'us-central1',
    location: 'Iowa, USA',
    lat: 41.8780,
    lng: -93.0977
  },
  {
    id: 'gcp-europe-west4',
    provider: 'GCP',
    name: 'Europe West (Netherlands)',
    code: 'europe-west4',
    location: 'Amsterdam, Netherlands',
    lat: 52.3676,
    lng: 4.9041
  },
  {
    id: 'gcp-asia-southeast1',
    provider: 'GCP',
    name: 'Asia Southeast (Singapore)',
    code: 'asia-southeast1',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198
  },
  {
    id: 'azure-eastus',
    provider: 'Azure',
    name: 'East US',
    code: 'eastus',
    location: 'Virginia, USA',
    lat: 37.4316,
    lng: -78.6569
  },
  {
    id: 'azure-westeurope',
    provider: 'Azure',
    name: 'West Europe',
    code: 'westeurope',
    location: 'Amsterdam, Netherlands',
    lat: 52.3676,
    lng: 4.9041
  },
  {
    id: 'azure-uksouth',
    provider: 'Azure',
    name: 'UK South',
    code: 'uksouth',
    location: 'London, UK',
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: 'azure-southeastasia',
    provider: 'Azure',
    name: 'Southeast Asia',
    code: 'southeastasia',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198
  }
];

export const PROVIDER_COLORS = {
  AWS: '#FF9900',
  GCP: '#4285F4',
  Azure: '#0078D4'
} as const;

export const LATENCY_THRESHOLDS = {
  low: 100,
  medium: 200,
  high: Infinity
} as const;

export const getLatencyColor = (latency: number): string => {
  if (latency < LATENCY_THRESHOLDS.low) return '#10b981';
  if (latency < LATENCY_THRESHOLDS.medium) return '#f59e0b';
  return '#ef4444';
};
