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
import type { RefineryUtilizationResponse } from '../../types/api'
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
  const [, m] = dateStr.split('-')
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return MONTHS[+m]
}

interface Props {
  data: RefineryUtilizationResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function RefineryUtilizationHistoryPanel({ data, isLoading, error }: Props) {
  const chartData = useMemo(() => {
    if (!data?.history?.length) return []
    return data.history.map(pt => ({
      label: fmtDate(pt.date),
      national: pt.national,
      padd3: pt.padd3,
    }))
  }, [data])

  const hasData = chartData.length > 0
  const tickInterval = Math.max(1, Math.floor((chartData.length - 1) / 8))

  return (
    <Panel
      title="REFINERY UTILIZATION HISTORY"
      subtitle="CAPACITY UTILIZATION % · NATIONAL EST. + PADD 3"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA WEEKLY · {data?.history?.length ?? 0}WK</Badge>
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
              { label: 'PADD 3 GULF COAST', value: data?.padd3_current ?? null },
              { label: 'NATIONAL (EST.)',    value: data?.national_current ?? null },
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
              DATA UNAVAILABLE
              {error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
            </span>
          </div>
        ) : !hasData ? (
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
          <div>
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
              <LineChart data={chartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={tickInterval}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                  width={38}
                  tickCount={4}
                  domain={[70, 100]}
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
                    return [`${(v as number).toFixed(1)}%`, name as string]
                  }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="national"
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
