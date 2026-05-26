import type { CSSProperties } from 'react'
import type { WPSRRow, WPSRSection, WPSRTable } from '../../types/api'
import { KPI_SPECS, type KpiSpec } from './wpsrKpiSpecs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip leading "(N)" numbering, lowercase, collapse internal whitespace. */
function normalize(s: string): string {
  return s
    .replace(/^\s*\(\d+\)\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function findRow(section: WPSRSection, spec: KpiSpec): WPSRRow | undefined {
  const labelCol = section.label_columns[section.label_columns.length - 1]
  const targetLabel = normalize(spec.label)
  const targetGroup = spec.group ? normalize(spec.group) : null

  return section.rows.find(row => {
    const label = normalize(String(row[labelCol] ?? ''))
    if (label !== targetLabel) return false
    if (targetGroup === null) return true
    const group = normalize(String(row.group ?? ''))
    return group === targetGroup
  })
}

function asNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

interface CardData {
  spec: KpiSpec
  current: number | null
  diff:    number | null
  pct:     number | null
  mode:    'WoW' | 'YoY'
}

/** Pull the displayable numbers for one KPI spec out of a parsed WPSR table. */
function buildCard(table: WPSRTable, spec: KpiSpec): CardData {
  const mode: 'WoW' | 'YoY' = spec.yoy ? 'YoY' : 'WoW'
  const section = table.sections.find(s => s.name === spec.section)
  if (!section) return { spec, current: null, diff: null, pct: null, mode }

  const row = findRow(section, spec)
  if (!row) return { spec, current: null, diff: null, pct: null, mode }

  const current = asNumber(row.current)

  if (spec.yoy) {
    const yearAgo = asNumber(row.year_ago)
    if (current === null || yearAgo === null) {
      return { spec, current, diff: null, pct: null, mode }
    }
    const diff = current - yearAgo
    const pct = yearAgo !== 0 ? (diff / yearAgo) * 100 : null
    return { spec, current, diff, pct, mode }
  }

  // WoW path — prefer API-provided fields, fill the gaps from current/prior.
  let diff = asNumber(row.diff_wow)
  let pct = asNumber(row.pct_wow)
  const prior = asNumber(row.prior_week)
  if (diff === null && current !== null && prior !== null) {
    diff = current - prior
  }
  if (pct === null && diff !== null && prior !== null && prior !== 0) {
    pct = (diff / prior) * 100
  }
  return { spec, current, diff, pct, mode }
}

function fmtNum(n: number | null, decimals: number): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function signed(n: number | null, decimals: number): string {
  if (n === null) return ''
  return (n > 0 ? '+' : '') + fmtNum(n, decimals)
}

function changeColor(n: number | null): string {
  if (n === null || n === 0) return 'var(--color-text-tertiary)'
  return n > 0 ? 'var(--color-bull)' : 'var(--color-bear)'
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function KpiCard({ data }: { data: CardData }) {
  const valueDecimals = data.spec.decimals ?? 0
  // Diff at the same precision as the value reads naturally.
  const diffDecimals = valueDecimals
  const arrow = data.diff === null ? '' : data.diff > 0 ? '▲' : data.diff < 0 ? '▼' : ''
  const diffColor = changeColor(data.diff)

  return (
    <div style={cardStyle}>
      <div style={cardTitleRowStyle}>
        <span style={cardTitleStyle}>{data.spec.display}</span>
        <span style={cardUnitStyle}>{data.spec.unit}</span>
      </div>
      <div style={cardValueStyle}>{fmtNum(data.current, valueDecimals)}</div>
      <div style={{ ...cardChangeStyle, color: diffColor }}>
        {arrow && <span style={{ fontSize: '0.8em' }}>{arrow}</span>}
        <span>{signed(data.diff, diffDecimals) || '—'}</span>
        {data.pct !== null && (
          <>
            <span style={cardSepStyle}>·</span>
            <span>{signed(data.pct, 1)}%</span>
          </>
        )}
        <span style={cardModeStyle}>{data.mode}</span>
      </div>
    </div>
  )
}

interface Props {
  table: WPSRTable
}

export function WpsrKpiBar({ table }: Props) {
  const specs = KPI_SPECS[table.table_number] ?? []
  if (specs.length === 0) return null

  const cards = specs.map(spec => buildCard(table, spec))

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: 6,
      marginBottom: 14,
    }}>
      {cards.map((c, i) => <KpiCard key={`${c.spec.section}-${c.spec.label}-${i}`} data={c} />)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cardStyle: CSSProperties = {
  background: 'var(--color-bg-panel)',
  border: '1px solid var(--color-border)',
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minHeight: 78,
}

const cardTitleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 6,
}

const cardTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.09em',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
}

const cardUnitStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  letterSpacing: '0.05em',
  color: 'var(--color-text-tertiary)',
}

const cardValueStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
}

const cardChangeStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontWeight: 600,
}

const cardSepStyle: CSSProperties = {
  color: 'var(--color-text-tertiary)',
  margin: '0 1px',
}

const cardModeStyle: CSSProperties = {
  marginLeft: 'auto',
  color: 'var(--color-text-tertiary)',
  fontSize: 9,
  letterSpacing: '0.08em',
  fontWeight: 600,
}
