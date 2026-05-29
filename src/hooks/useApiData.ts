import { useQuery, useQueries } from '@tanstack/react-query';
import {
  getMidstreamData,
  getDownstreamData,
  getCotPositions,
  getMacroData,
  getCrackSpreads,
  getRefineryUtilization,
  getProductDemand,
  getUsCrudeProduction,
  getUsRigCount,
  getUsProductionByRegion,
  getUsApiGravity,
  getUsCrudeImports,
  getUsNaturalGas,
  getUsReserves,
  getMarketNews,
  getCompanyNews,
  getOilQuotes,
  getEconomicCalendar,
  getWpsrTable,
} from '../lib/api';

const HOUR_MS = 60 * 60 * 1000;

export const useMidstreamData = () =>
  useQuery({
    queryKey: ['midstream'],
    queryFn: getMidstreamData,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useDownstreamData = () =>
  useQuery({
    queryKey: ['downstream'],
    queryFn: getDownstreamData,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useCotPositions = () =>
  useQuery({
    queryKey: ['cot'],
    queryFn: getCotPositions,
    staleTime: 60_000,
  });

export const useMacroData = () =>
  useQuery({
    queryKey: ['macro'],
    queryFn: getMacroData,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

const MIN5_MS = 5 * 60 * 1000;

export const useCrackSpreads = () =>
  useQuery({
    queryKey: ['crack-spreads'],
    queryFn: getCrackSpreads,
    staleTime: MIN5_MS,
    refetchInterval: MIN5_MS,
  });

export const useRefineryUtilization = () =>
  useQuery({
    queryKey: ['refinery-utilization'],
    queryFn: getRefineryUtilization,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useProductDemand = () =>
  useQuery({
    queryKey: ['product-demand'],
    queryFn: getProductDemand,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

const DAY_MS  = 86400 * 1000;
const WEEK_MS = 7 * DAY_MS;

// ── Upstream — US subtab ──────────────────────────────────────────────────────

export const useUsCrudeProduction = () =>
  useQuery({
    queryKey: ['us-crude-production'],
    queryFn: getUsCrudeProduction,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useUsRigCount = () =>
  useQuery({
    queryKey: ['us-rig-count'],
    queryFn: getUsRigCount,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useUsProductionByRegion = () =>
  useQuery({
    queryKey: ['us-production-by-region'],
    queryFn: getUsProductionByRegion,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useUsApiGravity = () =>
  useQuery({
    queryKey: ['us-api-gravity'],
    queryFn: getUsApiGravity,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

export const useUsCrudeImports = () =>
  useQuery({
    queryKey: ['us-crude-imports'],
    queryFn: getUsCrudeImports,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useUsNaturalGas = () =>
  useQuery({
    queryKey: ['us-natural-gas'],
    queryFn: getUsNaturalGas,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useUsReserves = () =>
  useQuery({
    queryKey: ['us-reserves'],
    queryFn: getUsReserves,
    staleTime: WEEK_MS,
    refetchInterval: WEEK_MS,
  });

const MIN1_MS = 60_000;
const SEC30_MS = 30_000;

export const useMarketNews = (category = 'general') =>
  useQuery({
    queryKey: ['market-news', category],
    queryFn: () => getMarketNews(category),
    staleTime: MIN1_MS,
    refetchInterval: MIN1_MS,
  });

export const useCompanyNews = (symbol: string) =>
  useQuery({
    queryKey: ['company-news', symbol],
    queryFn: () => getCompanyNews(symbol),
    staleTime: MIN1_MS,
    refetchInterval: MIN1_MS,
    enabled: !!symbol,
  });

export const useOilQuotes = () =>
  useQuery({
    queryKey: ['oil-quotes'],
    queryFn: getOilQuotes,
    staleTime: SEC30_MS,
    refetchInterval: SEC30_MS,
  });

export const useEconomicCalendar = () =>
  useQuery({
    queryKey: ['economic-calendar'],
    queryFn: getEconomicCalendar,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

const WPSR_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const useWpsrTables = () =>
  useQueries({
    queries: WPSR_TABLES.map(n => ({
      queryKey: ['wpsr', n],
      queryFn: () => getWpsrTable(n),
      staleTime: HOUR_MS,
    })),
  });
