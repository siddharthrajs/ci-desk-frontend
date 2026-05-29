/**
 * Shared lightweight-charts v5 setup for the US upstream panels.
 *
 * v5 API note: series are now created via `chart.addSeries(SeriesType, options)`
 * (not the v4-style chart.addAreaSeries()). The series type is imported at the
 * panel level — this file only owns the chart lifecycle + theme.
 */

import { useEffect, useRef } from 'react'
import { createChart, type IChartApi, type DeepPartial, type ChartOptions } from 'lightweight-charts'

// Theme matches the design system tokens — readable on var(--color-bg-panel).
export const BASE_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: 'rgba(0, 0, 0, 0)' },  // transparent — let panel show through
    textColor: '#777777',
    fontFamily: 'JetBrains Mono, ui-monospace, monospace',
    fontSize: 10,
    attributionLogo: false,  // hide TradingView watermark
  },
  grid: {
    vertLines: { color: 'rgba(46, 46, 46, 0.5)' },
    horzLines: { color: 'rgba(46, 46, 46, 0.5)' },
  },
  rightPriceScale: {
    borderColor: '#2e2e2e',
    scaleMargins: { top: 0.12, bottom: 0.08 },
  },
  timeScale: {
    borderColor: '#2e2e2e',
    timeVisible: false,
    secondsVisible: false,
  },
  crosshair: {
    mode: 1, // CrosshairMode.Normal
    vertLine: { color: '#363636', width: 1, style: 3 },
    horzLine: { color: '#363636', width: 1, style: 3 },
  },
  autoSize: true,
}

/**
 * Mount a lightweight-charts instance into a container div.
 *
 * Pass a `setup` callback that receives the chart and registers any series.
 * The callback is called once on mount; rerun by including dependencies that
 * change the data identity (we re-mount the chart when those change rather
 * than diffing series — cleaner and the chart is cheap to recreate).
 */
export function useLwChart(
  setup: (chart: IChartApi) => void,
  deps: ReadonlyArray<unknown> = [],
) {
  const ref = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!ref.current) return
    const chart = createChart(ref.current, BASE_CHART_OPTIONS)
    try {
      setup(chart)
      chart.timeScale().fitContent()
    } catch (err) {
      console.error('lwChart setup failed', err)
    }
    return () => {
      chart.remove()
    }
    // deps are intentionally external — see comment above.
  }, deps)

  return ref
}

// Helper: convert backend "YYYY-MM-DD" strings to lightweight-charts time format.
// LWCharts accepts ISO date strings directly for daily-or-coarser series.
export type LwPoint = { time: string; value: number }

export function toLwPoints<T extends { date?: string; period?: string; year?: string }>(
  rows: T[],
  valueKey: keyof T,
): LwPoint[] {
  // Backend returns newest-first; LWCharts requires ascending time order.
  return [...rows]
    .filter(r => r[valueKey] != null && r[valueKey] !== undefined)
    .map(r => {
      const t = (r.date ?? r.period ?? r.year ?? '') as string
      // Annual data: convert "2021" → "2021-01-01" so LWCharts parses it.
      const time = /^\d{4}$/.test(t) ? `${t}-01-01` : t
      return { time, value: Number(r[valueKey]) }
    })
    .reverse()
}
