import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { DownstreamResponse, SeriesPoint } from '../../types/api'
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

function computeZScore(series: SeriesPoint[]): number | null {
  if (series.length < 3) return null
  const values = series.map(p => p.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance)
  if (std === 0) return null
  return (values[0] - mean) / std
}

function signalLabel(z: number | null): { label: string; color: string } {
  if (z == null) return { label: 'N/A', color: 'var(--color-text-tertiary)' }
  if (z > 1)  return { label: 'WIDE',    color: 'var(--color-bull)' }
  if (z < -1) return { label: 'TIGHT',   color: 'var(--color-bear)' }
  return       { label: 'NEUTRAL',         color: 'var(--color-amber)' }
}

const TH: React.CSSProperties = {
  padding: '6px 12px 7px',
  fontFamily: 'var(--font-sans)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
}

const TD: React.CSSProperties = {
  padding: '9px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
}

interface SpreadRow {
  name: string
  series: SeriesPoint[] | null
  pending?: boolean
}

interface Props {
  data: DownstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function CrackSpreadsPanel({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated
    ? new Date(data.last_updated).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
      }) + ' UTC'
    : null

  const rows: SpreadRow[] = [
    { name: 'WTI 3-2-1',    series: data?.crack_spreads.three_two_one ?? null },
    { name: 'BRENT 3-2-1',  series: null, pending: true },
    { name: 'RBOB CRACK',   series: data?.crack_spreads.rbob_crack ?? null },
    { name: 'HO CRACK',     series: data?.crack_spreads.ho_crack ?? null },
  ]

  return (
    <Panel
      title="CRACK SPREADS"
      subtitle="REFINING MARGINS · $/BBL"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA SPOT</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {(['SPREAD', 'CURRENT $/BBL', 'WoW Δ', 'Z-SCORE', 'SIGNAL'] as const).map((h, i) => (
                <th key={h} style={{ ...TH, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td style={TD}><Skel w={100} /></td>
                  {[70, 70, 60, 60].map((w, j) => (
                    <td key={j} style={{ ...TD, textAlign: 'right' }}><Skel w={w} /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ ...TD, padding: '24px 16px', textAlign: 'center', color: 'var(--color-bear)' }}
                >
                  FETCH FAILED
                  {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const latest = row.series?.[0]
                const current = latest?.value
                const wow = latest?.wow_change
                const wowPct = latest?.wow_pct_change
                const z = row.series ? computeZScore(row.series) : null
                const sig = signalLabel(z)

                const isPos = wow != null && wow > 0
                const wowColor = wow == null
                  ? 'var(--color-text-tertiary)'
                  : isPos
                  ? 'var(--color-bull)'
                  : 'var(--color-bear)'

                return (
                  <tr
                    key={row.name}
                    style={{ opacity: row.pending ? 0.45 : 1 }}
                    onMouseEnter={e => {
                      if (!row.pending) e.currentTarget.style.background = 'var(--color-bg-hover)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Name */}
                    <td
                      style={{
                        ...TD,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {row.name}
                      {row.pending && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color: 'var(--color-amber)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Current */}
                    <td style={{ ...TD, textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {current != null ? `$${current.toFixed(2)}` : '—'}
                    </td>

                    {/* WoW */}
                    <td style={{ ...TD, textAlign: 'right', color: wowColor }}>
                      {wow != null ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: '0.75em' }}>{wow > 0 ? '▲' : '▼'}</span>
                          <span>
                            {wow > 0 ? '+' : ''}{wow.toFixed(2)}
                          </span>
                          {wowPct != null && (
                            <span style={{ fontSize: '0.85em', color: 'var(--color-text-tertiary)', marginLeft: 2 }}>
                              ({wowPct > 0 ? '+' : ''}{wowPct.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Z-score */}
                    <td style={{ ...TD, textAlign: 'right', color: sig.color }}>
                      {z != null ? z.toFixed(2) : '—'}
                    </td>

                    {/* Signal */}
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: sig.color,
                          background: sig.label === 'WIDE'
                            ? 'rgba(61,214,196,0.1)'
                            : sig.label === 'TIGHT'
                            ? 'rgba(229,72,77,0.1)'
                            : sig.label === 'NEUTRAL'
                            ? 'rgba(245,166,35,0.1)'
                            : 'transparent',
                          padding: '2px 6px',
                          borderRadius: 3,
                        }}
                      >
                        {sig.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <div style={{ padding: '7px 12px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
          }}
        >
          3-2-1 = (2×RBOB + 1×HO − 3×WTI) / 3 · Z-SCORE OVER {data?.crack_spreads.three_two_one.length ?? 0} DAILY OBS
        </span>
      </div>
    </Panel>
  )
}
