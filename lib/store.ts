import { create } from 'zustand';
import { FilterState, LatencyData, TimeRange } from './types';
import { CloudProvider } from './data/exchanges';

interface AppState {
  latencyData: Map<string, LatencyData>;
  filters: FilterState;
  selectedExchange: string | null;
  selectedRegion: string | null;
  timeRange: TimeRange;
  isLoading: boolean;
  
  setLatencyData: (data: LatencyData) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setSelectedExchange: (exchangeId: string | null) => void;
  setSelectedRegion: (regionId: string | null) => void;
  setTimeRange: (range: TimeRange) => void;
  setIsLoading: (loading: boolean) => void;
  toggleProvider: (provider: CloudProvider) => void;
  toggleExchange: (exchangeId: string) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  providers: ['AWS', 'GCP', 'Azure'],
  exchanges: [],
  latencyRange: [0, 1000],
  showRealtime: true,
  showHistorical: false,
  showRegions: true,
  showAnalytical: false
};

export const useAppStore = create<AppState>((set) => ({
  latencyData: new Map(),
  filters: defaultFilters,
  selectedExchange: null,
  selectedRegion: null,
  timeRange: '24h',
  isLoading: false,

  setLatencyData: (data) =>
    set((state) => {
      const newMap = new Map(state.latencyData);
      newMap.set(data.exchangeId, data);
      return { latencyData: newMap };
    }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters }
    })),

  setSelectedExchange: (exchangeId) =>
    set({ selectedExchange: exchangeId }),

  setSelectedRegion: (regionId) =>
    set({ selectedRegion: regionId }),

  setTimeRange: (range) =>
    set({ timeRange: range }),

  setIsLoading: (loading) =>
    set({ isLoading: loading }),

  toggleProvider: (provider) =>
    set((state) => {
      const providers = state.filters.providers.includes(provider)
        ? state.filters.providers.filter((p) => p !== provider)
        : [...state.filters.providers, provider];
      return {
        filters: { ...state.filters, providers }
      };
    }),

  toggleExchange: (exchangeId) =>
    set((state) => {
      const exchanges = state.filters.exchanges.includes(exchangeId)
        ? state.filters.exchanges.filter((e) => e !== exchangeId)
        : [...state.filters.exchanges, exchangeId];
      return {
        filters: { ...state.filters, exchanges }
      };
    }),

  resetFilters: () =>
    set({ filters: defaultFilters })
}));
