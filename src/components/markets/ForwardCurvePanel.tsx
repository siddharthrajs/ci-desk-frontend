import type { CSSProperties } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Panel, Badge } from '../ui'
import type { CurvePoint } from '../../hooks/useMarketWebSocket'

interface ForwardCurvePanelProps {
  product: string
  displayName?: string
  curve: CurvePoint[]
  color: string
  unit: string
  onRemove?: () => void
}

function fmt(v: number | null, decimals = 2): string {
  if (v === null) return '—'
  return v.toFixed(decimals)
}

const MONO: CSSProperties = { fontFamily: 'var(--font-mono)' }

function CurveTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number | null; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid var(--color-border)',
      padding: '6px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--color-text-primary)',
    }}>
      <div style={{ marginBottom: 4, letterSpacing: '0.06em' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, lineHeight: 1.8 }}>
          {p.name.toUpperCase()}: {p.value !== null ? Number(p.value).toFixed(2) : '—'}
        </div>
      ))}
    </div>
  )
}

export function ForwardCurvePanel({ product, displayName, curve, color, unit, onRemove }: ForwardCurvePanelProps) {
  const name = displayName ?? product.toUpperCase()
  const hasData = curve.some(p => p.mid !== null || p.bid !== null || p.ask !== null)
  const visibleRows = curve.filter(p => p.bid !== null || p.ask !== null || p.mid !== null || p.settlement !== null).slice(0, 10)

  const liveBadge = (
    <Badge variant={hasData ? 'bull' : 'muted'}>
      LIVE {hasData ? '●' : '○'}
    </Badge>
  )
  const unitBadge = <Badge variant="muted">{unit}</Badge>
  const closeButton = onRemove ? (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove curve"
      title="Remove curve"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        lineHeight: 1,
        width: 20,
        height: 20,
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      ✕
    </button>
  ) : null

  return (
    <Panel
      title={name}
      headerRight={<>{liveBadge}{unitBadge}{closeButton}</>}
      noPadding
    >
      <div style={{ padding: '12px 12px 0' }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={curve} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                width={50}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CurveTooltip />} />
              <Line
                type="monotone"
                dataKey="mid"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="bid"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.5}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="ask"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.5}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...MONO,
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.1em',
          }}>
            AWAITING FEED
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}>
          <thead>
            <tr style={{ borderTop: '1px solid var(--color-border)' }}>
              {['TENOR', 'BID', 'ASK', 'MID', 'SETT', 'STATE'].map(h => (
                <th key={h} style={{
                  padding: '4px 8px',
                  textAlign: 'right',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  borderBottom: '1px solid var(--color-border)',
                  ...(h === 'TENOR' ? { textAlign: 'left' } : {}),
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.07em',
                }}>
                  —
                </td>
              </tr>
            ) : (
              visibleRows.map((row, i) => (
                <tr key={row.tenor} style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-elevated)',
                }}>
                  <td style={{ padding: '3px 8px', color: 'var(--color-text-secondary)', textAlign: 'left', letterSpacing: '0.05em' }}>
                    {row.label}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-bull)' }}>
                    {fmt(row.bid)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-amber)' }}>
                    {fmt(row.ask)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-text-primary)' }}>
                    {fmt(row.mid)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                    {fmt(row.settlement)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right' }}>
                    {row.state === 'O' ? (
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#26a69a' }} />
                    ) : row.state === 'C' ? (
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#ef5350' }} />
                    ) : (
                      <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
