import { useQuery, useQueries } from '@tanstack/react-query';
import type { OpecBasis } from '../types/api';
import type { GetMarketsParams } from '../types/polymarket';
import {
  getMidstreamData,
  getMidstreamStocks,
  getMidstreamRefinery,
  getMidstreamExports,
  getMidstreamImports,
  getMidstreamPaddMovements,
  getDownstreamData,
  getCotPositions,
  getMacroData,
  getMacroBrief,
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
  getOpecProduction,
  getOpecHistory,
  getOpecOverview,
  getOpecDisruptions,
  getOpecCompliance,
  getOpecCrossCheck,
  getMarketNews,
  getCompanyNews,
  getOilQuotes,
  getEconomicCalendar,
  getWpsrTable,
  getGeopoliticsEvents,
  getMarkets,
} from '../lib/api';

const HOUR_MS = 60 * 60 * 1000;

export const useMidstreamData = () =>
  useQuery({
    queryKey: ['midstream'],
    queryFn: getMidstreamData,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

// ── Midstream sub-endpoint hooks ──────────────────────────────────────────────

export const useMidstreamStocks = () =>
  useQuery({
    queryKey: ['midstream-stocks'],
    queryFn: getMidstreamStocks,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useMidstreamRefinery = () =>
  useQuery({
    queryKey: ['midstream-refinery'],
    queryFn: getMidstreamRefinery,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useMidstreamExports = () =>
  useQuery({
    queryKey: ['midstream-exports'],
    queryFn: getMidstreamExports,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

export const useMidstreamImports = () =>
  useQuery({
    queryKey: ['midstream-imports'],
    queryFn: getMidstreamImports,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useMidstreamPaddMovements = () =>
  useQuery({
    queryKey: ['midstream-padd-movements'],
    queryFn: getMidstreamPaddMovements,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
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

// ── Upstream — OPEC+ subtab ────────────────────────────────────────────────────

export const useOpecProduction = (basis: OpecBasis = 'crude') =>
  useQuery({
    queryKey: ['opec-production', basis],
    queryFn: () => getOpecProduction(basis),
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useOpecHistory = (basis: OpecBasis = 'crude') =>
  useQuery({
    queryKey: ['opec-history', basis],
    queryFn: () => getOpecHistory(basis),
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

export const useOpecOverview = () =>
  useQuery({
    queryKey: ['opec-overview'],
    queryFn: getOpecOverview,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useOpecDisruptions = () =>
  useQuery({
    queryKey: ['opec-disruptions'],
    queryFn: getOpecDisruptions,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useOpecCompliance = () =>
  useQuery({
    queryKey: ['opec-compliance'],
    queryFn: getOpecCompliance,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
  });

export const useOpecCrossCheck = () =>
  useQuery({
    queryKey: ['opec-cross-check'],
    queryFn: getOpecCrossCheck,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
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

export const useMacroBrief = () =>
  useQuery({
    queryKey: ['macro-brief'],
    queryFn: getMacroBrief,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

// ── Prediction Markets — Polymarket ──────────────────────────────────────────

export const useGeopoliticsEvents = (offset = 0, limit = 20) =>
  useQuery({
    queryKey: ['polymarket', 'geopolitics', offset, limit],
    queryFn: () => getGeopoliticsEvents(offset, limit),
    staleTime: MIN1_MS,
    refetchInterval: MIN1_MS,
  });

export const useMarkets = (params: GetMarketsParams) =>
  useQuery({
    queryKey: ['polymarket', 'markets', params],
    queryFn: () => getMarkets(params),
    staleTime: MIN1_MS,
    refetchInterval: MIN1_MS,
  });
