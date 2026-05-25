import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { DownstreamResponse } from '../../types/api'
import type { SeriesPoint } from '../../types/api'
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

function fmtDate(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${MONTHS[+m]} ${+d}`
}

function avgLatest(series: SeriesPoint[]): number | null {
  return series[0]?.value ?? null
}

interface Props {
  data: DownstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function RefineryUtilizationHistoryPanel({ data, isLoading, error }: Props) {
  const util = data?.refinery_util_history

  // Derive national as simple avg of PADD 1-5 by period
  const chartData = useMemo(() => {
    if (!util) return []

    const padds = [util.padd1, util.padd2, util.padd3, util.padd4, util.padd5]

    // Build period index across all PADDs
    const periodSet = new Set(padds.flatMap(s => s.map(p => p.period)))

    const idx: Record<string, Record<string, number>> = {}
    ;[
      [util.padd1, 'p1'],
      [util.padd2, 'p2'],
      [util.padd3, 'p3'],
      [util.padd4, 'p4'],
      [util.padd5, 'p5'],
    ].forEach(([series, key]) => {
      for (const pt of series as SeriesPoint[]) {
        if (!idx[pt.period]) idx[pt.period] = {}
        idx[pt.period][key as string] = pt.value
      }
    })

    return [...periodSet]
      .sort()
      .map(period => {
        const vals = Object.values(idx[period] ?? {}).filter(v => v != null)
        const natEst = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
        return {
          label: fmtDate(period),
          natEst,
          padd3: idx[period]?.p3 ?? null,
        }
      })
  }, [util])

  const padd3Latest = util ? avgLatest(util.padd3) : null
  const pointCount = chartData.length

  return (
    <Panel
      title="REFINERY UTILIZATION HISTORY"
      subtitle="CAPACITY UTILIZATION % · NATIONAL EST. + PADD 3"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA WEEKLY · {pointCount}WK</Badge>
          <Badge
            variant="muted"
            style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,166,35,0.3)' }}
          >
            5Y BAND PENDING
          </Badge>
        </>
      }
    >
      <div style={{ padding: '14px 18px 18px' }}>
        {/* KPI row */}
        {!error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'PADD 3 GULF COAST', value: padd3Latest },
              { label: 'NATIONAL (EST.)', value: chartData[chartData.length - 1]?.natEst ?? null },
            ].map(c => (
              <div
                key={c.label}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  padding: '10px 12px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                {isLoading && !data ? (
                  <div style={{ height: 22, background: 'var(--color-bg-elevated)', animation: 'pulse 1.4s ease-in-out infinite', width: '60%' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                      {c.value != null ? c.value.toFixed(1) : '—'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {isLoading && !data ? (
          <Skel h={160} />
        ) : error ? (
          <div
            style={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
              FETCH FAILED
              {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
            </span>
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.07em' }}>
              NO DATA
            </span>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              {[
                { color: '#f5a623', label: 'NAT EST.' },
                { color: '#3dd6c4', label: 'PADD 3' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 18, height: 2, background: l.color, display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
                    {l.label}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 18, height: 6, background: 'var(--color-border-muted)', opacity: 0.4, display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
                  5Y BAND PENDING
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={150}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor(chartData.length / 7)}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                  width={38}
                  tickCount={4}
                  domain={['auto', 'auto']}
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
                  formatter={(v: unknown, name: unknown) => [`${(v as number).toFixed(1)}%`, name as string]}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="natEst"
                  name="NAT EST."
                  stroke="#f5a623"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                  activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="padd3"
                  name="PADD 3"
                  stroke="#3dd6c4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                  activeDot={{ r: 3, fill: '#3dd6c4', stroke: '#0a0a0a', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Panel>
  )
}
