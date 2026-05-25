import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { MidstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

function Skel({ h = 10, w }: { h?: number; w?: string | number }) {
  return (
    <div
      style={{
        width: w ?? '100%',
        height: h,
        background: 'var(--color-bg-elevated)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

function fmtMBbl(kbbl: number, decimals = 1) {
  return (kbbl / 1000).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function KpiCard({
  label,
  value,
  unit,
  wow,
  wowPct,
  isLoading,
}: {
  label: string
  value: string
  unit: string
  wow: number | null | undefined
  wowPct: number | null | undefined
  isLoading: boolean
}) {
  const isPos = wow != null && wow > 0
  const isNeg = wow != null && wow < 0
  const changeColor =
    wow == null
      ? 'var(--color-text-tertiary)'
      : isPos
      ? 'var(--color-bull)'
      : isNeg
      ? 'var(--color-bear)'
      : 'var(--color-text-tertiary)'
  const arrow = wow == null ? '' : isPos ? '▲' : isNeg ? '▼' : ''

  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
          <Skel h={22} w="70%" />
          <Skel h={12} w="50%" />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.05em',
              }}
            >
              {unit}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {arrow && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: changeColor,
                  lineHeight: 1,
                }}
              >
                {arrow}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: changeColor,
                lineHeight: 1,
              }}
            >
              {wow != null
                ? `${wow > 0 ? '+' : ''}${fmtMBbl(wow)}`
                : '—'}
            </span>
            {wowPct != null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: changeColor,
                  lineHeight: 1,
                }}
              >
                ({wowPct > 0 ? '+' : ''}{wowPct.toFixed(1)}%)
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-text-tertiary)',
                lineHeight: 1,
                marginLeft: 1,
              }}
            >
              WoW
            </span>
          </div>
        </>
      )}
    </div>
  )
}

interface Props {
  data: MidstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function InventoryKpiRow({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated
    ? new Date(data.last_updated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }) + ' UTC'
    : null

  const inv = data?.inventories

  const CARDS = [
    { label: 'CRUDE STOCKS', key: 'crude' as const, unit: 'MBbl' },
    { label: 'CUSHING', key: 'cushing' as const, unit: 'MBbl' },
    { label: 'GASOLINE', key: 'gasoline' as const, unit: 'MBbl' },
    { label: 'DISTILLATE', key: 'distillate' as const, unit: 'MBbl' },
  ]

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
          <div
            style={{
              padding: '20px 0',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-bear)',
              letterSpacing: '0.08em',
            }}
          >
            FETCH FAILED
            {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {CARDS.map(c => {
              const latest = inv?.[c.key]?.[0]
              return (
                <KpiCard
                  key={c.key}
                  label={c.label}
                  value={latest ? fmtMBbl(latest.value) : '—'}
                  unit={c.unit}
                  wow={latest?.wow_change}
                  wowPct={latest?.wow_pct_change}
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
