'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { EXCHANGE_SERVERS, getLatencyColor } from '@/lib/data/exchanges';
import { Activity, Zap, AlertCircle, Globe } from 'lucide-react';
import { useMemo } from 'react';

export default function StatsPanel() {
  const { latencyData, filters } = useAppStore();

  const stats = useMemo(() => {
    const latencies = Array.from(latencyData.values())
      .filter(d => d.status === 'success' && d.latency !== -1)
      .map(d => d.latency);

    if (latencies.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        active: 0,
        total: EXCHANGE_SERVERS.length
      };
    }

    return {
      avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      active: latencies.length,
      total: EXCHANGE_SERVERS.length
    };
  }, [latencyData]);

  const topExchanges = useMemo(() => {
    return Array.from(latencyData.entries())
      .filter(([_, data]) => data.status === 'success' && data.latency !== -1)
      .sort((a, b) => a[1].latency - b[1].latency)
      .slice(0, 5)
      .map(([id, data]) => {
        const exchange = EXCHANGE_SERVERS.find(e => e.id === id);
        return { exchange, latency: data.latency };
      })
      .filter(item => item.exchange);
  }, [latencyData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Average Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.active} exchanges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              Best Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.min}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lowest recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Worst Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.max}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              Active Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}/{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently monitored
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top 5 Fastest Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topExchanges.length > 0 ? (
              topExchanges.map(({ exchange, latency }, index) => (
                <div key={exchange!.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{exchange!.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{exchange!.location}</p>
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: getLatencyColor(latency),
                      color: 'white'
                    }}
                  >
                    {latency}ms
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
