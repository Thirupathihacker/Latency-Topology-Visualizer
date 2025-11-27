'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PROVIDER_COLORS } from '@/lib/data/exchanges';
import { Info, X } from 'lucide-react';

export default function Legend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 left-4 lg:hidden bg-background/95 backdrop-blur z-50"
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-4 w-4" />
      </Button>

      <Card className={`
        absolute bottom-4 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
        hidden lg:block lg:left-4
        ${isOpen ? 'max-lg:block' : 'max-lg:hidden'}
        max-lg:fixed max-lg:inset-x-4 max-lg:bottom-20 max-lg:w-auto max-lg:z-50
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Legend</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2">Cloud Providers</p>
            <div className="space-y-1.5">
              {Object.entries(PROVIDER_COLORS).map(([provider, color]) => (
                <div key={provider} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs">{provider}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">Latency Status</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Low (&lt; 100ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs">Medium (100-200ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">High (&gt; 200ms)</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">Markers</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs">Exchange Server</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50" />
                <span className="text-xs">Cloud Region</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
