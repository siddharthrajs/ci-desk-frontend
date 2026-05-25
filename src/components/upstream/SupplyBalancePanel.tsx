import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import { StatCard } from '../ui/StatCard'
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

function Skel({ h = 10 }: { h?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: h,
        background: 'var(--color-bg-elevated)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

// Waterfall stub: (hidden = invisible offset bar, value = visible bar)
// Creates a proper stacked waterfall layout with muted colors.
// Real EIA STEO data will replace this when the endpoint is wired.
const SUPPLY_STUB = [
  { name: 'NON-OPEC', hidden: 0, value: 50 },
  { name: 'OPEC+', hidden: 50, value: 27 },
  { name: 'SUPPLY', hidden: 0, value: 77 },
  { name: 'DEMAND', hidden: 3, value: 74 },
  { name: 'BALANCE', hidden: 0, value: 3 },
]

interface Props {
  data: UpstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function SupplyBalancePanel({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  return (
    <Panel
      title="GLOBAL SUPPLY BALANCE"
      headerRight={
        <>
          <Badge variant="muted">EIA STEO</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      {/* ── Waterfall chart ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        {isLoading && !data ? (
          <Skel h={150} />
        ) : error ? (
          <div
            style={{
              height: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
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
          /* Pending waterfall — stub bars with overlay until STEO is integrated */
          <div style={{ position: 'relative', height: 150 }}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={SUPPLY_STUB}
                barSize={48}
                margin={{ top: 6, right: 4, bottom: 4, left: 4 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    fill: 'var(--color-border-muted)',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 80]} />
                {/* Hidden offset bar — creates the waterfall floating effect */}
                <Bar
                  dataKey="hidden"
                  stackId="wf"
                  fill="transparent"
                  isAnimationActive={false}
                />
                {/* Visible bar — colored per type in the live state */}
                <Bar dataKey="value" stackId="wf" isAnimationActive={false}>
                  {SUPPLY_STUB.map((_, i) => (
                    <Cell key={i} fill="var(--color-border)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Pending overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                background: 'rgba(10,10,10,0.78)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-amber)',
                  letterSpacing: '0.09em',
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
                  textAlign: 'center',
                }}
              >
                EIA STEO · SUPPLY / DEMAND BALANCE NOT YET INTEGRATED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatCard label="SURPLUS" value="—" unit="MBD" note="PENDING" size="md" />
        <StatCard label="CALL ON OPEC+" value="—" unit="MBD" note="PENDING" size="md" />
      </div>
    </Panel>
  )
}
