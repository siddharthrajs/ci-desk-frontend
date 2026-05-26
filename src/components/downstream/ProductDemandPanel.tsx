import { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { ProductDemandResponse } from '../../types/api'
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

function fmtDate(dateStr: string) {
  const [y, m] = dateStr.split('-')
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${MONTHS[+m]} '${y.slice(2)}`
}

const ROWS = [
  { key: 'gasoline'   as const, label: 'GASOLINE',     color: '#f5a623' },
  { key: 'distillate' as const, label: 'DISTILLATE',   color: '#3dd6c4' },
  { key: 'jet'        as const, label: 'JET FUEL',     color: '#888888' },
  { key: 'total'      as const, label: 'TOTAL PETRO',  color: '#9a9a9a' },
]

interface Props {
  data: ProductDemandResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function ProductDemandPanel({ data, isLoading, error }: Props) {
  const chartData = useMemo(() => {
    if (!data) return []
    const gas  = data.gasoline.history
    const dist = data.distillate.history
    // Merge by date, oldest-first
    const dateSet = new Set([...gas.map(p => p.date), ...dist.map(p => p.date)])
    const gasIdx  = Object.fromEntries(gas.map(p => [p.date, p.value]))
    const distIdx = Object.fromEntries(dist.map(p => [p.date, p.value]))
    return [...dateSet].sort().map(date => ({
      label: fmtDate(date),
      gasoline:   gasIdx[date]  ?? null,
      distillate: distIdx[date] ?? null,
    }))
  }, [data])

  const tickInterval = Math.max(1, Math.floor((chartData.length - 1) / 7))

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROWS.map(r => <Skel key={r.key} h={44} />)}
          <Skel h={150} />
        </div>
      ) : error ? (
        <div
          style={{
            padding: '24px 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-bear)',
            letterSpacing: '0.08em',
          }}
        >
          DATA UNAVAILABLE
          {error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 4 stat rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ROWS.map(r => {
              const series = data?.[r.key]
              const avg = series?.current_4wk_avg ?? null
              const yoy = series?.yoy_pct ?? null
              const isPos = yoy != null && yoy > 0
              const yoyColor = yoy == null
                ? 'var(--color-text-tertiary)'
                : isPos ? 'var(--color-bull)' : 'var(--color-bear)'

              return (
                <div
                  key={r.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 3,
                        height: 14,
                        background: r.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {r.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {avg != null ? avg.toFixed(2) : '—'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                      MBD
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: yoyColor }}>
                      {yoy != null
                        ? `${yoy > 0 ? '▲ +' : '▼ '}${yoy.toFixed(1)}% YoY`
                        : 'YoY —'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 2Y area chart — gasoline + distillate */}
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
                  display: 'flex',
                  gap: 12,
                }}
              >
                {[
                  { color: '#f5a623', label: 'GASOLINE (L)' },
                  { color: '#3dd6c4', label: 'DISTILLATE (R)' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 12, height: 2, background: l.color, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 42, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    interval={tickInterval}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v.toFixed(1)}
                    width={30}
                    tickCount={4}
                    domain={[6, 10]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v.toFixed(1)}
                    width={30}
                    tickCount={4}
                    domain={[3, 5]}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-border-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
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
                    formatter={(v: unknown, name: unknown) => {
                      if (v == null) return ['—', name as string]
                      return [`${(v as number).toFixed(2)} MBD`, name as string]
                    }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="gasoline"
                    name="GASOLINE"
                    stroke="#f5a623"
                    strokeWidth={1.5}
                    fill="rgba(245,166,35,0.08)"
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="distillate"
                    name="DISTILLATE"
                    stroke="#3dd6c4"
                    strokeWidth={1.5}
                    fill="rgba(61,214,196,0.08)"
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={{ r: 3, fill: '#3dd6c4', stroke: '#0a0a0a', strokeWidth: 1 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
