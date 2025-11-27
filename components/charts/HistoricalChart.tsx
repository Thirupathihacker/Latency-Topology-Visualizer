'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAppStore } from '@/lib/store';
import { EXCHANGE_SERVERS } from '@/lib/data/exchanges';
import { TimeRange, HistoricalLatency } from '@/lib/types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function HistoricalChart() {
  const { selectedExchange, timeRange, setTimeRange } = useAppStore();
  const [historicalData, setHistoricalData] = useState<HistoricalLatency | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedExchange) {
      setHistoricalData(null);
      return;
    }

    const fetchHistorical = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/historical?exchangeId=${selectedExchange}&timeRange=${timeRange}`);
        const data = await response.json();
        setHistoricalData(data);
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorical();
  }, [selectedExchange, timeRange]);

  if (!selectedExchange) {
    return (
      <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select an exchange to view historical latency data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const exchange = EXCHANGE_SERVERS.find(e => e.id === selectedExchange);

  const formatXAxis = (timestamp: number) => {
    if (timeRange === '1h') return format(timestamp, 'HH:mm');
    if (timeRange === '24h') return format(timestamp, 'HH:mm');
    return format(timestamp, 'MM/dd');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">{format(payload[0].payload.timestamp, 'PPpp')}</p>
          <p className="text-sm text-muted-foreground">
            Latency: <span className="font-semibold text-foreground">{payload[0].value}ms</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-lg">{exchange?.name} - Historical Latency</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{exchange?.location}</p>
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="1h">1H</TabsTrigger>
              <TabsTrigger value="24h">24H</TabsTrigger>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : historicalData ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Average</p>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{historicalData.stats.avg}ms</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Minimum</p>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{historicalData.stats.min}ms</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Maximum</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold">{historicalData.stats.max}ms</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData.data}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  className="text-xs"
                />
                <YAxis
                  label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorLatency)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
