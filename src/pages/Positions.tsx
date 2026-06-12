import { useState, type CSSProperties } from 'react'
import { useCotPositions, useCotHistory } from '../hooks/useApiData'
import { CotPositionChart } from '../components/positions/CotPositionChart'

const DEFAULT_CODE = '067651' // WTI-Physical

// =============================================================================
// KPI strip — current week summary (non-duplicative; COT tab has the full table)
// =============================================================================

function KpiStrip({ contractCode }: { contractCode: string }) {
  const { data: cot } = useCotPositions()
  const contract = cot?.contracts.find(c => c.contract_market_code === contractCode)

  if (!contract) return null

  const stats = [
    { label: 'MM NET',    value: fmt(contract.mm_net, true),                color: signColor(contract.mm_net) },
    { label: 'WOW Δ NET', value: fmt(contract.mm_wow_net_change, true),      color: signColor(contract.mm_wow_net_change) },
    { label: '3-YR %ILE', value: contract.mm_percentile_rank != null ? `${contract.mm_percentile_rank.toFixed(1)}%` : '—', color: pctColor(contract.mm_percentile_rank) },
    { label: 'OPEN INT',  value: fmt(contract.open_interest, false),         color: 'var(--color-text-primary)' },
    { label: 'MM LONG',   value: fmt(contract.managed_money.long, false),    color: 'var(--color-bull)' },
    { label: 'MM SHORT',  value: fmt(contract.managed_money.short, false),   color: 'var(--color-bear)' },
  ]

  return (
    <div style={{ display: 'flex', border: '1px solid var(--color-border)', marginBottom: 14, flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          flex: '1 1 0',
          minWidth: 110,
          padding: '8px 14px',
          borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
          background: 'var(--color-bg-panel)',
        }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
            {s.label}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: s.color }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Contract selector
// =============================================================================

function ContractSelector({
  selectedCode,
  onSelect,
}: {
  selectedCode: string
  onSelect: (code: string) => void
}) {
  const { data: cot } = useCotPositions()
  if (!cot?.contracts.length) return null

  return (
    <div style={{ overflowX: 'auto', marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {cot.contracts.map((c, i) => {
          const active = c.contract_market_code === selectedCode
          return (
            <button
              key={c.contract_market_code}
              type="button"
              onClick={() => onSelect(c.contract_market_code)}
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.07em',
                background: active ? 'var(--color-amber)' : 'transparent',
                color: active ? '#000' : 'var(--color-text-secondary)',
                border: 'none',
                borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              {c.contract_market_name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// Chart panel
// =============================================================================

function ChartPanel({ contractCode }: { contractCode: string }) {
  const { data, isLoading, error } = useCotHistory(contractCode)

  if (isLoading) return <div style={emptyStyle}>LOADING…</div>
  if (error)     return <div style={{ ...emptyStyle, color: 'var(--color-bear)', borderColor: 'var(--color-bear)' }}>{(error as Error).message.toUpperCase()}</div>
  if (!data?.history.length) return <div style={emptyStyle}>NO HISTORY</div>

  return (
    <div style={{ border: '1px solid var(--color-border)', marginBottom: 14 }}>
      <div style={{
        padding: '8px 12px',
        background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        gap: 10,
        alignItems: 'baseline',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}>
          {data.contract_market_name}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          {data.exchange} · CODE {data.contract_market_code} · {data.history.length} WEEKS
        </span>
      </div>
      <CotPositionChart history={data.history} />
    </div>
  )
}

// =============================================================================
// Page
// =============================================================================

export function Positions() {
  const [selectedCode, setSelectedCode] = useState(DEFAULT_CODE)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          POSITIONS
        </h1>
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          CFTC COT HISTORICAL POSITIONING · PETROLEUM & PRODUCTS · 3-YEAR WEEKLY
        </p>
      </div>

      <ContractSelector selectedCode={selectedCode} onSelect={setSelectedCode} />
      <KpiStrip contractCode={selectedCode} />
      <ChartPanel contractCode={selectedCode} />
    </div>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function fmt(n: number | null | undefined, signed: boolean): string {
  if (n == null) return '—'
  const s = Math.abs(n).toLocaleString('en-US')
  if (!signed) return s
  return n >= 0 ? `+${s}` : `-${s}`
}

function signColor(n: number | null | undefined): string {
  if (n == null || n === 0) return 'var(--color-text-secondary)'
  return n > 0 ? 'var(--color-bull)' : 'var(--color-bear)'
}

function pctColor(pct: number | null | undefined): string {
  if (pct == null) return 'var(--color-text-secondary)'
  if (pct >= 80) return 'var(--color-bull)'
  if (pct <= 20) return 'var(--color-bear)'
  return 'var(--color-text-primary)'
}

const emptyStyle: CSSProperties = {
  padding: 40,
  border: '1px dashed var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  letterSpacing: '0.1em',
}
