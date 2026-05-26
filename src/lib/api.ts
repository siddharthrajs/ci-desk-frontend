import { API_BASE_URL } from './config';
import type {
  UpstreamResponse,
  MidstreamResponse,
  DownstreamResponse,
  WPSRResponse,
  COTResponse,
  MacroResponse,
  CrackSpreadsResponse,
  RefineryUtilizationResponse,
  ProductDemandResponse,
  UsProductionResponse,
  DucWellsResponse,
  CrudeImportsResponse,
} from '../types/api';
import { ApiError } from '../types/api';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, path);
  }
  return res.json() as Promise<T>;
}

export const getUpstreamData = (): Promise<UpstreamResponse> =>
  apiFetch('/api/upstream');

export const getMidstreamData = (): Promise<MidstreamResponse> =>
  apiFetch('/api/midstream');

export const getDownstreamData = (): Promise<DownstreamResponse> =>
  apiFetch('/api/downstream');

export const getWpsrTables = (): Promise<WPSRResponse> =>
  apiFetch('/api/reports/wpsr');

export const getCotPositions = (): Promise<COTResponse> =>
  apiFetch('/api/reports/cot');

export const getMacroData = (): Promise<MacroResponse> =>
  apiFetch('/api/macro');

export const getCrackSpreads = (): Promise<CrackSpreadsResponse> =>
  apiFetch('/api/downstream/crack-spreads');

export const getRefineryUtilization = (): Promise<RefineryUtilizationResponse> =>
  apiFetch('/api/downstream/refinery-utilization');

export const getProductDemand = (): Promise<ProductDemandResponse> =>
  apiFetch('/api/downstream/product-demand');

export const getUsProduction = (): Promise<UsProductionResponse> =>
  apiFetch('/api/upstream/us-production');

export const getDucWells = (): Promise<DucWellsResponse> =>
  apiFetch('/api/upstream/duc-wells');

export const getCrudeImports = (): Promise<CrudeImportsResponse> =>
  apiFetch('/api/upstream/crude-imports');
