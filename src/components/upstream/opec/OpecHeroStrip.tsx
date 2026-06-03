/**
 * OVERVIEW hero strip — 6 KPI cards.
 *
 * Composed from two hooks (like the US HeroStrip): production totals come from
 * /opec/production (international, basis-aware); spare/production capacity and
 * the world balance come from /opec/overview (STEO). No extra fetch.
 */

import { useOpecProduction, useOpecOverview } from '../../../hooks/useApiData'
import type { OpecBasis } from '../../../types/api'
import { Delta, Skel } from '../_shared'

function HeroCard({
  label,
  source,
  value,
  unit,
  decimals = 2,
  delta,
  deltaLabel,
  sub,
  valueColor,
  loading,
}: {
  label: string
  source: string
  value: number | null
  unit: string
  decimals?: number
  delta?: number | null
  deltaLabel?: string
  sub?: string | null
  valueColor?: string
  loading: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minHeight: 96,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)',
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em',
        }}>{source}</span>
      </div>

      {loading ? (
        <>
          <Skel h={28} w={120} />
          <Skel h={11} w={140} />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, lineHeight: 1,
              color: value == null ? 'var(--color-text-tertiary)' : (valueColor ?? 'var(--color-text-primary)'),
              letterSpacing: '-0.01em',
            }}>
              {value == null ? '—' : value.toFixed(decimals)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>
              {unit}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2, minHeight: 14 }}>
            {delta !== undefined && <Delta change={delta} label={deltaLabel} decimals={decimals} unit="MBD" compact />}
            {sub && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>
                {sub}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function OpecHeroStrip({ basis }: { basis: OpecBasis }) {
  const prod = useOpecProduction(basis)
  const ov = useOpecOverview()

  const prodLoading = prod.isLoading && !prod.data
  const ovLoading = ov.isLoading && !ov.data

  const h = prod.data?.hero
  const o = ov.data?.hero
  const balance = o?.market_balance_mbd ?? null
  const balanceColor = balance == null
    ? undefined
    : balance >= 0 ? 'var(--color-bull)' : 'var(--color-bear)'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 'var(--spacing-gap)',
    }}>
      <HeroCard label="OPEC+ TOTAL" source="MONTHLY"
        value={h?.total_mbd ?? null} unit="MBD" delta={h?.total_mom ?? null} deltaLabel="MoM" loading={prodLoading} />
      <HeroCard label="SAUDI ARABIA" source="MONTHLY"
        value={h?.saudi_mbd ?? null} unit="MBD" delta={h?.saudi_mom ?? null} deltaLabel="MoM" loading={prodLoading} />
      <HeroCard label="RUSSIA" source="MONTHLY"
        value={h?.russia_mbd ?? null} unit="MBD" delta={h?.russia_mom ?? null} deltaLabel="MoM" loading={prodLoading} />
      <HeroCard label="SPARE CAPACITY" source="STEO"
        value={o?.spare_capacity_mbd ?? null} unit="MBD" sub="OPEC · crude" loading={ovLoading} />
      <HeroCard label="PROD. CAPACITY" source="STEO"
        value={o?.production_capacity_mbd ?? null} unit="MBD"
        sub={o?.capacity_utilization_pct != null ? `${o.capacity_utilization_pct.toFixed(0)}% util` : null}
        loading={ovLoading} />
      <HeroCard label="MARKET BALANCE" source="STEO"
        value={balance} unit="MBD" valueColor={balanceColor}
        sub={o?.market_balance_label ? o.market_balance_label.toUpperCase() : null}
        loading={ovLoading} />
    </div>
  )
}
