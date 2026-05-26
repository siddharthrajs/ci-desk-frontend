/**
 * Per-WPSR-table KPI definitions.
 *
 * Each table surfaces a handful of headline numbers in a dense strip
 * underneath the table selector. Labels are matched after light
 * normalisation (lower-cased, trimmed, leading "(N)" prefix removed),
 * so a spec written as "Domestic Production" matches the CSV row
 * "(1)     Domestic Production" inside table 1 section B.
 *
 * Natural-gas KPIs (HH price, Lower-48 storage) are intentionally not
 * present here — that data lives in the WNGSR report, which gets its
 * own view once the backend service ships.
 */

export interface KpiSpec {
  /** Card title, ~12 chars max. */
  display: string
  /** Unit shown small to the right of the title. */
  unit: 'M BBL' | 'KBPD' | '%'
  /** WPSRSection.name to look in. */
  section: string
  /** Item label (last label column). */
  label: string
  /** Optional group label for two-label sections — disambiguates duplicates. */
  group?: string
  /** Display precision for the main value. Default: 0. */
  decimals?: number
  /** When true, the change row shows YoY instead of WoW. Used for table 9. */
  yoy?: boolean
}

export const KPI_SPECS: Record<number, KpiSpec[]> = {
  // Table 1 — U.S. Petroleum Balance Sheet
  1: [
    { display: 'CRUDE OIL',     unit: 'M BBL', section: 'stocks',              label: 'Crude Oil',                          decimals: 2 },
    { display: 'COMM. EX-SPR',  unit: 'M BBL', section: 'stocks',              label: 'Commercial (Excluding SPR)',         decimals: 2 },
    { display: 'SPR',           unit: 'M BBL', section: 'stocks',              label: 'Strategic Petroleum Reserve (SPR)',  decimals: 2 },
    { display: 'GASOLINE',      unit: 'M BBL', section: 'stocks',              label: 'Total Motor Gasoline',               decimals: 2 },
    { display: 'DISTILLATE',    unit: 'M BBL', section: 'stocks',              label: 'Distillate Fuel Oil',                decimals: 2 },
    { display: 'PRODUCTION',    unit: 'KBPD',  section: 'supply_disposition',  label: 'Domestic Production',                group: 'Crude Oil Supply', decimals: 0 },
    { display: 'REFINERY IN',   unit: 'KBPD',  section: 'supply_disposition',  label: 'Crude Oil Input to Refineries',      group: 'Crude Oil Supply', decimals: 0 },
    { display: 'DEMAND',        unit: 'KBPD',  section: 'supply_disposition',  label: 'Total',                              group: 'Products Supplied', decimals: 0 },
  ],

  // Table 2 — Refiner Inputs, Utilization, Net Production
  2: [
    { display: 'CRUDE INPUTS',  unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Crude Oil Inputs',     group: 'Refiner Inputs and Utilization', decimals: 0 },
    { display: 'UTILIZATION',   unit: '%',    section: 'refiner_inputs_and_production', label: 'Percent Utilization',  group: 'Refiner Inputs and Utilization', decimals: 1 },
    { display: 'OPER. CAPACITY',unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Operable Capacity',    group: 'Refiner Inputs and Utilization', decimals: 0 },
    { display: 'GASOLINE PROD', unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Finished Motor Gasoline', group: 'Refiner and Blender Net Production', decimals: 0 },
    { display: 'DISTILL. PROD', unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Distillate Fuel Oil',     group: 'Refiner and Blender Net Production', decimals: 0 },
    { display: 'JET PROD',      unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Kerosene-Type Jet Fuel',  group: 'Refiner and Blender Net Production', decimals: 0 },
    { display: 'FUEL ETHANOL',  unit: 'KBPD', section: 'refiner_inputs_and_production', label: 'Fuel Ethanol',            group: 'Ethanol Plant Production', decimals: 0 },
  ],

  // Table 3 — Refiner Net Production + Blender Net Production
  3: [
    { display: 'REF GASOLINE',   unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Finished Motor Gasoline', group: 'Refiner Net Production',  decimals: 0 },
    { display: 'REF DISTILLATE', unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Distillate Fuel Oil',     group: 'Refiner Net Production',  decimals: 0 },
    { display: 'REF JET',        unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Kerosene-Type Jet Fuel',  group: 'Refiner Net Production',  decimals: 0 },
    { display: 'REF RESID',      unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Residual Fuel Oil',       group: 'Refiner Net Production',  decimals: 0 },
    { display: 'BLEND GASOLINE', unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Finished Motor Gasoline', group: 'Blender Net Production', decimals: 0 },
    { display: 'BLEND DISTILL.', unit: 'KBPD', section: 'refiner_and_blender_net_production', label: 'Distillate Fuel Oil',     group: 'Blender Net Production', decimals: 0 },
  ],

  // Table 4 — Crude Oil and Petroleum Product Stocks (PADD detail)
  4: [
    { display: 'CRUDE OIL',    unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Crude Oil',                  decimals: 2 },
    { display: 'COMM. EX-SPR', unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Commercial (Excluding SPR)', decimals: 2 },
    { display: 'CUSHING',      unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Cushing',                    decimals: 2 },
    { display: 'SPR',          unit: 'M BBL', section: 'crude_and_product_stocks', label: 'SPR',                        decimals: 2 },
    { display: 'GASOLINE',     unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Total Motor Gasoline',       decimals: 2 },
    { display: 'DISTILLATE',   unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Distillate Fuel Oil',        decimals: 2 },
    { display: 'JET FUEL',     unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Kerosene-Type Jet Fuel',     decimals: 2 },
    { display: 'PROPANE',      unit: 'M BBL', section: 'crude_and_product_stocks', label: 'Propane/Propylene',          decimals: 2 },
  ],

  // Table 5 — Stocks of Motor Gasoline and Fuel Ethanol
  5: [
    { display: 'GASOLINE',      unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Total Motor Gasoline',    group: 'Motor Gasoline', decimals: 2 },
    { display: 'FIN. GASOLINE', unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Finished Motor Gasoline', group: 'Motor Gasoline', decimals: 2 },
    { display: 'CONVENTIONAL',  unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Conventional',            group: 'Motor Gasoline', decimals: 2 },
    { display: 'REFORMULATED',  unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Reformulated',            group: 'Motor Gasoline', decimals: 2 },
    { display: 'BLEND COMP.',   unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Blending Components',     group: 'Motor Gasoline', decimals: 2 },
    { display: 'FUEL ETHANOL',  unit: 'M BBL', section: 'gasoline_and_ethanol_stocks', label: 'Fuel Ethanol',            group: 'Fuel Ethanol',   decimals: 2 },
  ],

  // Table 6 — Stocks of Distillate, Jet, Residual, Propane
  6: [
    { display: 'DISTILLATE', unit: 'M BBL', section: 'distillate_jet_resid_propane_stocks', label: 'Distillate Fuel Oil',      decimals: 2 },
    { display: 'ULSD',       unit: 'M BBL', section: 'distillate_jet_resid_propane_stocks', label: '15 ppm sulfur and Under',  decimals: 2 },
    { display: 'JET FUEL',   unit: 'M BBL', section: 'distillate_jet_resid_propane_stocks', label: 'Kerosene-Type Jet Fuel',   decimals: 2 },
    { display: 'RESID FUEL', unit: 'M BBL', section: 'distillate_jet_resid_propane_stocks', label: 'Residual Fuel Oil',        decimals: 2 },
    { display: 'PROPANE',    unit: 'M BBL', section: 'distillate_jet_resid_propane_stocks', label: 'Propane/Propylene',        decimals: 2 },
  ],

  // Table 7 — Imports / Exports of Crude and Products
  7: [
    { display: 'NET IMPORTS',   unit: 'KBPD', section: 'imports_exports', label: 'Net Imports (Incl. SPR)',           decimals: 0 },
    { display: 'TOTAL IMPORTS', unit: 'KBPD', section: 'imports_exports', label: 'Imports (Incl. SPR)',                decimals: 0 },
    { display: 'TOTAL EXPORTS', unit: 'KBPD', section: 'imports_exports', label: 'Exports',                            decimals: 0 },
    { display: 'CRUDE NET IMP', unit: 'KBPD', section: 'imports_exports', label: 'Crude Oil Net Imports (Incl. SPR)',  decimals: 0 },
    { display: 'CRUDE COMM IMP',unit: 'KBPD', section: 'imports_exports', label: 'Commercial',                         decimals: 0 },
    { display: 'PRODUCT NET IMP', unit: 'KBPD', section: 'imports_exports', label: 'Total Products Net Imports',      decimals: 0 },
  ],

  // Table 8 — Crude Imports by Country of Origin
  8: [
    { display: 'CANADA',       unit: 'KBPD', section: 'crude_imports_by_country', label: 'Canada',       decimals: 0 },
    { display: 'MEXICO',       unit: 'KBPD', section: 'crude_imports_by_country', label: 'Mexico',       decimals: 0 },
    { display: 'SAUDI ARABIA', unit: 'KBPD', section: 'crude_imports_by_country', label: 'Saudi Arabia', decimals: 0 },
    { display: 'COLOMBIA',     unit: 'KBPD', section: 'crude_imports_by_country', label: 'Colombia',     decimals: 0 },
    { display: 'BRAZIL',       unit: 'KBPD', section: 'crude_imports_by_country', label: 'Brazil',       decimals: 0 },
    { display: 'VENEZUELA',    unit: 'KBPD', section: 'crude_imports_by_country', label: 'Venezuela',    decimals: 0 },
  ],

  // Table 9 — Weekly History (no WoW columns — fall back to YoY)
  9: [
    { display: 'DOM. PRODUCTION', unit: 'KBPD', section: 'weekly_history', label: 'Domestic Production', group: 'Crude Oil Production',           decimals: 0, yoy: true },
    { display: 'CRUDE INPUTS',    unit: 'KBPD', section: 'weekly_history', label: 'Crude Oil Inputs',    group: 'Refiner Inputs and Utilization', decimals: 0, yoy: true },
    { display: 'OPER. CAPACITY',  unit: 'KBPD', section: 'weekly_history', label: 'Operable Capacity',   group: 'Refiner Inputs and Utilization', decimals: 0, yoy: true },
    { display: 'UTILIZATION',     unit: '%',    section: 'weekly_history', label: 'Percent Utilization', group: 'Refiner Inputs and Utilization', decimals: 1, yoy: true },
    { display: 'GASOLINE BLEND',  unit: 'KBPD', section: 'weekly_history', label: 'Motor Gasoline Blending Components', group: 'Refiner and Blender Net Inputs', decimals: 0, yoy: true },
    { display: 'FUEL ETHANOL',    unit: 'KBPD', section: 'weekly_history', label: 'Fuel Ethanol',        group: 'Refiner and Blender Net Inputs', decimals: 0, yoy: true },
  ],
}
