'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      message: 'Export functionality - to be implemented'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">LT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Latency Topology Visualizer</h1>
              <p className="text-xs text-muted-foreground">Real-time Exchange Monitoring</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">LT Visualizer</h1>
            </div>
          </div>
          <Badge variant="outline" className="ml-2 hidden md:flex">Beta</Badge>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted ? (
              <>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
