import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type Time,
  type LineData,
  CrosshairMode,
} from 'lightweight-charts'
import { Panel, Badge } from '../ui'
import type { CurvePoint } from '../../hooks/useMarketWebSocket'

interface ForwardCurvePanelProps {
  product: string
  displayName?: string
  curve: CurvePoint[]
  color: string
  unit: string
  chartHeight?: number
  onRemove?: () => void
}

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined) return '—'
  return v.toFixed(decimals)
}

const MONO: CSSProperties = { fontFamily: 'var(--font-mono)' }

const MONTH_INDEX: Record<string, number> = {
  F: 0, G: 1, H: 2, J: 3, K: 4, M: 5,
  N: 6, Q: 7, U: 8, V: 9, X: 10, Z: 11,
}

function tenorToTime(label: string): UTCTimestamp | null {
  const head = label.split('-')[0] ?? label
  if (head.length < 2) return null
  const letter = head[0]
  const yearTwo = parseInt(head.slice(1), 10)
  if (isNaN(yearTwo)) return null
  const month = MONTH_INDEX[letter]
  if (month === undefined) return null
  const year = 2000 + yearTwo
  return Math.floor(Date.UTC(year, month, 1) / 1000) as UTCTimestamp
}

interface TooltipState {
  x: number
  y: number
  label: string
  mid: number | null
  bid: number | null
  ask: number | null
  settlement: number | null
}

function ForwardCurveChart({ curve, color, unit, height }: { curve: CurvePoint[]; color: string; unit: string; height: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const midRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bidRef = useRef<ISeriesApi<'Line'> | null>(null)
  const askRef = useRef<ISeriesApi<'Line'> | null>(null)
  // time(seconds) → point lookup, used for crosshair tooltip + tick labels
  const lookupRef = useRef<Map<number, CurvePoint>>(new Map())
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Create chart once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#888',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: '#666',
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        minBarSpacing: 12,
        tickMarkMaxCharacterLength: 3,
        tickMarkFormatter: (time: Time) => {
          const t = typeof time === 'number' ? time : 0
          return lookupRef.current.get(t)?.label ?? ''
        },
      },
      localization: {
        timeFormatter: (time: Time) => {
          const t = typeof time === 'number' ? time : 0
          return lookupRef.current.get(t)?.label ?? ''
        },
        priceFormatter: (p: number) => p.toFixed(2),
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: 'rgba(255,255,255,0.18)', width: 1, style: LineStyle.Solid, labelVisible: false },
        horzLine: { color: 'rgba(255,255,255,0.18)', width: 1, style: LineStyle.Solid, labelBackgroundColor: '#1a1a1a' },
      },
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart

    midRef.current = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerRadius: 3,
    })
    bidRef.current = chart.addSeries(LineSeries, {
      color,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })
    askRef.current = chart.addSeries(LineSeries, {
      color,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })
    bidRef.current.applyOptions({ color: `${color}80` })
    askRef.current.applyOptions({ color: `${color}80` })

    chart.subscribeCrosshairMove(param => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        setTooltip(null)
        return
      }
      const t = typeof param.time === 'number' ? param.time : 0
      const pt = lookupRef.current.get(t)
      if (!pt) {
        setTooltip(null)
        return
      }
      setTooltip({
        x: param.point.x,
        y: param.point.y,
        label: pt.label,
        mid: pt.mid,
        bid: pt.bid,
        ask: pt.ask,
        settlement: pt.settlement,
      })
    })

    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      chart.applyOptions({ width: entry.contentRect.width })
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      midRef.current = null
      bidRef.current = null
      askRef.current = null
    }
  }, [])

  // Push curve data
  useEffect(() => {
    if (!chartRef.current || !midRef.current || !bidRef.current || !askRef.current) return

    const lookup = new Map<number, CurvePoint>()
    const midData: LineData[] = []
    const bidData: LineData[] = []
    const askData: LineData[] = []

    for (const pt of curve) {
      const time = tenorToTime(pt.label)
      if (time === null) continue
      lookup.set(time as number, pt)
      const px = pt.mid ?? pt.settlement
      if (px !== null && px !== undefined) midData.push({ time, value: px })
      if (pt.bid !== null && pt.bid !== undefined) bidData.push({ time, value: pt.bid })
      if (pt.ask !== null && pt.ask !== undefined) askData.push({ time, value: pt.ask })
    }

    lookupRef.current = lookup
    midRef.current.setData(midData)
    bidRef.current.setData(bidData)
    askRef.current.setData(askData)
    if (midData.length > 0 || bidData.length > 0 || askData.length > 0) {
      chartRef.current.timeScale().fitContent()
    }
  }, [curve])

  // Update line colors when color prop changes
  useEffect(() => {
    midRef.current?.applyOptions({ color })
    bidRef.current?.applyOptions({ color: `${color}80` })
    askRef.current?.applyOptions({ color: `${color}80` })
  }, [color])

  useEffect(() => {
    chartRef.current?.applyOptions({ height })
  }, [height])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height }} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 12, (containerRef.current?.clientWidth ?? 0) - 160),
            top: 8,
            pointerEvents: 'none',
            background: '#0d0d0d',
            border: '1px solid var(--color-border)',
            padding: '6px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-primary)',
            minWidth: 130,
          }}
        >
          <div style={{ marginBottom: 4, letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
            {tooltip.label} <span style={{ color: 'var(--color-text-tertiary)' }}>{unit}</span>
          </div>
          <div style={{ color, lineHeight: 1.7 }}>MID: {fmt(tooltip.mid)}</div>
          <div style={{ color: 'var(--color-bull)', lineHeight: 1.7 }}>BID: {fmt(tooltip.bid)}</div>
          <div style={{ color: 'var(--color-amber)', lineHeight: 1.7 }}>ASK: {fmt(tooltip.ask)}</div>
          {tooltip.settlement !== null && (
            <div style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.7 }}>SETT: {fmt(tooltip.settlement)}</div>
          )}
        </div>
      )}
    </div>
  )
}

