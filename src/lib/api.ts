import { API_BASE_URL } from './config';
import type {
  MidstreamResponse,
  DownstreamResponse,
  WPSRTable,
  COTResponse,
  MacroResponse,
  CrackSpreadsResponse,
  RefineryUtilizationResponse,
  ProductDemandResponse,
  CrudeProductionResponse,
  RigCountResponse,
  ProductionByRegionResponse,
  ApiGravityResponse,
  CrudeImportsResponse,
  NaturalGasResponse,
  ReservesResponse,
  MarketNewsResponse,
  CompanyNewsResponse,
  OilQuotesResponse,
  EconomicCalendarResponse,
  AiSummaryRequest,
  AiSummaryResponse,
} from '../types/api';
import { ApiError } from '../types/api';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, path);
  }
  return res.json() as Promise<T>;
}

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

// ── Upstream — US subtab (7 endpoints) ────────────────────────────────────────

export const getUsCrudeProduction = (): Promise<CrudeProductionResponse> =>
  apiFetch('/api/upstream/us/crude-production');

export const getUsRigCount = (): Promise<RigCountResponse> =>
  apiFetch('/api/upstream/us/rig-count');

export const getUsProductionByRegion = (): Promise<ProductionByRegionResponse> =>
  apiFetch('/api/upstream/us/production-by-region');

export const getUsApiGravity = (): Promise<ApiGravityResponse> =>
  apiFetch('/api/upstream/us/api-gravity');

export const getUsCrudeImports = (): Promise<CrudeImportsResponse> =>
  apiFetch('/api/upstream/us/crude-imports');

export const getUsNaturalGas = (): Promise<NaturalGasResponse> =>
  apiFetch('/api/upstream/us/natural-gas');

export const getUsReserves = (): Promise<ReservesResponse> =>
  apiFetch('/api/upstream/us/reserves');

export const getMarketNews = (category = 'general'): Promise<MarketNewsResponse> =>
  apiFetch(`/api/news/market?category=${encodeURIComponent(category)}`);

export const getCompanyNews = (symbol: string): Promise<CompanyNewsResponse> =>
  apiFetch(`/api/news/company?symbol=${encodeURIComponent(symbol)}`);

export const getOilQuotes = (): Promise<OilQuotesResponse> =>
  apiFetch('/api/news/quotes');

export const getEconomicCalendar = (): Promise<EconomicCalendarResponse> =>
  apiFetch('/api/news/calendar');

export const postAiSummary = (prompt?: string, provider = 'gemini'): Promise<AiSummaryResponse> => {
  const body: AiSummaryRequest = { provider, ...(prompt !== undefined ? { prompt } : {}) };
  return fetch(`${API_BASE_URL}/api/news/ai-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(res => {
    if (!res.ok) throw new ApiError(res.status, '/api/news/ai-summary');
    return res.json() as Promise<AiSummaryResponse>;
  });
};
