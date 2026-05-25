import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { UpstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

function fmtUtcTime(iso: string) {
  return (
    new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC'
  )
}

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

// EIA DPR basins, ordered by typical production scale
const BASINS = [
  'PERMIAN',
  'EAGLE FORD',
  'DJ NIOBRARA',
  'HAYNESVILLE',
  'BAKKEN',
  'UTICA',
  'APPALACHIA',
]

interface Props {
  data: UpstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function DucWellsPanel({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  return (
    <Panel
      title="DUC WELLS · LEADING INDICATOR"
      headerRight={
        <>
          <Badge variant="muted">EIA DPR</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      {isLoading && !data ? (
        /* Loading skeleton */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 16 }}>
            <Skel h={36} w={80} />
            <Skel h={11} w={120} />
            <Skel h={20} w={80} />
          </div>
          <Skel h={100} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BASINS.map(b => <Skel key={b} h={11} />)}
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            padding: '32px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-bear)',
              letterSpacing: '0.08em',
            }}
          >
            FETCH FAILED
            {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
          </span>
        </div>
      ) : (
        /* Pending — EIA DPR not yet integrated into upstream endpoint */
        <>
          {/* ── Hero number ───────────────────────────────────────────── */}
          <div
            style={{
              textAlign: 'center',
              paddingBottom: 16,
              borderBottom: '1px solid var(--color-border)',
              marginBottom: 16,
            }}
          >
            {/* Count */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '-0.02em',
              }}
            >
              —
            </div>

            {/* MoM / YoY */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                — MoM
              </span>
              <span style={{ color: 'var(--color-border-muted)', fontSize: 11 }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                — YoY
              </span>
            </div>

            {/* DRAW badge */}
            <div style={{ marginTop: 8 }}>
              <Badge
                variant="muted"
                style={{
                  color: 'var(--color-amber)',
                  borderColor: 'rgba(245,166,35,0.3)',
                  letterSpacing: '0.08em',
                }}
              >
                DRAW · —
              </Badge>
            </div>
          </div>

          {/* ── 24M area chart placeholder ────────────────────────────── */}
          <div
            style={{
              height: 96,
              background: 'var(--color-bg-elevated)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-amber)',
                letterSpacing: '0.08em',
              }}
            >
              ⚑&nbsp;&nbsp;DATA SOURCE PENDING
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.05em',
              }}
            >
              EIA DPR · 24M HISTORY NOT YET INTEGRATED
            </span>
          </div>

          {/* ── Basin breakdown ───────────────────────────────────────── */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                marginBottom: 8,
              }}
            >
              BASIN BREAKDOWN
            </div>
            {BASINS.map((basin, i) => (
              <div
                key={basin}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom:
                    i < BASINS.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {basin}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  —
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}
