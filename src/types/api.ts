// ── Shared primitives ────────────────────────────────────────────────────────

export interface SeriesPoint {
  period: string;
  value: number;
  wow_change: number | null;
  wow_pct_change: number | null;
}

export interface FredObservation {
  date: string;
  value: number;
}

export interface FredSeries {
  series_id: string;
  latest_value: number | null;
  latest_date: string | null;
  observations: FredObservation[];
}

// ── Upstream — US subtab ─────────────────────────────────────────────────────
// One interface per /api/upstream/us/* endpoint. Shapes mirror the FastAPI
// response models in ci-desk-backend/app/models/upstream.py exactly.

// /upstream/us/crude-production
export interface CrudeProdWeeklyPoint { date: string; value: number; }
export interface CrudeProdMonthlyPoint {
  date: string;
  us_total: number | null;
  l48: number | null;
}
export interface CrudeProductionResponse {
  last_updated: string;
  weekly_us_mbd: number | null;
  weekly_us_wow: number | null;
  weekly_us_yoy: number | null;
  weekly_l48_mbd: number | null;
  weekly_l48_wow: number | null;
  weekly_net_imports_mbd: number | null;
  weekly_net_imports_wow: number | null;
  weekly_history:  CrudeProdWeeklyPoint[];
  monthly_history: CrudeProdMonthlyPoint[];
}

// /upstream/us/rig-count
export interface RigSeriesPoint {
  date: string;
  total: number | null;
  oil: number | null;
  gas: number | null;
  onshore: number | null;
  offshore: number | null;
}
export interface RigCountResponse {
  last_updated: string;
  latest_total: number | null;
  latest_oil: number | null;
  latest_gas: number | null;
  mom_change: number | null;
  yoy_change: number | null;
  history: RigSeriesPoint[];
}

// /upstream/us/production-by-region
export interface RegionLatest {
  current: number | null;
  mom_change: number | null;
  yoy_change: number | null;
}
export interface RegionHistoryPoint {
  date: string;
  texas: number | null;
  north_dakota: number | null;
  new_mexico: number | null;
  padd2: number | null;
  padd3: number | null;
  gulf_of_america: number | null;
}
export interface ProductionByRegionResponse {
  last_updated: string;
  regions: Record<string, RegionLatest>;
  history: RegionHistoryPoint[];
}

// /upstream/us/api-gravity
export interface GravityPoint {
  date: string;
  heavy: number | null;
  medium: number | null;
  light: number | null;
  condensate: number | null;
}
export interface ApiGravityResponse {
  last_updated: string;
  latest_heavy_pct: number | null;
  latest_medium_pct: number | null;
  latest_light_pct: number | null;
  latest_condensate_pct: number | null;
  history: GravityPoint[];
}

// /upstream/us/crude-imports
export interface ImportCountry {
  country: string;
  volume_mbd: number;
  share_pct: number;
  mom_change: number | null;
  is_opec_plus: boolean;
}
export interface ImportsHistoryPoint { date: string; value: number; }
export interface ImportsFeed {
  total_mbd: number | null;
  top_origins: ImportCountry[];
  history: ImportsHistoryPoint[];
}
export interface CrudeImportsResponse {
  last_updated: string;
  weekly_preliminary: ImportsFeed;
  monthly_final: ImportsFeed;
}

// /upstream/us/natural-gas
export interface NaturalGasPoint {
  date: string;
  gross_withdrawals: number | null;
  dry_production: number | null;
}
export interface NaturalGasResponse {
  last_updated: string;
  latest_gross_withdrawals: number | null;
  latest_dry_production: number | null;
  yoy_change_pct: number | null;
  history: NaturalGasPoint[];
}

// /upstream/us/reserves
export interface ReservesPoint { year: string; value: number | null; }
export interface ReservesResponse {
  last_updated: string;
  crude_latest_year: string | null;
  crude_proved_bbbl: number | null;
  ng_latest_year: string | null;
  ng_proved_tcf: number | null;
  crude_history: ReservesPoint[];
  ng_history: ReservesPoint[];
}

// ── Midstream ────────────────────────────────────────────────────────────────

export interface Inventories {
  crude: SeriesPoint[];
  cushing: SeriesPoint[];
  gasoline: SeriesPoint[];
  distillate: SeriesPoint[];
}

export interface RefineryUtilizationHistory {
  national: SeriesPoint[];
  padd1: SeriesPoint[];
  padd2: SeriesPoint[];
  padd3: SeriesPoint[];
  padd4: SeriesPoint[];
  padd5: SeriesPoint[];
}

export interface DaysOfSupply {
  gasoline: number | null;
  distillate: number | null;
}

export interface MidstreamResponse {
  inventories: Inventories;
  spr: SeriesPoint[];
  refinery_utilization: RefineryUtilizationHistory;
  days_of_supply: DaysOfSupply;
  last_updated: string;
}

// ── Downstream ───────────────────────────────────────────────────────────────

export interface CrackSpreads {
  three_two_one: SeriesPoint[];
  rbob_crack: SeriesPoint[];
  ho_crack: SeriesPoint[];
}

export interface ProductDemand {
  gasoline: SeriesPoint[];
  distillate: SeriesPoint[];
  jet: SeriesPoint[];
}

