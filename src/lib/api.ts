import { API_BASE_URL } from './config';
import type {
  UpstreamResponse,
  MidstreamResponse,
  DownstreamResponse,
  WPSRTable,
  COTResponse,
  MacroResponse,
  CrackSpreadsResponse,
  RefineryUtilizationResponse,
  ProductDemandResponse,
  UsProductionResponse,
  DucWellsResponse,
  CrudeImportsResponse,
  MarketNewsResponse,
  CompanyNewsResponse,
  OilQuotesResponse,
  EconomicCalendarResponse,
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

/** Per-table fetch. Lets the frontend fire 9 independent requests in parallel
 *  so each table renders the moment its single CSV lands, rather than waiting
 *  on the slowest of all 9. */
export const getWpsrTable = (tableNumber: number): Promise<WPSRTable> =>
  apiFetch(`/api/reports/wpsr/${tableNumber}`);

/** Same shape as getWpsrTable, but tells the backend to bypass its cache. */
export const refreshWpsrTable = (tableNumber: number): Promise<WPSRTable> =>
  apiFetch(`/api/reports/wpsr/${tableNumber}?refresh=true`);

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

export const getMarketNews = (category = 'general'): Promise<MarketNewsResponse> =>
  apiFetch(`/api/news/market?category=${encodeURIComponent(category)}`);

export const getCompanyNews = (symbol: string): Promise<CompanyNewsResponse> =>
  apiFetch(`/api/news/company?symbol=${encodeURIComponent(symbol)}`);

export const getOilQuotes = (): Promise<OilQuotesResponse> =>
  apiFetch('/api/news/quotes');

export const getEconomicCalendar = (): Promise<EconomicCalendarResponse> =>
  apiFetch('/api/news/calendar');
