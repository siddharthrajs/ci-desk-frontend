export const TICKER_INSTRUMENTS: Array<{
  id: string
  label: string
  price: number
  change: number
  unit: string
  isSpread?: boolean
}> = [
  { id: 'brent',  label: 'BRENT',  price: 85.12, change: +0.51,  unit: '' },
  { id: 'dubai',  label: 'DUBAI',  price: 81.07, change: +0.38,  unit: '' },
  { id: 'wcs',    label: 'WCS',    price: 62.10, change: -0.22,  unit: '' },
  { id: 'bakken', label: 'BAKKEN', price: 74.55, change: +0.18,  unit: '' },
  { id: 'rbob',   label: 'RBOB',   price: 2.341, change: +0.012, unit: '' },
  { id: 'ho',     label: 'HO',     price: 2.498, change: -0.008, unit: '' },
  { id: 'ng',     label: 'NG HH',  price: 2.780, change: -0.046, unit: '' },
  { id: 'bw',     label: 'B-W',    price: 3.7,   change: +0.09,  unit: '', isSpread: true },
]

export const APP_META = {
  name: 'CI-DESK',
  subtitle: 'CRUDE INTEL',
  version: 'v0.4.2',
  workspace: 'DESK-01',
}

export const NAV_TABS = [
  { id: 'markets',    label: 'MARKETS',    path: '/markets' },
  { id: 'macro',      label: 'MACRO',      path: '/macro' },
  { id: 'upstream',   label: 'UPSTREAM',   path: '/upstream' },
  { id: 'midstream',  label: 'MIDSTREAM',  path: '/midstream' },
  { id: 'downstream', label: 'DOWNSTREAM', path: '/downstream' },
  { id: 'reports',    label: 'REPORTS',    path: '/reports' },
  { id: 'positions',  label: 'POSITIONS',  path: '/positions' },
  { id: 'news',                label: 'NEWS',       path: '/news' },
  { id: 'prediction-markets', label: 'PREDICT',    path: '/prediction-markets' },
  { id: 'components',         label: 'COMPONENTS', path: '/components' },
] as const

export const STATUS_STREAMS = 4
export const STATUS_SOURCES = ['EIA', 'OPEC', 'BAKER HUGHES', 'NYMEX', 'ICE', 'CME'] as const
