import { useQuery } from '@tanstack/react-query';
import {
  getUpstreamData,
  getMidstreamData,
  getDownstreamData,
  getCotPositions,
  getMacroData,
  getCrackSpreads,
  getRefineryUtilization,
  getProductDemand,
  getUsProduction,
  getDucWells,
  getCrudeImports,
  getMarketNews,
  getCompanyNews,
  getOilQuotes,
  getEconomicCalendar,
} from '../lib/api';

const HOUR_MS = 60 * 60 * 1000;

export const useUpstreamData = () =>
  useQuery({
    queryKey: ['upstream'],
    queryFn: getUpstreamData,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });

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

const DAY_MS = 86400 * 1000;

export const useUsProduction = () =>
  useQuery({
    queryKey: ['us-production'],
    queryFn: getUsProduction,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

export const useDucWells = () =>
  useQuery({
    queryKey: ['duc-wells'],
    queryFn: getDucWells,
    staleTime: DAY_MS,
    refetchInterval: DAY_MS,
  });

export const useCrudeImports = () =>
  useQuery({
    queryKey: ['crude-imports'],
    queryFn: getCrudeImports,
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
