import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts'
import { BASE_CHART_OPTIONS } from '../upstream/lwChart'
import type { COTHistoryPoint } from '../../types/api'

// =============================================================================
// Types
// =============================================================================

interface LegendState {
  date: string
  mmNet: number | null
  mmLong: number | null
  mmShort: number | null
  openInterest: number | null
}

// =============================================================================
// Formatters
// =============================================================================

function fmtK(n: number | null): string {
  if (n == null) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function fmtSigned(n: number | null): string {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + fmtK(n)
}

function signColor(n: number | null): string {
  if (n == null || n === 0) return 'var(--color-text-secondary)'
  return n > 0 ? 'var(--color-bull)' : 'var(--color-bear)'
}

// =============================================================================
// Chart component
// =============================================================================

export function CotPositionChart({ history }: { history: COTHistoryPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const [legend, setLegend] = useState<LegendState | null>(null)

  useEffect(() => {
    if (!containerRef.current || !history.length) return

    const chart = createChart(containerRef.current, {
      ...BASE_CHART_OPTIONS,
      height: 340,
      rightPriceScale: {
        borderColor: '#2e2e2e',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#2e2e2e',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
    })
    chartRef.current = chart

    // MM Net — amber, primary right scale
    const netSeries: ISeriesApi<'Line'> = chart.addSeries(LineSeries, {
      color:            'var(--color-amber)',
      lineWidth:        2,
      title:            'MM NET',
      priceScaleId:     'right',
      lastValueVisible: true,
      priceLineVisible: false,
    })

    // MM Long — bull green, right scale
    const longSeries: ISeriesApi<'Line'> = chart.addSeries(LineSeries, {
      color:            '#3dd6c4',
      lineWidth:        1,
      title:            'MM LONG',
      priceScaleId:     'right',
      lastValueVisible: false,
      priceLineVisible: false,
    })

    // MM Short — bear red, right scale
    const shortSeries: ISeriesApi<'Line'> = chart.addSeries(LineSeries, {
      color:            '#f05252',
      lineWidth:        1,
      title:            'MM SHORT',
      priceScaleId:     'right',
      lastValueVisible: false,
      priceLineVisible: false,
    })

    // Open Interest — gray, left scale
    const oiSeries: ISeriesApi<'Line'> = chart.addSeries(LineSeries, {
      color:            '#555555',
      lineWidth:        1,
      title:            'OI',
      priceScaleId:     'left',
      lastValueVisible: false,
      priceLineVisible: false,
    })

    const toPoint = (h: COTHistoryPoint, val: number): LineData => ({ time: h.date as any, value: val })

    netSeries.setData(history.map(h => toPoint(h, h.mm_net)))
    longSeries.setData(history.map(h => toPoint(h, h.mm_long)))
    shortSeries.setData(history.map(h => toPoint(h, h.mm_short)))
    oiSeries.setData(history.map(h => toPoint(h, h.open_interest)))

    chart.timeScale().fitContent()

    // Crosshair legend
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.seriesData) {
        setLegend(null)
        return
      }
      const net  = (param.seriesData.get(netSeries)   as LineData | undefined)?.value ?? null
      const long = (param.seriesData.get(longSeries)  as LineData | undefined)?.value ?? null
      const short = (param.seriesData.get(shortSeries) as LineData | undefined)?.value ?? null
      const oi   = (param.seriesData.get(oiSeries)    as LineData | undefined)?.value ?? null
      setLegend({ date: param.time as string, mmNet: net, mmLong: long, mmShort: short, openInterest: oi })
    })

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [history])

  // Current (most recent) week as default legend
  const last = history[history.length - 1]

  return (
    <div>
      {/* Chart legend */}
      <div style={legendBarStyle}>
        <LegendItem label="DATE"    value={legend?.date ?? last?.date ?? '—'}   color="var(--color-text-primary)" />
        <LegendItem label="MM NET"  value={fmtSigned(legend?.mmNet  ?? last?.mm_net  ?? null)} color={signColor(legend?.mmNet ?? last?.mm_net ?? null)} />
        <LegendItem label="MM LONG" value={fmtK(legend?.mmLong  ?? last?.mm_long  ?? null)}    color="var(--color-bull)" />
        <LegendItem label="MM SHORT" value={fmtK(legend?.mmShort ?? last?.mm_short ?? null)}   color="var(--color-bear)" />
        <LegendItem label="OI"      value={fmtK(legend?.openInterest ?? last?.open_interest ?? null)} color="var(--color-text-secondary)" />
      </div>

      {/* Chart container */}
      <div ref={containerRef} style={{ width: '100%', height: 340 }} />

      {/* Series key */}
      <div style={seriesKeyStyle}>
        <SeriesKey color="var(--color-amber)"          label="MM NET" />
        <SeriesKey color="#3dd6c4"                     label="MM LONG" />
        <SeriesKey color="#f05252"                     label="MM SHORT" />
        <SeriesKey color="#555555"                     label="OPEN INTEREST (LEFT AXIS)" />
      </div>
    </div>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

function LegendItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color }}>
        {value}
      </span>
    </div>
  )
}

function SeriesKey({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 16, height: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const legendBarStyle: CSSProperties = {
  display: 'flex',
  gap: 24,
  padding: '8px 12px',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderBottom: 'none',
  flexWrap: 'wrap',
}

const seriesKeyStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '6px 12px',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderTop: 'none',
  flexWrap: 'wrap',
}
