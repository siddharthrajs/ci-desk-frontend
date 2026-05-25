import { useQuery } from '@tanstack/react-query';
import {
  getUpstreamData,
  getMidstreamData,
  getDownstreamData,
  getWpsrTables,
  getCotPositions,
  getMacroData,
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

export const useWpsrTables = () =>
  useQuery({
    queryKey: ['wpsr'],
    queryFn: getWpsrTables,
    staleTime: 60_000,
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
