import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { MidstreamResponse } from '../../types/api'
import type { SeriesPoint } from '../../types/api'
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

function latestVal(series: SeriesPoint[]): number | null {
  return series[0]?.value ?? null
}

function avgOf(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v != null)
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const PADDS = [
  { key: 'padd1' as const, label: 'PADD 1', region: 'East Coast' },
  { key: 'padd2' as const, label: 'PADD 2', region: 'Midwest' },
  { key: 'padd3' as const, label: 'PADD 3', region: 'Gulf Coast', dominant: true },
  { key: 'padd4' as const, label: 'PADD 4', region: 'Rocky Mtn' },
  { key: 'padd5' as const, label: 'PADD 5', region: 'West Coast' },
]

function UtilBar({ label, region, pct, dominant }: {
  label: string
  region: string
  pct: number | null
  dominant?: boolean
}) {
  const fillColor = pct == null
    ? 'var(--color-border)'
    : pct >= 90
    ? 'var(--color-bull)'
    : pct >= 75
    ? 'var(--color-amber)'
    : 'var(--color-bear)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Label */}
      <div style={{ width: 56, flexShrink: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: dominant ? 700 : 400,
            color: dominant ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.04em',
          }}
        >
          {region}
        </div>
      </div>

      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: 8,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {pct != null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${Math.min(pct, 100)}%`,
              background: fillColor,
            }}
          />
        )}
      </div>

      {/* Value */}
      <div
        style={{
          width: 42,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: dominant ? 600 : 400,
          color: pct != null ? fillColor : 'var(--color-text-tertiary)',
        }}
      >
        {pct != null ? `${pct.toFixed(1)}%` : '—'}
      </div>
    </div>
  )
}

interface Props {
  data: MidstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function RefineryUtilizationPanel({ data, isLoading, error }: Props) {
  const util = data?.refinery_utilization

  const paddVals = util
    ? PADDS.map(p => latestVal(util[p.key]))
    : PADDS.map(() => null)

  const nationalEst = avgOf(paddVals)

  return (
    <Panel
      title="REFINERY UTILIZATION"
      subtitle="CAPACITY UTILIZATION % · PADD 1–5"
      headerRight={
        <>
          <Badge variant="muted">EIA WEEKLY</Badge>
          <Badge
            variant="muted"
            style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,166,35,0.3)' }}
          >
            NUS NOT IN WEEKLY DATASET
          </Badge>
        </>
      }
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel h={10} w="50%" />
          <Skel h={32} w="40%" />
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
          {PADDS.map(p => <Skel key={p.key} h={26} />)}
        </div>
      ) : error ? (
        <div
          style={{
            padding: '16px 0',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* National estimated header */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                marginBottom: 4,
              }}
            >
              NATIONAL (PADD AVG EST.)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 26,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1,
                }}
              >
                {nationalEst != null ? nationalEst.toFixed(1) : '—'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                %
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

          {/* PADD bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PADDS.map((p, i) => (
              <UtilBar
                key={p.key}
                label={p.label}
                region={p.region}
                pct={paddVals[i]}
                dominant={p.dominant}
              />
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}
