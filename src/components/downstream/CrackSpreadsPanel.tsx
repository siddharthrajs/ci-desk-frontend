import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { CrackSpreadsResponse } from '../../types/api'
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

const SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  ELEVATED:  { color: 'var(--color-bull)',  bg: 'rgba(61,214,196,0.1)' },
  DEPRESSED: { color: 'var(--color-bear)',  bg: 'rgba(229,72,77,0.1)' },
  NEUTRAL:   { color: 'var(--color-amber)', bg: 'rgba(245,166,35,0.1)' },
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
  current: number | null
  wow: number | null
  z: number | null
  signal: string
}

interface Props {
  data: CrackSpreadsResponse | undefined
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
    {
      name: '3-2-1 CRACK',
      current: data?.crack_321 ?? null,
      wow: data?.wow_changes.crack_321 ?? null,
      z: data?.z_scores.crack_321 ?? null,
      signal: data?.signals.crack_321 ?? 'NEUTRAL',
    },
    {
      name: 'RBOB CRACK',
      current: data?.crack_rbob ?? null,
      wow: data?.wow_changes.crack_rbob ?? null,
      z: data?.z_scores.crack_rbob ?? null,
      signal: data?.signals.crack_rbob ?? 'NEUTRAL',
    },
    {
      name: 'HO CRACK',
      current: data?.crack_ho ?? null,
      wow: data?.wow_changes.crack_ho ?? null,
      z: data?.z_scores.crack_ho ?? null,
      signal: data?.signals.crack_ho ?? 'NEUTRAL',
    },
    {
      name: 'BRENT-WTI',
      current: data?.brent_wti ?? null,
      wow: data?.wow_changes.brent_wti ?? null,
      z: data?.z_scores.brent_wti ?? null,
      signal: data?.signals.brent_wti ?? 'NEUTRAL',
    },
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
              {(['SPREAD', 'CURRENT $/BBL', 'WOW Δ', 'Z-SCORE', 'SIGNAL'] as const).map((h, i) => (
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
                  DATA UNAVAILABLE
                  {error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const sigStyle = SIGNAL_STYLE[row.signal] ?? SIGNAL_STYLE.NEUTRAL
                const wowColor = row.wow == null
                  ? 'var(--color-text-tertiary)'
                  : row.wow > 0
                  ? 'var(--color-bull)'
                  : 'var(--color-bear)'
                const zColor = row.z == null
                  ? 'var(--color-text-tertiary)'
                  : sigStyle.color

                return (
                  <tr
                    key={row.name}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Name */}
                    <td style={{ ...TD, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {row.name}
                    </td>

                    {/* Current */}
                    <td style={{ ...TD, textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {row.current != null ? `$${row.current.toFixed(2)}` : '—'}
                    </td>

                    {/* WoW */}
                    <td style={{ ...TD, textAlign: 'right', color: wowColor }}>
                      {row.wow != null ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: '0.75em' }}>{row.wow > 0 ? '▲' : '▼'}</span>
                          <span>{row.wow > 0 ? '+' : ''}{row.wow.toFixed(2)}</span>
                        </span>
                      ) : '—'}
                    </td>

                    {/* Z-score */}
                    <td style={{ ...TD, textAlign: 'right', color: zColor }}>
                      {row.z != null ? (row.z > 0 ? '+' : '') + row.z.toFixed(2) : '—'}
                    </td>

                    {/* Signal */}
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: sigStyle.color,
                          background: sigStyle.bg,
                          padding: '2px 6px',
                          borderRadius: 3,
                        }}
                      >
                        {row.signal}
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
          3-2-1 = (2×RBOB + 1×HO − 3×WTI) / 3 · Z-SCORE OVER 90 DAILY OBS
        </span>
      </div>
    </Panel>
  )
}
