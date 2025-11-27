'use client';

import { useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from './layout/Header';
import ControlPanel from './controls/ControlPanel';
import StatsPanel from './stats/StatsPanel';
import HistoricalChart from './charts/HistoricalChart';
import AnalyticalView from './analytics/AnalyticalView';
import Legend from './globe/Legend';
import PerformanceMetrics from './stats/PerformanceMetrics';
import { useAppStore } from '@/lib/store';
import { LatencyData } from '@/lib/types';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown, Settings, X } from 'lucide-react';

const LatencyGlobe = dynamic(() => import('./globe/LatencyGlobe'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading 3D Globe...</p>
      </div>
    </div>
  )
});

export default function MainApp() {
  const { setLatencyData, filters } = useAppStore();
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const fetchLatencyData = useCallback(async () => {
    try {
      const response = await fetch('/api/latency/mock');
      const data: LatencyData[] = await response.json();
      data.forEach(item => setLatencyData(item));
    } catch (error) {
      console.error('Failed to fetch latency data:', error);
    }
  }, [setLatencyData]);

  useEffect(() => {
    fetchLatencyData();
    const interval = setInterval(fetchLatencyData, 8000);
    return () => clearInterval(interval);
  }, [fetchLatencyData]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
          <ControlPanel />
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <LatencyGlobe />
          </div>
          <Legend />
          <PerformanceMetrics />
        </main>
      </div>

      <div className={`border-t bg-background transition-all duration-300 ${isBottomExpanded ? (filters.showAnalytical ? 'h-[600px]' : 'h-96') : 'h-16'}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-sm font-semibold">
              {filters.showAnalytical
                ? 'Analytical View'
                : filters.showHistorical
                ? 'Historical Data'
                : 'Statistics Dashboard'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBottomExpanded(!isBottomExpanded)}
            >
              {isBottomExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Expand
                </>
              )}
            </Button>
          </div>
          
          {isBottomExpanded && (
            <div className="flex-1 overflow-auto px-4 py-4">
              {filters.showAnalytical ? (
                <AnalyticalView />
              ) : filters.showHistorical ? (
                <HistoricalChart />
              ) : (
                <StatsPanel />
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        variant="default"
        size="icon"
        className="lg:hidden fixed bottom-20 right-4 z-50 shadow-lg"
        onClick={() => setIsControlsOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {isControlsOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsControlsOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[80vh] animate-in slide-in-from-bottom">
            <div className="bg-background rounded-t-2xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Controls</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsControlsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
                <ControlPanel />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
