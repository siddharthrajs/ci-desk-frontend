import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Panel } from '../ui/Panel'
import type { UpstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

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

// Stub country data (approximate 2025 production levels, MBD)
// Used to render the chart skeleton while source is pending.
// USA first (dominant/amber), rest teal, sorted descending.
const NON_OPEC_STUB = [
  { name: 'USA', value: 13.7 },
  { name: 'CANADA', value: 5.1 },
  { name: 'CHINA', value: 4.3 },
  { name: 'BRAZIL', value: 3.5 },
  { name: 'KAZAKH.', value: 1.9 },
  { name: 'NORWAY', value: 1.8 },
  { name: 'MEXICO', value: 1.8 },
  { name: 'UK', value: 0.9 },
]

interface Props {
  data: UpstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function NonOpecProductionPanel({ data, isLoading, error }: Props) {
  return (
    <Panel title="PRODUCTION BY COUNTRY · NON-OPEC" noPadding>
      <div style={{ padding: '14px 18px 18px' }}>
        {isLoading && !data ? (
          <Skel h={240} />
        ) : error ? (
          <div
            style={{
              height: 240,
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
          /* Pending — country-level non-OPEC production not yet in upstream endpoint.
             Stub horizontal bars show chart layout; overlay marks source as pending. */
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={NON_OPEC_STUB}
                barSize={14}
                margin={{ top: 4, right: 20, bottom: 4, left: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 16]}
                  tickCount={5}
                  tick={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    fill: 'var(--color-border-muted)',
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={68}
                  tick={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fill: 'var(--color-border-muted)',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="value" isAnimationActive={false}>
                  {NON_OPEC_STUB.map((_, i) => (
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
                background: 'rgba(10,10,10,0.80)',
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
                IEA / EIA · NON-OPEC COUNTRY-LEVEL PRODUCTION NOT YET INTEGRATED
              </span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