export interface DownstreamResponse {
  crack_spreads: CrackSpreads;
  product_demand: ProductDemand;
  refinery_util_history: RefineryUtilizationHistory;
  last_updated: string;
}

// ── WPSR ─────────────────────────────────────────────────────────────────────

/**
 * A WPSR row carries each key listed in the section's `label_columns`
 * (string) plus each key listed in `numeric_columns` (float | null).
 * The shape is dynamic per section, so we widen to a string-keyed map.
 */
export type WPSRRow = Record<string, string | number | null>;

export interface WPSRPeriodDates {
  current?: string;
  prior_week?: string;
  year_ago?: string;
  two_years_ago?: string;
}

export interface WPSRSection {
  name: string;
  title: string;
  label_columns: string[];   // ('label',) or ('group','label')
  numeric_columns: string[]; // ordered field names in `rows`
  column_headers: string[];  // display labels paired with numeric_columns
  period_dates: WPSRPeriodDates;
  rows: WPSRRow[];
}

export interface WPSRTable {
  table_number: number;
  title: string;
  sections: WPSRSection[];
  hash: string;
  last_fetched: string;
}

export interface WPSRResponse {
  tables: Record<string, WPSRTable>;
  /** SHA-256 digest across all 9 tables */
  hash: string;
  last_fetched: string;
  last_updated: string;
}

// ── COT ──────────────────────────────────────────────────────────────────────

export interface ManagedMoneyPosition {
  commodity: string;
  report_date: string;
  long: number;
  short: number;
  net_position: number;
  wow_change: number | null;
  percentile_rank: number | null;
}

export interface COTResponse {
  wti: ManagedMoneyPosition;
  brent: ManagedMoneyPosition;
  last_updated: string;
}

// ── Macro ─────────────────────────────────────────────────────────────────────

export interface MacroResponse {
  dxy: FredSeries;
  us10y: FredSeries;
  fed_funds: FredSeries;
  wti: FredSeries;
  last_updated: string;
}

// ── Downstream V2 (sub-endpoints) ────────────────────────────────────────────

export interface CrackHistoryPoint {
  date: string;
  crack_321: number | null;
  crack_rbob: number | null;
  crack_ho: number | null;
  brent_wti: number | null;
  wti: number | null;
}

export interface CrackZScores {
  crack_321: number | null;
  crack_rbob: number | null;
  crack_ho: number | null;
  brent_wti: number | null;
}

export interface CrackSignals {
  crack_321: string;
  crack_rbob: string;
  crack_ho: string;
  brent_wti: string;
}

export interface CrackWowChanges {
  crack_321: number | null;
  crack_rbob: number | null;
  crack_ho: number | null;
  brent_wti: number | null;
}

export interface CrackSpreadsResponse {
  last_updated: string;
  wti: number | null;
  brent: number | null;
  rbob_gal: number | null;
  ho_gal: number | null;
  crack_321: number | null;
  crack_rbob: number | null;
  crack_ho: number | null;
  brent_wti: number | null;
  z_scores: CrackZScores;
  signals: CrackSignals;
  wow_changes: CrackWowChanges;
  history_90d: CrackHistoryPoint[];
}

export interface RefineryHistoryPoint {
  date: string;
  national: number | null;
  padd3: number | null;
}

export interface RefineryUtilizationResponse {
  last_updated: string;
  national_current: number | null;
  padd3_current: number | null;
  history: RefineryHistoryPoint[];
}

export interface ProductHistoryPoint {
  date: string;
  value: number;
}

export interface ProductDemandSeries {
  current_4wk_avg: number | null;
  yoy_pct: number | null;
  history: ProductHistoryPoint[];
}

export interface ProductDemandResponse {
  last_updated: string;
  gasoline: ProductDemandSeries;
  distillate: ProductDemandSeries;
  jet: ProductDemandSeries;
  total: ProductDemandSeries;
}

// ── News (Finnhub) ────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: number | null;
  category: string | null;
  datetime: number | null;
  headline: string;
  image: string | null;
  related: string | null;
  source: string | null;
  summary: string | null;
  url: string | null;
}

export interface MarketNewsResponse {
  category: string;
  articles: NewsArticle[];
  last_updated: string;
}

export interface CompanyNewsResponse {
  symbol: string;
  from_date: string;
  to_date: string;
  articles: NewsArticle[];
  last_updated: string;
}

export interface QuoteData {
  symbol: string;
  c: number | null;
  d: number | null;
  dp: number | null;
  h: number | null;
  l: number | null;
  o: number | null;
  pc: number | null;
  t: number | null;
}

export interface OilQuotesResponse {
  quotes: QuoteData[];
  last_updated: string;
}

export interface EconomicEvent {
  actual: number | null;
  country: string | null;
  estimate: number | null;
  event: string | null;
  impact: string | null;
  prev: number | null;
  time: string | null;
  unit: string | null;
}

export interface EconomicCalendarResponse {
  from_date: string;
  to_date: string;
  events: EconomicEvent[];
  last_updated: string;
}

// ── AI Summary ───────────────────────────────────────────────────────────────

export interface AiSummaryRequest {
  prompt?: string;
  provider?: string;
}

export interface AiSummaryResponse {
  summary: string;
  item_count: number;
  generated_at: string;
}

// ── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    message?: string,
  ) {
    super(message ?? `API ${status} from ${endpoint}`);
    this.name = 'ApiError';
  }
}
