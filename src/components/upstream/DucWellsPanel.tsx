import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import { useDucWells } from '../../hooks/useApiData'
import { ApiError } from '../../types/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function fmtMonthShort(dateStr: string) {
  const [, mm] = dateStr.split('-')
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return MONTHS[+mm] ?? mm
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

// Basin display config — order and labels
const BASIN_ROWS: Array<{ key: string; label: string }> = [
  { key: 'permian',     label: 'PERMIAN'     },
  { key: 'eagle_ford',  label: 'EAGLE FORD'  },
  { key: 'bakken',      label: 'BAKKEN'      },
  { key: 'niobrara',    label: 'DJ NIOBRARA' },
  { key: 'haynesville', label: 'HAYNESVILLE' },
  { key: 'appalachia',  label: 'APPALACHIA'  },
  { key: 'anadarko',    label: 'ANADARKO'    },
]

// ── Main component ────────────────────────────────────────────────────────────

export function DucWellsPanel() {
  const { data, isLoading, error } = useDucWells()

  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  const historyChartData = useMemo(() => {
    if (!data?.history?.length) return []
    return [...data.history].reverse().map(pt => ({
      label: fmtMonthShort(pt.date),
      total: pt.total ?? 0,
    }))
  }, [data])

  const signal = data?.signal ?? 'NEUTRAL'
  const signalColor =
    signal === 'DRAW'  ? 'var(--color-bear)' :
    signal === 'BUILD' ? 'var(--color-bull)' :
                         'var(--color-amber)'
  const signalBorderColor =
    signal === 'DRAW'  ? 'rgba(239,83,80,0.35)' :
    signal === 'BUILD' ? 'rgba(38,166,154,0.35)' :
                         'rgba(245,166,35,0.35)'
  const signalArrow =
    signal === 'DRAW' ? '▼' : signal === 'BUILD' ? '▲' : ''

  return (
    <Panel
      title="DUC WELLS · LEADING INDICATOR"
      headerRight={
        <>
          <Badge variant="muted">EIA DPR · MONTHLY</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <Skel h={52} />
            <Skel h={52} />
            <Skel h={52} />
          </div>
          <Skel h={20} w={100} />
          <Skel h={96} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BASIN_ROWS.map(b => <Skel key={b.key} h={11} />)}
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: '32px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
            DATA UNAVAILABLE
            {error instanceof ApiError ? ` · HTTP ${(error as ApiError).status}` : ''}
          </span>
        </div>
      ) : (
        <>
          {/* ── Top row — 3 stat cards ────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
            {/* TOTAL DUCs */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 8px', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                TOTAL DUCs
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, lineHeight: 1, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {data?.total_duc != null ? data.total_duc.toLocaleString() : '—'}
              </div>
            </div>

            {/* MoM CHANGE */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 8px', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                MoM CHANGE
              </div>
              {data?.mom_change != null ? (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, lineHeight: 1, color: data.mom_change < 0 ? 'var(--color-bear)' : data.mom_change > 0 ? 'var(--color-bull)' : 'var(--color-text-tertiary)' }}>
                    {data.mom_change > 0 ? '+' : ''}{data.mom_change.toLocaleString()}
                  </div>
                  {data.mom_pct != null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      ({data.mom_pct > 0 ? '+' : ''}{data.mom_pct.toFixed(1)}%)
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--color-text-tertiary)' }}>—</div>
              )}
            </div>

            {/* YoY CHANGE */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                YoY CHANGE
              </div>
              {data?.yoy_change != null ? (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, lineHeight: 1, color: data.yoy_change < 0 ? 'var(--color-bear)' : data.yoy_change > 0 ? 'var(--color-bull)' : 'var(--color-text-tertiary)' }}>
                    {data.yoy_change > 0 ? '+' : ''}{data.yoy_change.toLocaleString()}
                  </div>
                  {data.yoy_pct != null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      ({data.yoy_pct > 0 ? '+' : ''}{data.yoy_pct.toFixed(1)}%)
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--color-text-tertiary)' }}>—</div>
              )}
            </div>
          </div>

          {/* ── Signal badge ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <Badge
              variant="muted"
              style={{ color: signalColor, borderColor: signalBorderColor, letterSpacing: '0.08em', fontSize: 12, padding: '4px 12px' }}
            >
              {signal}{signalArrow ? ` ${signalArrow}` : ''}
            </Badge>
          </div>

          {/* ── 36M history chart ─────────────────────────────────────── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
              TOTAL DUC HISTORY · 36M
            </div>
            {historyChartData.length > 0 ? (
              <div style={{ height: 96 }}>
                <ResponsiveContainer width="100%" height={96}>
                  <AreaChart data={historyChartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="ducGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#26a69a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#26a69a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} interval={8} />
                    <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} width={34} tickCount={4} domain={['auto', 'auto']} />
                    <Tooltip
                      cursor={{ stroke: 'var(--color-border-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
                      contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 9px' }}
                      itemStyle={{ color: 'var(--color-text-primary)' }}
                      labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 10, marginBottom: 2 }}
                      formatter={(v: number) => [v.toLocaleString(), 'DUC WELLS']}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#f5a623" strokeWidth={1.5} fill="url(#ducGrad)" dot={false} isAnimationActive={false} activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-elevated)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-amber)', letterSpacing: '0.08em' }}>
                  AWAITING DATA
                </span>
              </div>
            )}
          </div>

          {/* ── Basin breakdown ───────────────────────────────────────── */}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
              BASIN BREAKDOWN
            </div>
            {BASIN_ROWS.map((row, i) => {
              const basin = data?.basins?.[row.key]
              const current   = basin?.current    ?? null
              const momChange = basin?.mom_change  ?? null
              const isPos = momChange != null && momChange > 0
              const isNeg = momChange != null && momChange < 0
              const changeColor = isPos ? 'var(--color-bull)' : isNeg ? 'var(--color-bear)' : 'var(--color-text-tertiary)'
              const arrow = isPos ? '▲' : isNeg ? '▼' : ''

              return (
                <div
                  key={row.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: i < BASIN_ROWS.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>
                    {row.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-primary)', minWidth: 50, textAlign: 'right' }}>
                      {current != null ? current.toLocaleString() : '—'}
                    </span>
                    {momChange != null ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: changeColor, minWidth: 46, textAlign: 'right' }}>
                        {arrow} {momChange > 0 ? '+' : ''}{momChange}
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', minWidth: 46, textAlign: 'right' }}>—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Panel>
  )
}
