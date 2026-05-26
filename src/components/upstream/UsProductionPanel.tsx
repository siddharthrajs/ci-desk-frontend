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
import { useUsProduction } from '../../hooks/useApiData'
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

function fmtDateShort(dateStr: string) {
  const parts = dateStr.split('-')
  const month = +parts[1]
  const day = +parts[2]
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${MONTHS[month]} ${day}`
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

function SubHeader({
  title,
  value,
  unit,
  wowPct,
  wowAbs,
  unavailable,
}: {
  title: string
  value: string
  unit?: string
  wowPct?: number | null
  wowAbs?: number | null
  unavailable?: boolean
}) {
  const isPos = wowPct != null && wowPct > 0
  const isNeg = wowPct != null && wowPct < 0
  const changeColor = wowPct == null
    ? 'var(--color-text-tertiary)'
    : isPos ? 'var(--color-bull)' : isNeg ? 'var(--color-bear)' : 'var(--color-text-tertiary)'
  const arrow = wowPct == null ? '' : isPos ? '▲' : isNeg ? '▼' : ''

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', paddingTop: 2 }}>
        {title}
      </span>
      <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, lineHeight: 1, color: unavailable ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
            {value}
          </span>
          {unit && !unavailable && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
              {unit}
            </span>
          )}
        </div>
        {unavailable ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-amber)', letterSpacing: '0.06em' }}>
            UNAVAILABLE
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
            {arrow && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: changeColor, lineHeight: 1 }}>{arrow}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: changeColor, lineHeight: 1 }}>
              {wowPct != null ? `${wowPct > 0 ? '+' : ''}${wowPct.toFixed(2)}%` : '—'}
            </span>
            {wowAbs != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', lineHeight: 1 }}>
                ({wowAbs > 0 ? '+' : ''}{wowAbs.toFixed(2)})
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', lineHeight: 1, marginLeft: 1 }}>
              WoW
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function UsProductionPanel() {
  const { data, isLoading, error } = useUsProduction()

  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  // Weekly chart — oldest → newest
  const weeklyChartData = useMemo(() => {
    if (!data?.weekly_history?.length) return []
    return [...data.weekly_history].reverse().map(p => ({
      label: fmtDateShort(p.date),
      value: p.value,
    }))
  }, [data])

  // Monthly PADD chart — oldest → newest, last 24 months
  const paddChartData = useMemo(() => {
    if (!data?.monthly_history?.length) return []
    return [...data.monthly_history].slice(0, 24).reverse().map(p => ({
      label: fmtMonthShort(p.date),
      padd3: p.padd3 ?? 0,
      gom:   p.gom   ?? 0,
      padd2: p.padd2 ?? 0,
    }))
  }, [data])

  const wowPct = data?.weekly_estimate_mbd != null && data?.weekly_wow_change != null
    ? (data.weekly_wow_change / (data.weekly_estimate_mbd - data.weekly_wow_change)) * 100
    : null

  return (
    <Panel
      title="US PRODUCTION & RIG ACTIVITY"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">EIA-914</Badge>
          <Badge variant="muted">EIA DPR</Badge>
          {updatedLabel && (
            <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
              UPDATED {updatedLabel}
            </Badge>
          )}
        </>
      }
    >
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── CRUDE PRODUCTION section ──────────────────────────────────── */}
        <div>
          {isLoading && !data ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <Skel h={11} w={200} />
                <Skel h={20} w={80} />
              </div>
              <Skel h={130} />
            </>
          ) : error ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-bear)', letterSpacing: '0.08em' }}>
                DATA UNAVAILABLE
                {error instanceof ApiError ? ` · HTTP ${(error as ApiError).status}` : ''}
              </span>
            </div>
          ) : (
            <>
              <SubHeader
                title="CRUDE PRODUCTION · MBD"
                value={data?.weekly_estimate_mbd != null ? data.weekly_estimate_mbd.toFixed(2) : '—'}
                unit="MBD"
                wowPct={wowPct}
                wowAbs={data?.weekly_wow_change ?? null}
              />
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={weeklyChartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f5a623" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} interval={8} />
                    <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v.toFixed(1)} width={36} tickCount={4} domain={['auto', 'auto']} />
                    <Tooltip
                      cursor={{ stroke: 'var(--color-border-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
                      contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 9px' }}
                      itemStyle={{ color: 'var(--color-text-primary)' }}
                      labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 10, marginBottom: 2 }}
                      formatter={(v: number) => [`${v.toFixed(2)} MBD`, 'PRODUCTION']}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#f5a623" strokeWidth={1.5} fill="url(#prodGrad)" dot={false} isAnimationActive={false} activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="divider" style={{ margin: 0 }} />

        {/* ── PRODUCTION BY REGION section ─────────────────────────────── */}
        <div>
          {isLoading && !data ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <Skel h={11} w={220} />
                <Skel h={14} w={140} />
              </div>
              <Skel h={110} />
            </>
          ) : error ? null : (
            <>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                  PRODUCTION BY REGION · MONTHLY
                </span>
                {/* Baker Hughes note */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>
                    BAKER HUGHES RIG COUNT
                  </span>
                  <Badge variant="muted" style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,166,35,0.3)', fontSize: 9 }}>
                    FEED UNAVAILABLE · USING EIA-914 ESTIMATE
                  </Badge>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                {[
                  { color: '#26a69a', label: 'PADD 3 GULF COAST' },
                  { color: '#f5a623', label: 'GOM OFFSHORE' },
                  { color: '#4db6ac', label: 'PADD 2 MIDWEST' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, background: color, opacity: 0.7 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 110 }}>
                {paddChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={110}>
                    <AreaChart data={paddChartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="p3Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#26a69a" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#26a69a" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gomGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f5a623" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f5a623" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="p2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4db6ac" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4db6ac" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} interval={5} />
                      <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v.toFixed(1)} width={32} tickCount={4} domain={[0, 'auto']} />
                      <Tooltip
                        cursor={{ stroke: 'var(--color-border-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
                        contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 9px' }}
                        labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 9, marginBottom: 2 }}
                        formatter={(v: number, name: string) => [
                          `${v.toFixed(2)} MBD`,
                          name === 'padd3' ? 'PADD 3' : name === 'gom' ? 'GOM' : 'PADD 2',
                        ]}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Area type="monotone" dataKey="padd3" stackId="1" stroke="#26a69a" strokeWidth={1.2} fill="url(#p3Grad)"   dot={false} isAnimationActive={false} />
                      <Area type="monotone" dataKey="gom"   stackId="1" stroke="#f5a623" strokeWidth={1.2} fill="url(#gomGrad)" dot={false} isAnimationActive={false} />
                      <Area type="monotone" dataKey="padd2" stackId="1" stroke="#4db6ac" strokeWidth={1.2} fill="url(#p2Grad)"   dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-elevated)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.07em' }}>
                      MONTHLY DATA LOADING…
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}
