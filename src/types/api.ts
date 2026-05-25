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

export interface WPSRRow {
  label: string;
  current: number | null;
  prior_week: number | null;
  difference: number | null;
  percent_change: number | null;
  year_ago: number | null;
}

export interface WPSRTable {
  table_number: number;
  title: string;
  rows: WPSRRow[];
  hash: string;
  last_fetched: string;
}

export interface WPSRResponse {
  tables: Record<string, WPSRTable>;
  /** SHA-256 digest — field name is `hash` in the actual API response */
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
