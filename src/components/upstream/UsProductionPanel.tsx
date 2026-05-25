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
import type { UpstreamResponse } from '../../types/api'
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

// Parse YYYY-MM-DD without timezone shift
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

// ── Sub-section header: title left, current value + WoW right ────────────────

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
    : isPos
    ? 'var(--color-bull)'
    : isNeg
    ? 'var(--color-bear)'
    : 'var(--color-text-tertiary)'
  const arrow = wowPct == null ? '' : isPos ? '▲' : isNeg ? '▼' : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          paddingTop: 2,
        }}
      >
        {title}
      </span>

      <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
        {/* Current value */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1,
              color: unavailable ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
            }}
          >
            {value}
          </span>
          {unit && !unavailable && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-text-tertiary)',
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* WoW change */}
        {unavailable ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--color-amber)',
              letterSpacing: '0.06em',
            }}
          >
            UNAVAILABLE
          </span>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              justifyContent: 'flex-end',
              marginTop: 2,
            }}
          >
            {arrow && (
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: changeColor, lineHeight: 1 }}
              >
                {arrow}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: changeColor, lineHeight: 1 }}>
              {wowPct != null
                ? `${wowPct > 0 ? '+' : ''}${wowPct.toFixed(2)}%`
                : '—'}
            </span>
            {wowAbs != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', lineHeight: 1 }}>
                ({wowAbs > 0 ? '+' : ''}{wowAbs.toFixed(0)})
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

interface Props {
  data: UpstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function UsProductionPanel({ data, isLoading, error }: Props) {
  const updatedLabel = data?.last_updated ? fmtUtcTime(data.last_updated) : null

  // Reverse so oldest → newest (left → right on chart)
  const prodChartData = useMemo(() => {
    if (!data?.crude_production?.length) return []
    return [...data.crude_production].reverse().map(p => ({
      label: fmtDateShort(p.period),
      value: +(p.value / 1000).toFixed(3), // kbpd → MBD
    }))
  }, [data])

  const latest = data?.crude_production?.[0]
  const rig = data?.rig_count

  return (
    <Panel
      title="US PRODUCTION & RIG ACTIVITY"
      noPadding
      headerRight={
        <>
          <Badge variant="muted">BAKER HUGHES</Badge>
          <Badge variant="muted">EIA-914</Badge>
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
            <div
              style={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          ) : (
            <>
              <SubHeader
                title="CRUDE PRODUCTION · MBD"
                value={latest ? (latest.value / 1000).toFixed(2) : '—'}
                unit="MBD"
                wowPct={latest?.wow_pct_change ?? null}
                wowAbs={latest?.wow_change ?? null}
              />
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart
                    data={prodChartData}
                    margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f5a623" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        fill: 'var(--color-text-tertiary)',
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={8}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        fill: 'var(--color-text-tertiary)',
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => v.toFixed(1)}
                      width={36}
                      tickCount={4}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      cursor={{
                        stroke: 'var(--color-border-muted)',
                        strokeWidth: 1,
                        strokeDasharray: '3 3',
                      }}
                      contentStyle={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        padding: '5px 9px',
                      }}
                      itemStyle={{ color: 'var(--color-text-primary)' }}
                      labelStyle={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 10,
                        marginBottom: 2,
                      }}
                      formatter={(v: number) => [`${v.toFixed(2)} MBD`, 'PRODUCTION']}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f5a623"
                      strokeWidth={1.5}
                      fill="url(#prodGrad)"
                      dot={false}
                      isAnimationActive={false}
                      activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="divider" style={{ margin: 0 }} />

        {/* ── OIL RIG COUNT section ─────────────────────────────────────── */}
        <div>
          {isLoading && !data ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <Skel h={11} w={180} />
                <Skel h={20} w={64} />
              </div>
              <Skel h={80} />
            </>
          ) : error ? null : rig?.available ? (
            // Scalar available — bar chart requires weekly history series (pending API addition)
            <>
              <SubHeader
                title="OIL RIG COUNT · WEEKLY"
                value={rig.total != null ? rig.total.toLocaleString() : '—'}
                unit="RIGS"
                wowPct={null}
                wowAbs={rig.wow_change ?? null}
              />
              <div
                style={{
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-bg-elevated)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.07em',
                  }}
                >
                  WEEKLY BAR CHART · PENDING HISTORY SERIES
                </span>
              </div>
            </>
          ) : (
            // Baker Hughes unavailable (current state: FRED HTTP 400)
            <>
              <SubHeader
                title="OIL RIG COUNT · WEEKLY"
                value="—"
                unavailable
              />
              <div
                style={{
                  height: 72,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: 'var(--color-bg-elevated)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.07em',
                  }}
                >
                  BAKER HUGHES FEED UNAVAILABLE
                </span>
                {rig?.reason && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--color-text-tertiary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {rig.reason.toUpperCase()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}
