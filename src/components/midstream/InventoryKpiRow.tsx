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

function fmtMBbl(kbbl: number) {
  return (kbbl / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function KpiCard({
  label, value, unit, wow, wowPct, isLoading,
}: {
  label: string; value: string; unit: string
  wow: number | null | undefined; wowPct: number | null | undefined
  isLoading: boolean
}) {
  const isPos = wow != null && wow > 0
  const isNeg = wow != null && wow < 0
  const color = wow == null ? 'var(--color-text-tertiary)'
    : isPos ? 'var(--color-bull)' : isNeg ? 'var(--color-bear)' : 'var(--color-text-tertiary)'
  const arrow = wow == null ? '' : isPos ? '▲' : isNeg ? '▼' : ''

  return (
    <div style={{
      background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
          <Skel h={22} w="70%" /><Skel h={12} w="50%" />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
              color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>{unit}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {arrow && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, lineHeight: 1 }}>{arrow}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, lineHeight: 1 }}>
              {wow != null ? `${wow > 0 ? '+' : ''}${fmtMBbl(wow)}` : '—'}
            </span>
            {wowPct != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, lineHeight: 1 }}>
                ({wowPct > 0 ? '+' : ''}{wowPct.toFixed(1)}%)
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--color-text-tertiary)', lineHeight: 1, marginLeft: 1 }}>WoW</span>
          </div>
        </>
      )}
    </div>
  )
}

const CARDS = [
  { label: 'CRUDE STOCKS',  key: 'crude'      as const, unit: 'MBbl' },
  { label: 'CUSHING',       key: 'cushing'    as const, unit: 'MBbl' },
  { label: 'GASOLINE',      key: 'gasoline'   as const, unit: 'MBbl' },
  { label: 'DISTILLATE',    key: 'distillate' as const, unit: 'MBbl' },
  { label: 'JET FUEL',      key: 'jet'        as const, unit: 'MBbl' },
]

export function InventoryKpiRow() {
  const { data, isLoading, error } = useMidstreamStocks()

  const updatedLabel = data?.last_updated
    ? new Date(data.last_updated).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
      }) + ' UTC'
    : null

  return (
    <Panel
      title="INVENTORY KPI"
      subtitle="EIA WEEKLY PETROLEUM STATUS REPORT · COMMERCIAL STOCKS (EXCL. SPR)"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA WPSR</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      <div style={{ padding: '16px 18px' }}>
        {error ? (
          <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'var(--font-mono)',
            fontSize: 11, color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
            DATA UNAVAILABLE{error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {CARDS.map(c => {
              const s = data?.[c.key]
              const latest = s?.latest_kbbl
              const wow = s?.wow_kbbl
              const wowPct = (latest != null && wow != null && (latest - wow) !== 0)
                ? wow / (latest - wow) * 100 : null
              return (
                <KpiCard
                  key={c.key}
                  label={c.label}
                  value={latest != null ? fmtMBbl(latest) : '—'}
                  unit={c.unit}
                  wow={wow}
                  wowPct={wowPct}
                  isLoading={isLoading && !data}
                />
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}
