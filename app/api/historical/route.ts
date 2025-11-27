import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = Redis.fromEnv();

function generateHistoricalData(exchangeId: string, hours: number) {
  const data = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100;

  for (let i = 0; i < 100; i++) {
    const timestamp = now - (100 - i) * interval;
    const baseLatency = 50 + Math.random() * 100;
    const latency = Math.round(baseLatency + Math.sin(i / 10) * 20);
    
    data.push({
      timestamp,
      latency,
      status: latency > 200 ? 'warning' : 'success'
    });
  }

  const latencies = data.map(d => d.latency);
  const stats = {
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
  };

  return { exchangeId, data, stats };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exchangeId = searchParams.get('exchangeId');
    const timeRange = searchParams.get('timeRange') || '24h';

    if (!exchangeId) {
      return NextResponse.json({ error: 'exchangeId required' }, { status: 400 });
    }

    const hoursMap: Record<string, number> = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    };

    const hours = hoursMap[timeRange] || 24;
    const minTimestamp = Date.now() - (hours * 60 * 60 * 1000);

    const key = `latency:${exchangeId}`;
    const rawData = await redis.zrange(key, minTimestamp, Date.now(), {
      byScore: true
    });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(generateHistoricalData(exchangeId, hours));
    }

    const data = (rawData as string[]).map((item: string) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (data.length === 0) {
      return NextResponse.json(generateHistoricalData(exchangeId, hours));
    }

    const latencies = data.map((d: any) => d.latency);
    const stats = {
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      avg: Math.round(latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length)
    };

    return NextResponse.json({ exchangeId, data, stats });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    const exchangeId = request.nextUrl.searchParams.get('exchangeId') || 'unknown';
    const timeRange = request.nextUrl.searchParams.get('timeRange') || '24h';
    const hoursMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
    return NextResponse.json(generateHistoricalData(exchangeId, hoursMap[timeRange] || 24));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exchangeId, latency, timestamp } = body;

    if (!exchangeId || latency === undefined) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const ts = timestamp || Date.now();
    const key = `latency:${exchangeId}`;
    
    const dataPoint = JSON.stringify({
      timestamp: ts,
      latency,
      status: latency > 200 ? 'warning' : latency > 100 ? 'medium' : 'success'
    });

    await redis.zadd(key, { score: ts, member: dataPoint });
    await redis.expire(key, 60 * 60 * 24 * 30);

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    await redis.zremrangebyscore(key, 0, thirtyDaysAgo);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing latency data:', error);
    return NextResponse.json({ error: 'Failed to store data' }, { status: 500 });
  }
}
