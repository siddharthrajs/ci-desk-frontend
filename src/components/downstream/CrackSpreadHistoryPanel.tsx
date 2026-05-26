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
import type { CrackSpreadsResponse } from '../../types/api'
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

const LINES = [
  { key: 'crack_321' as const,  label: '3-2-1',       color: '#3dd6c4' },
  { key: 'crack_rbob' as const, label: 'RBOB CRACK',  color: '#f5a623' },
  { key: 'crack_ho' as const,   label: 'HO CRACK',    color: '#e5484d' },
]

interface Props {
  data: CrackSpreadsResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function CrackSpreadHistoryPanel({ data, isLoading, error }: Props) {
  const chartData = useMemo(() => {
    if (!data?.history_90d?.length) return []
    // history_90d is oldest-first from the backend
    return data.history_90d.map(pt => ({
      label: fmtDate(pt.date),
      crack_321:  pt.crack_321,
      crack_rbob: pt.crack_rbob,
      crack_ho:   pt.crack_ho,
    }))
  }, [data])

  const hasData = chartData.length > 0
  const tickInterval = Math.max(1, Math.floor((chartData.length - 1) / 6))

  return (
    <Panel
      title="CRACK SPREAD HISTORY"
      subtitle="$/BBL · DAILY SPOT"
      headerRight={
        <Badge variant="muted">EIA SPOT · 90D</Badge>
      }
    >
      {isLoading && !data ? (
        <Skel h={220} />
      ) : error ? (
        <div
          style={{
            height: 220,
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
            DATA UNAVAILABLE
            {error instanceof ApiError ? ` · HTTP ${error.status}` : ''}
          </span>
        </div>
      ) : !hasData ? (
        <div
          style={{
            height: 220,
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
          <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
            {LINES.map(l => (
              <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: l.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={190}>
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
                formatter={(v: unknown, name: unknown) => {
                  if (v == null) return ['—', name as string]
                  return [`$${(v as number).toFixed(2)}`, name as string]
                }}
                wrapperStyle={{ outline: 'none' }}
              />
              {LINES.map(l => (
                <Line
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  name={l.label}
                  stroke={l.color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 3, fill: l.color, stroke: '#0a0a0a', strokeWidth: 1 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
