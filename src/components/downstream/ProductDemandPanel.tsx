import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
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

function computeYoy(series: SeriesPoint[]): number | null {
  const current = series[0]?.value
  // Weekly data, ~52 observations per year
  const yearAgo = series[51]?.value ?? series[series.length - 1]?.value
  if (current == null || yearAgo == null || yearAgo === 0) return null
  return ((current - yearAgo) / yearAgo) * 100
}

const PRODUCTS = [
  { key: 'gasoline' as const,  label: 'GASOLINE',   color: '#f5a623' },
  { key: 'distillate' as const, label: 'DISTILLATE', color: '#3dd6c4' },
  { key: 'jet' as const,       label: 'JET FUEL',   color: '#888888' },
]

interface Props {
  data: DownstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function ProductDemandPanel({ data, isLoading, error }: Props) {
  const demand = data?.product_demand

  const kpiRows = useMemo(() => {
    if (!demand) return null
    return PRODUCTS.map(p => {
      const series = demand[p.key]
      const current = series[0]?.value ?? null
      const yoy = computeYoy(series)
      return { ...p, current, yoy }
    })
  }, [demand])

  // Bar chart: latest 12 weekly observations for each product, merged by period
  const chartData = useMemo(() => {
    if (!demand) return []
    const slice = (s: SeriesPoint[]) => [...s].reverse().slice(-12)
    const gas  = slice(demand.gasoline)
    const dist = slice(demand.distillate)
    const jet  = slice(demand.jet)

    const periodSet = new Set([
      ...gas.map(p => p.period),
      ...dist.map(p => p.period),
      ...jet.map(p => p.period),
    ])

    const idxGas  = Object.fromEntries(gas.map(p => [p.period, p.value]))
    const idxDist = Object.fromEntries(dist.map(p => [p.period, p.value]))
    const idxJet  = Object.fromEntries(jet.map(p => [p.period, p.value]))

    return [...periodSet].sort().map(period => {
      const [, m, d] = period.split('-')
      const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      return {
        label: `${MONTHS[+m]} ${+d}`,
        gasoline:   idxGas[period]  ?? null,
        distillate: idxDist[period] ?? null,
        jet:        idxJet[period]  ?? null,
      }
    })
  }, [demand])

  return (
    <Panel
      title="PRODUCT DEMAND"
      subtitle="4-WEEK AVG PRODUCT SUPPLIED · MBD"
      headerRight={
        <>
          <Badge variant="muted">EIA WEEKLY</Badge>
          <Badge variant="muted">DEMAND PROXY</Badge>
        </>
      }
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRODUCTS.map(p => <Skel key={p.key} h={48} />)}
          <Skel h={130} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {kpiRows?.map(p => {
              const isPos = p.yoy != null && p.yoy > 0
              const yoyColor = p.yoy == null
                ? 'var(--color-text-tertiary)'
                : isPos
                ? 'var(--color-bull)'
                : 'var(--color-bear)'

              return (
                <div
                  key={p.key}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    padding: '10px 12px',
                    borderTop: `2px solid ${p.color}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 5,
                    }}
                  >
                    {p.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {p.current != null ? (p.current / 1000).toFixed(2) : '—'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                      MBD
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: yoyColor,
                      marginTop: 3,
                    }}
                  >
                    {p.yoy != null
                      ? `${p.yoy > 0 ? '+' : ''}${p.yoy.toFixed(1)}% YoY`
                      : 'YoY —'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bar chart — last 12 weeks */}
          {chartData.length > 0 && (
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
                12-WEEK ROLLING · KBPD
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
                  barGap={2}
                  barSize={8}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}M`}
                    width={34}
                    tickCount={4}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-bg-hover)' }}
                    contentStyle={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      padding: '5px 9px',
                    }}
                    itemStyle={{ color: 'var(--color-text-secondary)' }}
                    labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 10, marginBottom: 2 }}
                    formatter={(v: unknown, name: unknown) => [`${((v as number) / 1000).toFixed(2)} MBD`, (name as string).toUpperCase()]}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Bar dataKey="gasoline" name="gasoline" isAnimationActive={false} fill="#f5a623" opacity={0.85} />
                  <Bar dataKey="distillate" name="distillate" isAnimationActive={false} fill="#3dd6c4" opacity={0.85} />
                  <Bar dataKey="jet" name="jet" isAnimationActive={false} fill="#888888" opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>

              {/* Chart legend */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {PRODUCTS.map(p => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: p.color, display: 'inline-block', opacity: 0.85 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
