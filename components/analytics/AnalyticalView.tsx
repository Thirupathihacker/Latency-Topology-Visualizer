'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { EXCHANGE_SERVERS, PROVIDER_COLORS, getLatencyColor } from '@/lib/data/exchanges';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Server,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function AnalyticalView() {
  const { latencyData, filters } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate comprehensive statistics
  const analytics = useMemo(() => {
    const latencies = Array.from(latencyData.values())
      .filter(d => d.status === 'success' && d.latency !== -1)
      .map(d => d.latency);

    if (latencies.length === 0) {
      return null;
    }

    // Basic stats
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const sorted = [...latencies].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    // Variance and standard deviation
    const variance = latencies.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / latencies.length;
    const stdDev = Math.sqrt(variance);

    // Provider analysis
    const providerStats = EXCHANGE_SERVERS.reduce((acc, exchange) => {
      const data = latencyData.get(exchange.id);
      if (data && data.latency !== -1) {
        if (!acc[exchange.cloudProvider]) {
          acc[exchange.cloudProvider] = [];
        }
        acc[exchange.cloudProvider].push(data.latency);
      }
      return acc;
    }, {} as Record<string, number[]>);

    const providerAverages = Object.entries(providerStats).map(([provider, values]) => ({
      provider,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }));

    // Exchange analysis
    const exchangeStats = EXCHANGE_SERVERS.map(exchange => {
      const data = latencyData.get(exchange.id);
      if (data && data.latency !== -1) {
        return {
          id: exchange.id,
          name: exchange.name,
          location: exchange.location,
          provider: exchange.cloudProvider,
          latency: data.latency,
          status: data.status
        };
      }
      return null;
    }).filter(Boolean);

    // Latency distribution buckets
    const distribution = {
      excellent: latencies.filter(l => l < 50).length,
      good: latencies.filter(l => l >= 50 && l < 100).length,
      moderate: latencies.filter(l => l >= 100 && l < 200).length,
      poor: latencies.filter(l => l >= 200).length
    };

    // Geographic analysis
    const regionStats = EXCHANGE_SERVERS.reduce((acc, exchange) => {
      const data = latencyData.get(exchange.id);
      if (data && data.latency !== -1) {
        const region = exchange.location.split(',')[1]?.trim() || exchange.location;
        if (!acc[region]) {
          acc[region] = { latencies: [], count: 0 };
        }
        acc[region].latencies.push(data.latency);
        acc[region].count++;
      }
      return acc;
    }, {} as Record<string, { latencies: number[]; count: number }>);

    const regionAverages = Object.entries(regionStats).map(([region, data]) => ({
      region,
      avg: Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length),
      count: data.count
    })).sort((a, b) => a.avg - b.avg);

    return {
      overall: {
        avg: Math.round(avg),
        min,
        max,
        median: Math.round(median),
        p25,
        p75,
        p95,
        stdDev: Math.round(stdDev),
        variance: Math.round(variance),
        count: latencies.length
      },
      providerAverages,
      exchangeStats: exchangeStats.sort((a, b) => a!.latency - b!.latency),
      distribution,
      regionAverages
    };
  }, [latencyData]);

  if (!analytics) {
    return (
      <Card className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No data available for analysis</p>
            <p className="text-xs mt-1">Wait for latency data to be collected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart data preparation
  const providerChartData = analytics.providerAverages.map(p => ({
    name: p.provider,
    average: p.avg,
    min: p.min,
    max: p.max,
    count: p.count
  }));

  const exchangeChartData = analytics.exchangeStats.slice(0, 10).map(e => ({
    name: e!.name.length > 10 ? e!.name.substring(0, 10) + '...' : e!.name,
    fullName: e!.name,
    latency: e!.latency,
    provider: e!.provider
  }));

  const distributionData = [
    { name: 'Excellent (<50ms)', value: analytics.distribution.excellent, color: '#10b981' },
    { name: 'Good (50-100ms)', value: analytics.distribution.good, color: '#3b82f6' },
    { name: 'Moderate (100-200ms)', value: analytics.distribution.moderate, color: '#f59e0b' },
    { name: 'Poor (>200ms)', value: analytics.distribution.poor, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const regionChartData = analytics.regionAverages.slice(0, 8).map(r => ({
    name: r.region,
    average: r.avg,
    count: r.count
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>{' '}
              <span className="font-semibold">{entry.value}ms</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Average Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overall.avg}ms</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ±{analytics.overall.stdDev}ms std dev
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  Median (P50)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overall.median}ms</div>
                <p className="text-xs text-muted-foreground mt-1">
                  P25: {analytics.overall.p25}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  P95 Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overall.p95}ms</div>
                <p className="text-xs text-muted-foreground mt-1">
                  P75: {analytics.overall.p75}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overall.variance}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overall.count} samples
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Latency Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Latency Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Top 10 Exchanges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={exchangeChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="latency" radius={[0, 4, 4, 0]}>
                      {exchangeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getLatencyColor(entry.latency)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cloud Provider Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.providerAverages.map((provider, index) => (
                  <div key={provider.provider} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: PROVIDER_COLORS[provider.provider as keyof typeof PROVIDER_COLORS] }}
                        />
                        <span className="font-medium">{provider.provider}</span>
                        <Badge variant="outline" className="ml-2">
                          {provider.count} exchanges
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Avg:</span>
                        <span className="font-bold">{provider.avg}ms</span>
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{provider.min}ms - {provider.max}ms</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(provider.avg / analytics.overall.max) * 100}%`,
                          backgroundColor: PROVIDER_COLORS[provider.provider as keyof typeof PROVIDER_COLORS]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={providerChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchanges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Exchange Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {analytics.exchangeStats.map((exchange, index) => (
                  <div
                    key={exchange!.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{exchange!.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{exchange!.location}</p>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: PROVIDER_COLORS[exchange!.provider as keyof typeof PROVIDER_COLORS]
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{exchange!.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        style={{
                          backgroundColor: getLatencyColor(exchange!.latency),
                          color: 'white'
                        }}
                        className="font-bold"
                      >
                        {exchange!.latency}ms
                      </Badge>
                      {exchange!.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exchangeChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                    {exchangeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getLatencyColor(entry.latency)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Geographic Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {analytics.regionAverages.map((region, index) => (
                  <div
                    key={region.region}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{region.region}</p>
                        <p className="text-xs text-muted-foreground">
                          {region.count} exchange{region.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: getLatencyColor(region.avg),
                        color: 'white'
                      }}
                      className="font-bold"
                    >
                      {region.avg}ms avg
                    </Badge>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                    {regionChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getLatencyColor(entry.average)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



