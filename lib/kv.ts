export async function storeLatencyData(exchangeId: string, latency: number, timestamp: number) {
  try {
    if (typeof window !== 'undefined') {
      return;
    }

    const response = await fetch('/api/historical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeId, latency, timestamp })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to store latency data:', error);
    return false;
  }
}

export async function getHistoricalData(exchangeId: string, timeRange: string) {
  try {
    const response = await fetch(`/api/historical?exchangeId=${exchangeId}&timeRange=${timeRange}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return null;
  }
}
