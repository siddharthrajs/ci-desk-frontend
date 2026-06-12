import { API_BASE_URL } from './config';
import type {
  MarketsResponse,
  MarketResponse,
  EventsResponse,
  GetMarketsParams,
} from '../types/polymarket';
import type {
  MidstreamResponse,
  MidstreamStocksResponse,
  CrudeExportsResponse,
  MidstreamImportsResponse,
  PaddMovementsResponse,
  RefineryUtilizationHistory,
  DownstreamResponse,
  WPSRTable,
  COTResponse,
  MacroResponse,
  MorningBriefResponse,
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
  OpecBasis,
  OpecProductionResponse,
  OpecHistoryResponse,
  OpecOverviewResponse,
  OpecDisruptionsResponse,
  OpecComplianceResponse,
  OpecCrossCheckResponse,
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

// ── Midstream — sub-endpoints ─────────────────────────────────────────────────

export const getMidstreamStocks = (): Promise<MidstreamStocksResponse> =>
  apiFetch('/api/midstream/stocks');

export const getMidstreamRefinery = (): Promise<RefineryUtilizationHistory> =>
  apiFetch('/api/midstream/refinery');

export const getMidstreamExports = (): Promise<CrudeExportsResponse> =>
  apiFetch('/api/midstream/exports');

export const getMidstreamImports = (): Promise<MidstreamImportsResponse> =>
  apiFetch('/api/midstream/imports');

export const getMidstreamPaddMovements = (): Promise<PaddMovementsResponse> =>
  apiFetch('/api/midstream/padd-movements');

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

export const refreshCotPositions = (): Promise<COTResponse> =>
  apiFetch('/api/reports/cot?refresh=true');

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

// ── Upstream — OPEC+ subtab ───────────────────────────────────────────────────

export const getOpecProduction = (basis: OpecBasis = 'crude'): Promise<OpecProductionResponse> =>
  apiFetch(`/api/upstream/opec/production?basis=${basis}`);

export const getOpecHistory = (basis: OpecBasis = 'crude'): Promise<OpecHistoryResponse> =>
  apiFetch(`/api/upstream/opec/history?basis=${basis}`);

export const getOpecOverview = (): Promise<OpecOverviewResponse> =>
  apiFetch('/api/upstream/opec/overview');

export const getOpecDisruptions = (): Promise<OpecDisruptionsResponse> =>
  apiFetch('/api/upstream/opec/disruptions');

export const getOpecCompliance = (): Promise<OpecComplianceResponse> =>
  apiFetch('/api/upstream/opec/compliance');

export const getOpecCrossCheck = (): Promise<OpecCrossCheckResponse> =>
  apiFetch('/api/upstream/opec/cross-check');

export const getMarketNews = (category = 'general'): Promise<MarketNewsResponse> =>
  apiFetch(`/api/news/market?category=${encodeURIComponent(category)}`);

export const getCompanyNews = (symbol: string): Promise<CompanyNewsResponse> =>
  apiFetch(`/api/news/company?symbol=${encodeURIComponent(symbol)}`);

export const getOilQuotes = (): Promise<OilQuotesResponse> =>
  apiFetch('/api/news/quotes');

export const getEconomicCalendar = (): Promise<EconomicCalendarResponse> =>
  apiFetch('/api/news/calendar');

export const getMacroBrief = (): Promise<MorningBriefResponse> =>
  apiFetch('/api/macro/brief');

export const postMacroBriefRefresh = (): Promise<MorningBriefResponse> =>
  fetch(`${API_BASE_URL}/api/macro/brief/refresh`, { method: 'POST' }).then(res => {
    if (!res.ok) throw new ApiError(res.status, '/api/macro/brief/refresh');
    return res.json() as Promise<MorningBriefResponse>;
  });

// ── Prediction Markets — Polymarket ──────────────────────────────────────────

export const getGeopoliticsEvents = (offset = 0, limit = 20): Promise<EventsResponse> =>
  apiFetch(`/api/prediction-markets/polymarket/geopolitics?limit=${limit}&offset=${offset}`);

export const getMarkets = (params: GetMarketsParams = {}): Promise<MarketsResponse> => {
  const sp = new URLSearchParams();
  if (params.limit !== undefined) sp.set('limit', String(params.limit));
  if (params.offset !== undefined) sp.set('offset', String(params.offset));
  if (params.active !== undefined) sp.set('active', String(params.active));
  if (params.closed !== undefined) sp.set('closed', String(params.closed));
  if (params.tagSlug) sp.set('tag_slug', params.tagSlug);
  if (params.order) sp.set('order', params.order);
  if (params.ascending !== undefined) sp.set('ascending', String(params.ascending));
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  return apiFetch(`/api/prediction-markets/polymarket/markets${qs ? `?${qs}` : ''}`);
};

export const getMarketDetail = (conditionId: string): Promise<MarketResponse> =>
  apiFetch(`/api/prediction-markets/polymarket/markets/${encodeURIComponent(conditionId)}`);

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
