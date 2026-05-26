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

// ── Upstream ─────────────────────────────────────────────────────────────────

export interface RigCount {
  available: boolean;
  source: string;
  report_date: string | null;
  total: number | null;
  oil: number | null;
  gas: number | null;
  wow_change: number | null;
  reason: string | null;
}

export interface OPECProduction {
  available: boolean;
  source: string;
  reason: string;
  report_date: string | null;
  total_kbpd: number | null;
}

export interface UpstreamResponse {
  crude_production: SeriesPoint[];
  rig_count: RigCount;
  opec: OPECProduction;
  last_updated: string;
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

// ── Upstream sub-endpoints ────────────────────────────────────────────────────

export interface MonthlyProductionPoint {
  date: string;
  us_total: number | null;
  padd3: number | null;
  padd2: number | null;
  gom: number | null;
}

export interface WeeklyProductionPoint {
  date: string;
  value: number;
}

export interface UsProductionResponse {
  weekly_estimate_mbd: number | null;
  weekly_wow_change: number | null;
  monthly_history: MonthlyProductionPoint[];
  weekly_history: WeeklyProductionPoint[];
  last_updated: string;
}

export interface BasinDuc {
  current: number | null;
  mom_change: number | null;
}

export interface DucHistoryPoint {
  date: string;
  total: number | null;
  permian: number | null;
  eagle_ford: number | null;
  bakken: number | null;
  niobrara: number | null;
  appalachia: number | null;
  anadarko: number | null;
  haynesville: number | null;
}

export interface DucWellsResponse {
  last_updated: string;
  total_duc: number | null;
  mom_change: number | null;
  mom_pct: number | null;
  yoy_change: number | null;
  yoy_pct: number | null;
  signal: 'DRAW' | 'BUILD' | 'NEUTRAL';
  history: DucHistoryPoint[];
  basins: Record<string, BasinDuc>;
}

export interface ImportOrigin {
  country: string;
  volume_mbd: number;
  share_pct: number;
  mom_change: number | null;
}

export interface ImportHistoryPoint {
  date: string;
  value: number;
}

export interface CrudeImportsResponse {
  last_updated: string;
  total_imports_mbd: number | null;
  top_origins: ImportOrigin[];
  history_total: ImportHistoryPoint[];
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
