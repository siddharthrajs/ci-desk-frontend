import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import { useMidstreamStocks } from '../../hooks/useApiData'
import { ApiError } from '../../types/api'

function Skel({ h = 10, w }: { h?: number; w?: string | number }) {
  return (
    <div style={{
      width: w ?? '100%', height: h,
      background: 'var(--color-bg-elevated)',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )
}

function dosColor(days: number) {
  if (days < 20) return 'var(--color-bear)'
  if (days < 25) return 'var(--color-amber)'
  return 'var(--color-bull)'
}

function DosCard({ label, days }: { label: string; days: number | null }) {
  const color = days != null ? dosColor(days) : 'var(--color-text-tertiary)'
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
          color: days != null ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', lineHeight: 1 }}>
          {days != null ? days.toFixed(1) : '—'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>days</span>
      </div>
      {days != null && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.05em' }}>
          {days < 20 ? 'CRITICALLY LOW' : days < 25 ? 'BELOW NORMAL' : 'ADEQUATE'}
        </div>
      )}
    </div>
  )
}

export function DaysOfSupplyPanel() {
  const { data, isLoading, error } = useMidstreamStocks()

  return (
    <Panel
      title="DAYS OF SUPPLY"
      subtitle="STOCKS ÷ 4-WEEK AVG PRODUCT SUPPLIED"
      headerRight={<Badge variant="muted">EIA WPSR</Badge>}
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel h={60} /><Skel h={60} /><Skel h={60} />
        </div>
      ) : error ? (
        <div style={{ padding: '16px 0', fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
          DATA UNAVAILABLE{error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DosCard label="GASOLINE"   days={data?.dos_gasoline   ?? null} />
          <DosCard label="DISTILLATE" days={data?.dos_distillate ?? null} />
          <DosCard label="JET FUEL"   days={data?.dos_jet        ?? null} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginTop: 2 }}>
            * CRUDE DOS NOT REPORTED — SPR SEE GAUGE
          </div>
        </div>
      )}
    </Panel>
  )
}
