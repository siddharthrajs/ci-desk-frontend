import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { MidstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

// DOE stated SPR operable capacity (as of 2024, post-drawdown restorations)
const SPR_CAPACITY_MBBL = 714.0

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

interface Props {
  data: MidstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function SprLevelPanel({ data, isLoading, error }: Props) {
  const latest = data?.spr?.[0]
  const currentMBbl = latest ? latest.value / 1000 : null
  const pctCapacity = currentMBbl != null ? (currentMBbl / SPR_CAPACITY_MBBL) * 100 : null
  const wow = latest?.wow_change
  const isPos = wow != null && wow > 0
  const changeColor =
    wow == null
      ? 'var(--color-text-tertiary)'
      : isPos
      ? 'var(--color-bull)'
      : 'var(--color-bear)'

  return (
    <Panel
      title="SPR LEVEL"
      subtitle={`STRATEGIC PETROLEUM RESERVE · CAPACITY ${SPR_CAPACITY_MBBL.toFixed(0)} MBbl`}
      headerRight={<Badge variant="muted">EIA</Badge>}
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel h={32} w="60%" />
          <Skel h={10} w="40%" />
          <Skel h={16} />
          <Skel h={10} w="30%" />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Current level */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1,
                }}
              >
                {currentMBbl != null ? currentMBbl.toFixed(1) : '—'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                MBbl
              </span>
            </div>

            {/* WoW change */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              {wow != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: changeColor }}>
                  {wow > 0 ? '▲' : wow < 0 ? '▼' : ''}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: changeColor }}>
                {wow != null
                  ? `${wow > 0 ? '+' : ''}${(wow / 1000).toFixed(1)}`
                  : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                MBbl WoW
              </span>
            </div>
          </div>

          {/* Gauge bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
              }}
            >
              <span>0 MBbl</span>
              <span>
                {pctCapacity != null
                  ? `${pctCapacity.toFixed(1)}% OF CAPACITY`
                  : '—% OF CAPACITY'}
              </span>
              <span>{SPR_CAPACITY_MBBL.toFixed(0)} MBbl</span>
            </div>

            {/* Track */}
            <div
              style={{
                height: 12,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {pctCapacity != null && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(pctCapacity, 100)}%`,
                    background: pctCapacity < 40
                      ? 'var(--color-bear)'
                      : pctCapacity < 65
                      ? 'var(--color-amber)'
                      : 'var(--color-bull)',
                    transition: 'width 0.3s ease',
                  }}
                />
              )}
            </div>

            {/* Segment ticks */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.05em',
              }}
            >
              <span>EMPTY</span>
              <span style={{ color: 'var(--color-bear)' }}>40%</span>
              <span style={{ color: 'var(--color-amber)' }}>65%</span>
              <span style={{ color: 'var(--color-bull)' }}>FULL</span>
            </div>
          </div>

          {/* Latest period */}
          {latest && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.05em',
              }}
            >
              LATEST REPORT · {latest.period}
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
