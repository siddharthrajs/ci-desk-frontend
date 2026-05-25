import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { DownstreamResponse } from '../../types/api'
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

interface Props {
  data: DownstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function CrackSpreadHistoryPanel({ data, isLoading, error }: Props) {
  const chartData = useMemo(() => {
    const cs = data?.crack_spreads
    if (!cs) return []

    // All three series newest-first; merge by period oldest-first
    const periodSet = new Set([
      ...cs.three_two_one.map(p => p.period),
      ...cs.rbob_crack.map(p => p.period),
      ...cs.ho_crack.map(p => p.period),
    ])

    const idx321 = Object.fromEntries(cs.three_two_one.map(p => [p.period, p.value]))
    const idxRBOB = Object.fromEntries(cs.rbob_crack.map(p => [p.period, p.value]))
    const idxHO = Object.fromEntries(cs.ho_crack.map(p => [p.period, p.value]))

    return [...periodSet]
      .sort()
      .map(period => ({
        label: fmtDate(period),
        wti321: idx321[period] ?? null,
        rbob: idxRBOB[period] ?? null,
        ho: idxHO[period] ?? null,
      }))
  }, [data])

  const hasData = chartData.length > 0

  return (
    <Panel
      title="CRACK SPREAD HISTORY"
      subtitle="$/BBL · DAILY SPOT"
      headerRight={
        <Badge variant="muted">EIA SPOT · 12WK</Badge>
      }
    >
      {isLoading && !data ? (
        <Skel h={200} />
      ) : error ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-elevated)',
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
      ) : !hasData ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-elevated)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.07em',
            }}
          >
            NO DATA
          </span>
        </div>
      ) : (
        <div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
            {[
              { color: '#f5a623', label: 'WTI 3-2-1' },
              { color: '#3dd6c4', label: 'RBOB CRACK' },
              { color: '#e5484d', label: 'HO CRACK' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 20,
                    height: 2,
                    background: l.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(0)}`}
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
                formatter={(v: unknown, name: unknown) => [`$${(v as number).toFixed(2)}`, name as string]}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend hide />
              <Line
                type="monotone"
                dataKey="wti321"
                name="WTI 3-2-1"
                stroke="#f5a623"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="rbob"
                name="RBOB CRACK"
                stroke="#3dd6c4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 3, fill: '#3dd6c4', stroke: '#0a0a0a', strokeWidth: 1 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="ho"
                name="HO CRACK"
                stroke="#e5484d"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 3, fill: '#e5484d', stroke: '#0a0a0a', strokeWidth: 1 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
