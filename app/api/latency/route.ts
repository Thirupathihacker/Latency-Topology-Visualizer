import { NextRequest, NextResponse } from 'next/server';
import { EXCHANGE_SERVERS } from '@/lib/data/exchanges';

export const dynamic = 'force-dynamic';

async function measureLatency(url: string): Promise<number> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    return -1;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const exchangeId = searchParams.get('exchangeId');

  if (exchangeId) {
    const exchange = EXCHANGE_SERVERS.find(e => e.id === exchangeId);
    if (!exchange) {
      return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
    }

    const latency = await measureLatency(exchange.endpoints[0]);
    
    return NextResponse.json({
      exchangeId: exchange.id,
      latency,
      timestamp: Date.now(),
      status: latency === -1 ? 'error' : 'success'
    });
  }

  const results = await Promise.all(
    EXCHANGE_SERVERS.map(async (exchange) => {
      const latency = await measureLatency(exchange.endpoints[0]);
      return {
        exchangeId: exchange.id,
        latency,
        timestamp: Date.now(),
        status: latency === -1 ? 'error' : 'success'
      };
    })
  );

  return NextResponse.json(results);
}