export function ForwardCurvePanel({ product, displayName, curve, color, unit, chartHeight = 180, onRemove }: ForwardCurvePanelProps) {
  const name = displayName ?? product.toUpperCase()
  const hasData = curve.some(p => p.mid !== null || p.bid !== null || p.ask !== null)
  const visibleRows = curve
    .filter(p => p.bid !== null || p.ask !== null || p.mid !== null || p.settlement !== null)
    .slice(0, 10)

  const liveBadge = (
    <Badge variant={hasData ? 'bull' : 'muted'}>
      LIVE {hasData ? '●' : '○'}
    </Badge>
  )
  const unitBadge = <Badge variant="muted">{unit}</Badge>
  const closeButton = onRemove ? (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove curve"
      title="Remove curve"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        lineHeight: 1,
        width: 20,
        height: 20,
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      ✕
    </button>
  ) : null

  return (
    <Panel
      title={name}
      headerRight={<>{liveBadge}{unitBadge}{closeButton}</>}
      noPadding
    >
      <div style={{ padding: '8px 8px 0' }}>
        {hasData ? (
          <ForwardCurveChart curve={curve} color={color} unit={unit} height={chartHeight} />
        ) : (
          <div style={{
            height: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...MONO,
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.1em',
          }}>
            AWAITING FEED
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}>
          <thead>
            <tr style={{ borderTop: '1px solid var(--color-border)' }}>
              {['TENOR', 'BID', 'ASK', 'MID', 'SETT', 'STATE'].map(h => (
                <th key={h} style={{
                  padding: '4px 8px',
                  textAlign: 'right',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  borderBottom: '1px solid var(--color-border)',
                  ...(h === 'TENOR' ? { textAlign: 'left' } : {}),
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.07em',
                }}>
                  —
                </td>
              </tr>
            ) : (
              visibleRows.map((row, i) => (
                <tr key={row.tenor} style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-elevated)',
                }}>
                  <td style={{ padding: '3px 8px', color: 'var(--color-text-secondary)', textAlign: 'left', letterSpacing: '0.05em' }}>
                    {row.label}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-bull)' }}>
                    {fmt(row.bid)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-amber)' }}>
                    {fmt(row.ask)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-text-primary)' }}>
                    {fmt(row.mid)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                    {fmt(row.settlement)}
                  </td>
                  <td style={{ padding: '3px 8px', textAlign: 'right' }}>
                    {row.state === 'O' ? (
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#26a69a' }} />
                    ) : row.state === 'C' ? (
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#ef5350' }} />
                    ) : (
                      <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
