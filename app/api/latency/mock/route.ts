import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { EXCHANGE_SERVERS } from '@/lib/data/exchanges';
import { LatencyData } from '@/lib/types';

const redis = Redis.fromEnv();

export const dynamic = 'force-dynamic';

function generateRealisticLatency(baseLatency: number): number {
  const variation = baseLatency * 0.2;
  const spike = Math.random() < 0.05 ? baseLatency * 0.5 : 0;
  return Math.round(baseLatency + (Math.random() - 0.5) * variation + spike);
}

const BASE_LATENCIES: Record<string, number> = {
  'binance-tokyo': 45,
  'binance-virginia': 85,
  'bybit-singapore': 52,
  'okx-singapore': 48,
  'deribit-amsterdam': 95,
  'kraken-frankfurt': 88,
  'coinbase-virginia': 82,
  'bitfinex-london': 92,
  'huobi-tokyo': 47,
  'kucoin-singapore': 50,
  'gateio-seoul': 55,
  'mexc-singapore': 53
};

export async function GET() {
  const timestamp = Date.now();
  
  const latencyData: LatencyData[] = EXCHANGE_SERVERS.map(server => {
    const baseLatency = BASE_LATENCIES[server.id] || 100;
    const latency = generateRealisticLatency(baseLatency);
    
    const hasError = Math.random() < 0.05;
    
    return {
      exchangeId: server.id,
      latency: hasError ? -1 : latency,
      timestamp,
      status: hasError ? 'error' : (latency > 150 ? 'warning' : 'success')
    };
  });

  latencyData.forEach(async (data) => {
    if (data.latency !== -1) {
      try {
        const key = `latency:${data.exchangeId}`;
        const dataPoint = JSON.stringify({
          timestamp: data.timestamp,
          latency: data.latency,
          status: data.status
        });
        
        await redis.zadd(key, { score: data.timestamp, member: dataPoint });
        await redis.expire(key, 60 * 60 * 24 * 30);
      } catch (error) {
        console.error(`Failed to store latency for ${data.exchangeId}:`, error);
      }
    }
  });

  return NextResponse.json(latencyData);
}
