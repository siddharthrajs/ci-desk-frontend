import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from 'recharts'
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

function Skel({ w, h = 10 }: { w?: number; h?: number }) {
  return (
    <div
      style={{
        width: w ?? '80%',
        height: h,
        background: 'var(--color-bg-elevated)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

// Flat stub bars — clearly placeholder, not real compliance data
const COMPLIANCE_STUB = ['SAU', 'UAE', 'IRQ', 'KWT', 'RUS', 'NGA', 'GAB', 'COG'].map(
  name => ({ name, v: 40 }),
)

const TH = {
  padding: '6px 12px 7px',
  fontFamily: 'var(--font-sans)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-tertiary)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap' as const,
}

const TD = {
  padding: '9px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap' as const,
  verticalAlign: 'middle' as const,
}

interface Props {
  data: UpstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function OpecMonitorPanel({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null
  const opecPending = !data || !data.opec.available

  return (
    <Panel
      title="OPEC+ PRODUCTION MONITOR"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">SOURCE · MOMR</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      {/* ── Member DataTable ─────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {(
                [
                  ['COUNTRY', 'left'],
                  ['QUOTA MBD', 'right'],
                  ['PROD MBD', 'right'],
                  ['QOQ Δ', 'right'],
                  ['COMPL %', 'right'],
                  ['30D', 'right'],
                ] as [string, 'left' | 'right'][]
              ).map(([label, align]) => (
                <th key={label} style={{ ...TH, textAlign: align }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td style={TD}>
                    <Skel w={140} />
                  </td>
                  {[56, 56, 46, 46, 72].map((w, j) => (
                    <td key={j} style={{ ...TD, textAlign: 'right' }}>
                      <Skel w={w} />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ ...TD, padding: '28px 16px', textAlign: 'center', color: 'var(--color-bear)' }}
                >
                  FETCH FAILED
                  {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
                </td>
              </tr>
            ) : opecPending ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: '28px 16px', borderBottom: '1px solid var(--color-border)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
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
                        fontSize: 10,
                        color: 'var(--color-text-tertiary)',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                      }}
                    >
                      OPEC MOMR PDF · MEMBER-LEVEL PRODUCTION REQUIRES MANUAL INTEGRATION
                    </span>
                  </div>
                </td>
              </tr>
            ) : null /* live rows wired here when opec.available === true */}

            {/* OPEC+ TOTAL summary row */}
            {!isLoading && !error && (
              <tr
                style={{
                  background: 'var(--color-bg-hover)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <td
                  style={{
                    ...TD,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  OPEC+ TOTAL
                </td>
                {[0, 1, 2, 3, 4].map(i => (
                  <td
                    key={i}
                    style={{
                      ...TD,
                      textAlign: 'right',
                      fontWeight: 700,
                      color: 'var(--color-text-tertiary)',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    —
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footnote ─────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '7px 14px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.07em',
          }}
        >
          * EXEMPT FROM QUOTAS · IRAN, VENEZUELA, LIBYA
        </span>
      </div>

      {/* ── Compliance section ────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
            }}
          >
            COMPLIANCE BY MEMBER
          </span>
          <Badge
            variant="muted"
            style={{
              color: 'var(--color-amber)',
              borderColor: 'rgba(245,166,35,0.3)',
            }}
          >
            PENDING · AWAITING MOMR
          </Badge>
        </div>

        {/* Compliance bar chart — stub bars while data source is pending */}
        <div style={{ height: 72, marginBottom: 14 }}>
          {isLoading && !data ? (
            <Skel h={72} />
          ) : (
            <ResponsiveContainer width="100%" height={72}>
              <BarChart
                data={COMPLIANCE_STUB}
                barSize={16}
                margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    fill: 'var(--color-text-tertiary)',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="v" isAnimationActive={false}>
                  {COMPLIANCE_STUB.map((_, i) => (
                    <Cell key={i} fill="var(--color-border)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <StatCard label="GROUP AVG" value="—" note="PENDING" size="md" />
          <StatCard label="CUTS ACTIVE" value="—" note="PENDING" size="md" />
          <StatCard label="NEXT MTG" value="—" note="PENDING" size="md" />
        </div>
      </div>
    </Panel>
  )
}
