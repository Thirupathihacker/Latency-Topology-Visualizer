'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, WifiOff, Clock, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function PerformanceMetrics() {
  const { latencyData } = useAppStore();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (latencyData.size > 0) {
      setLastUpdate(new Date());
      setIsConnected(true);
    }
  }, [latencyData]);

  useEffect(() => {
    if (!lastUpdate) return;
    
    const checkConnection = setInterval(() => {
      const timeSinceUpdate = Date.now() - lastUpdate.getTime();
      setIsConnected(timeSinceUpdate < 15000);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, [lastUpdate]);

  const successCount = Array.from(latencyData.values()).filter(
    d => d.status === 'success' && d.latency !== -1
  ).length;

  const errorCount = Array.from(latencyData.values()).filter(
    d => d.status === 'error' || d.latency === -1
  ).length;

  const uptime = ((successCount / (successCount + errorCount)) * 100).toFixed(1);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 lg:hidden bg-background/95 backdrop-blur z-50"
        onClick={() => setIsOpen(true)}
      >
        <Activity className="h-4 w-4" />
      </Button>

      <Card className={`
        absolute top-4 right-4 w-72 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
        hidden lg:block
        ${isOpen ? 'max-lg:block' : 'max-lg:hidden'}
        max-lg:fixed max-lg:inset-x-4 max-lg:top-20 max-lg:w-auto max-lg:z-50
      `}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 lg:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Success Rate</p>
              <p className="text-lg font-bold text-green-500">{uptime}%</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Active Nodes</p>
              <p className="text-lg font-bold">{successCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Failed Nodes</p>
              <p className="text-lg font-bold text-red-500">{errorCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Update
              </p>
              <p className="text-xs font-semibold">
                {mounted && lastUpdate
                  ? lastUpdate.toLocaleTimeString()
                  : '--:--:--'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next refresh in</span>
              <Badge variant="outline" className="text-xs">~8s</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
