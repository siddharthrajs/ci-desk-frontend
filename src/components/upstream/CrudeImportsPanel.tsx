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
import { useCrudeImports } from '../../hooks/useApiData'
import { ApiError } from '../../types/api'

function fmtUtcTime(iso: string) {
  return (
    new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC'
  )
}

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

export function CrudeImportsPanel() {
  const { data, isLoading, error } = useCrudeImports()

  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  const chartData = (data?.top_origins ?? []).map(o => ({
    name:    o.country.toUpperCase().slice(0, 12),
    value:   o.volume_mbd,
    isCanada: o.country.toLowerCase().includes('canada'),
  }))

  const barHeight = Math.max(220, chartData.length * 28)

  return (
    <Panel
      title="CRUDE IMPORTS BY ORIGIN"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA MONTHLY</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      <div style={{ padding: '14px 18px 18px' }}>

        {isLoading && !data ? (
          <>
            <Skel h={14} w={180} />
            <div style={{ marginTop: 14 }}>
              <Skel h={barHeight} />
            </div>
          </>
        ) : error ? (
          <div style={{ height: barHeight + 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
              DATA UNAVAILABLE
              {error instanceof ApiError ? ` · HTTP ${(error as ApiError).status}` : ''}
            </span>
          </div>
        ) : (
          <>
            {/* Total stat */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                TOTAL IMPORTS
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {data?.total_imports_mbd != null ? data.total_imports_mbd.toFixed(1) : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>MBD</span>
            </div>

            {/* Horizontal bar chart */}
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={barHeight}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  barSize={14}
                  margin={{ top: 0, right: 40, bottom: 4, left: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 'dataMax']}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v.toFixed(1)}
                    tickCount={5}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={82}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--color-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 9px' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                    labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 10, marginBottom: 2 }}
                    formatter={(v: number) => [`${v.toFixed(2)} MBD`, 'IMPORTS']}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Bar dataKey="value" isAnimationActive={false} radius={[0, 2, 2, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isCanada ? '#f5a623' : '#26a69a'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: barHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-elevated)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.07em' }}>
                  NO IMPORT DATA
                </span>
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, background: '#f5a623', opacity: 0.8 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>CANADA (DOMINANT)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, background: '#26a69a', opacity: 0.8 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>OTHER ORIGINS</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  )
}
