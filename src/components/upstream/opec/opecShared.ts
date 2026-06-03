/**
 * Shared constants + types for the OPEC+ subtab.
 *
 * The "basis" toggle switches the whole subtab between crude oil + lease
 * condensate (EIA international productId 57) and total liquids (productId 55).
 * Capacity, spare-capacity and quota panels are crude-only and ignore it.
 */

export type OpecBasis = 'crude' | 'liquids'

export const BASIS_LABEL: Record<OpecBasis, string> = {
  crude:   'crude oil + lease condensate',
  liquids: 'total liquids (incl. NGPL)',
}

export const BASIS_SHORT: Record<OpecBasis, string> = {
  crude:   'CRUDE + COND.',
  liquids: 'TOTAL LIQUIDS',
}

export interface OpecSectionDef {
  id: string
  label: string
}

// Order here drives both the jump-bar and the on-page section order.
export const OPEC_SECTIONS: OpecSectionDef[] = [
  { id: 'overview',    label: 'OVERVIEW' },
  { id: 'production',  label: 'PRODUCTION' },
  { id: 'capacity',    label: 'CAPACITY & SPARE' },
  { id: 'supply-risk', label: 'SUPPLY RISK' },
  { id: 'compliance',  label: 'COMPLIANCE' },
  { id: 'forecast',    label: 'FORECAST' },
]

// Height (px) of the sticky jump-bar — sections offset their scroll anchor by
// this so a jumped-to heading isn't hidden under the bar.
export const JUMP_BAR_OFFSET = 52
