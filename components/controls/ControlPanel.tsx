'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/lib/store';
import { EXCHANGE_SERVERS, PROVIDER_COLORS } from '@/lib/data/exchanges';
import { CloudProvider } from '@/lib/data/exchanges';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function ControlPanel() {
  const { filters, setFilters, toggleProvider, resetFilters, latencyData } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExchanges = EXCHANGE_SERVERS.filter(exchange =>
    exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exchange.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLatencyRangeChange = (value: number[]) => {
    setFilters({ latencyRange: [value[0], value[1]] });
  };

  return (
    <Card className="w-80 h-full overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Controls</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Exchanges
          </Label>
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Cloud Providers
          </Label>
          <div className="space-y-2">
            {(['AWS', 'GCP', 'Azure'] as CloudProvider[]).map((provider) => (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROVIDER_COLORS[provider] }}
                  />
                  <Label htmlFor={`provider-${provider}`} className="cursor-pointer">
                    {provider}
                  </Label>
                </div>
                <Switch
                  id={`provider-${provider}`}
                  checked={filters.providers.includes(provider)}
                  onCheckedChange={() => toggleProvider(provider)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Visualization Layers</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="realtime" className="cursor-pointer">Real-time Connections</Label>
              <Switch
                id="realtime"
                checked={filters.showRealtime}
                onCheckedChange={(checked) => setFilters({ showRealtime: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="regions" className="cursor-pointer">Cloud Regions</Label>
              <Switch
                id="regions"
                checked={filters.showRegions}
                onCheckedChange={(checked) => setFilters({ showRegions: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="historical" className="cursor-pointer">Historical View</Label>
              <Switch
                id="historical"
                checked={filters.showHistorical}
                onCheckedChange={(checked) => {
                  setFilters({ 
                    showHistorical: checked,
                    showAnalytical: checked ? false : filters.showAnalytical
                  });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytical" className="cursor-pointer">Analytical View</Label>
              <Switch
                id="analytical"
                checked={filters.showAnalytical}
                onCheckedChange={(checked) => {
                  setFilters({ 
                    showAnalytical: checked,
                    showHistorical: checked ? false : filters.showHistorical
                  });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Latency Range: {filters.latencyRange[0]}ms - {filters.latencyRange[1]}ms
          </Label>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={filters.latencyRange}
            onValueChange={handleLatencyRangeChange}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Active Exchanges</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filteredExchanges.map((exchange) => {
              const latency = latencyData.get(exchange.id);
              return (
                <div
                  key={exchange.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PROVIDER_COLORS[exchange.cloudProvider] }}
                    />
                    <span className="text-sm truncate">{exchange.name}</span>
                  </div>
                  {latency && latency.latency !== -1 && (
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {latency.latency}ms
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Exchanges:</span>
              <span className="font-semibold">{EXCHANGE_SERVERS.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Visible:</span>
              <span className="font-semibold">{filteredExchanges.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Connections:</span>
              <span className="font-semibold">{latencyData.size}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
