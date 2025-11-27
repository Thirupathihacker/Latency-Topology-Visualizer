'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { EXCHANGE_SERVERS, CLOUD_REGIONS, PROVIDER_COLORS, getLatencyColor } from '@/lib/data/exchanges';
import { useAppStore } from '@/lib/store';
import { LatencyData } from '@/lib/types';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface MarkerData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  type: 'exchange' | 'region';
  id: string;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
}

export default function LatencyGlobe() {
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { latencyData, filters, selectedExchange, setSelectedExchange } = useAppStore();

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const container = document.querySelector('main');
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: container.clientHeight
          });
        } else {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.pointOfView({ altitude: 2.5 }, 1000);
    }
  }, []);

  const filteredExchanges = useMemo(() => {
    return EXCHANGE_SERVERS.filter(exchange => {
      if (!filters.providers.includes(exchange.cloudProvider)) return false;
      if (filters.exchanges.length > 0 && !filters.exchanges.includes(exchange.id)) return false;
      
      const latency = latencyData.get(exchange.id);
      if (latency && latency.latency !== -1) {
        if (latency.latency < filters.latencyRange[0] || latency.latency > filters.latencyRange[1]) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters, latencyData]);

  const filteredRegions = useMemo(() => {
    if (!filters.showRegions) return [];
    return CLOUD_REGIONS.filter(region => filters.providers.includes(region.provider));
  }, [filters]);

  const markersData: MarkerData[] = useMemo(() => {
    const markers: MarkerData[] = [];

    filteredExchanges.forEach(exchange => {
      const latency = latencyData.get(exchange.id);
      const color = latency && latency.latency !== -1 
        ? getLatencyColor(latency.latency)
        : PROVIDER_COLORS[exchange.cloudProvider];

      markers.push({
        lat: exchange.lat,
        lng: exchange.lng,
        size: 0.8,
        color,
        label: `${exchange.name} - ${exchange.location}${latency ? `\n${latency.latency}ms` : ''}`,
        type: 'exchange',
        id: exchange.id
      });
    });

    if (filters.showRegions) {
      filteredRegions.forEach(region => {
        markers.push({
          lat: region.lat,
          lng: region.lng,
          size: 0.5,
          color: PROVIDER_COLORS[region.provider] + '80',
          label: `${region.name}\n${region.provider}`,
          type: 'region',
          id: region.id
        });
      });
    }

    return markers;
  }, [filteredExchanges, filteredRegions, latencyData, filters.showRegions]);

  const arcsData: ArcData[] = useMemo(() => {
    if (!filters.showRealtime) return [];

    const arcs: ArcData[] = [];
    const userLat = 37.7749;
    const userLng = -122.4194;

    filteredExchanges.forEach(exchange => {
      const latency = latencyData.get(exchange.id);
      if (latency && latency.latency !== -1) {
        arcs.push({
          startLat: userLat,
          startLng: userLng,
          endLat: exchange.lat,
          endLng: exchange.lng,
          color: getLatencyColor(latency.latency),
          label: `${latency.latency}ms`
        });
      }
    });

    return arcs;
  }, [filteredExchanges, latencyData, filters.showRealtime]);

  const handleMarkerClick = (marker: any) => {
    const markerData = marker as MarkerData;
    if (markerData.type === 'exchange') {
      setSelectedExchange(markerData.id === selectedExchange ? null : markerData.id);
      
      if (globeEl.current) {
        globeEl.current.pointOfView(
          {
            lat: markerData.lat,
            lng: markerData.lng,
            altitude: 1.5
          },
          1000
        );
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        pointsData={markersData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={(d: any) => d.size}
        pointLabel="label"
        onPointClick={handleMarkerClick}
        
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        arcsTransitionDuration={0}
        
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
