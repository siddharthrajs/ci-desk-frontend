import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Panel, Badge } from '../ui'
import type { ProductCurves, CurvePoint } from '../../hooks/useMarketWebSocket'

interface SpreadCurvePanelProps {
  curves: ProductCurves
  chartHeight?: number
}

interface SpreadPoint {
  label: string
  wti_brent: number | null
  gasoil_crack: number | null
  ho_crack: number | null
}

function midByLabel(curve: CurvePoint[] | undefined): Record<string, number> {
  const out: Record<string, number> = {}
  if (!curve) return out
  for (const p of curve) {
    if (p.mid !== null) out[p.label] = p.mid
  }
  return out
}

function buildSpreads(curves: ProductCurves): SpreadPoint[] {
  const brentMids = midByLabel(curves['Brent']?.['OUTRIGHT'])
  const wtiMids = midByLabel(curves['WTI']?.['OUTRIGHT'])
  const gasoilMids = midByLabel(curves['Gasoil']?.['OUTRIGHT'])
  const hoMids = midByLabel(curves['HeatingOil']?.['OUTRIGHT'])

  const allLabels = Array.from(new Set([
    ...Object.keys(brentMids),
    ...Object.keys(wtiMids),
    ...Object.keys(gasoilMids),
    ...Object.keys(hoMids),
  ]))

  const TENOR_ORDER: Record<string, number> = {
    F: 1, G: 2, H: 3, J: 4, K: 5, M: 6,
    N: 7, Q: 8, U: 9, V: 10, X: 11, Z: 12,
  }
  function sortKey(label: string): number {
    const year = parseInt(label.slice(1), 10)
    return year * 100 + (TENOR_ORDER[label[0]] ?? 99)
  }

  allLabels.sort((a, b) => sortKey(a) - sortKey(b))

  return allLabels.map(label => {
    const brent = brentMids[label] ?? null
    const wti = wtiMids[label] ?? null
    const gasoil = gasoilMids[label] ?? null
    const ho = hoMids[label] ?? null

    const wti_brent = wti !== null && brent !== null ? wti - brent : null
    const gasoil_crack = gasoil !== null && brent !== null ? gasoil / 7.45 - brent : null
    const ho_crack = ho !== null && wti !== null ? ho * 42 - wti : null

    return { label, wti_brent, gasoil_crack, ho_crack }
  })
}

function SpreadTooltip({ active, payload, label }: {
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
          {p.name.replace(/_/g, ' ').toUpperCase()}: {p.value !== null ? Number(p.value).toFixed(2) : '—'}
        </div>
      ))}
    </div>
  )
}

const SPREAD_SERIES = [
  { key: 'wti_brent', label: 'WTI–Brent', color: '#00bcd4' },
  { key: 'gasoil_crack', label: 'Gasoil Crack', color: '#f5a623' },
  { key: 'ho_crack', label: 'HO Crack', color: '#ef5350' },
]

export function SpreadCurvePanel({ curves, chartHeight = 200 }: SpreadCurvePanelProps) {
  const data = buildSpreads(curves)
  const hasData = data.some(d => d.wti_brent !== null || d.gasoil_crack !== null || d.ho_crack !== null)

  const legend = (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {SPREAD_SERIES.map(s => (
        <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          {s.label}
        </span>
      ))}
    </div>
  )

  const headerRight = (
    <>
      {legend}
      <Badge variant="muted">$/BBL EQUIVALENT</Badge>
      <Badge variant={hasData ? 'bull' : 'muted'}>LIVE {hasData ? '●' : '○'}</Badge>
    </>
  )

  return (
    <Panel title="SPREAD & CRACK CURVES" headerRight={headerRight} noPadding>
      <div style={{ padding: '12px 12px 16px' }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
              <Tooltip content={<SpreadTooltip />} />
              <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="4 4" />
              {SPREAD_SERIES.map(s => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.1em',
          }}>
            AWAITING FEED
          </div>
        )}
      </div>
    </Panel>
  )
}
