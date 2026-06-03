/**
 * CAPACITY & SPARE — OPEC crude production vs production capacity over time.
 * The vertical gap between the two lines is spare capacity. STEO source, crude
 * basis (no liquids equivalent), with the forward forecast drawn dashed.
 */

import { useMemo } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { useOpecOverview } from '../../../hooks/useApiData'
import { ErrorBlock, Skel } from '../_shared'
import { useLwChart, splitActualForecast } from '../lwChart'

const CAP_COLOR  = '#f5a623' // capacity — amber
const PROD_COLOR = '#3dd6c4' // production — teal
const MONTHS = 96            // ~8Y window incl. forecast

function Legend() {
  const items = [
    { c: CAP_COLOR,  label: 'CAPACITY' },
    { c: PROD_COLOR, label: 'PRODUCTION' },
  ]
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
      {items.map(i => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 2, background: i.c, display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>{i.label}</span>
        </div>
      ))}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>
        · gap = spare · dashed = STEO forecast
      </span>
    </div>
  )
}

export function OpecCapacityPanel() {
  const { data, isLoading, error } = useOpecOverview()

  const series = useMemo(() => {
    const rows = (data?.capacity_history ?? []).slice(0, MONTHS)
    return {
      capacity:   splitActualForecast(rows.map(p => ({ period: p.period, is_forecast: p.is_forecast, value: p.capacity }))),
      production: splitActualForecast(rows.map(p => ({ period: p.period, is_forecast: p.is_forecast, value: p.production }))),
    }
  }, [data])

  const containerRef = useLwChart(
    chart => {
      const add = (pts: { time: string; value: number }[], color: string, dashed: boolean) => {
        if (!pts.length) return
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 2,
          lineStyle: dashed ? 2 : 0, // 2 = Dashed, 0 = Solid
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          priceLineVisible: false,
          lastValueVisible: !dashed,
        })
        s.setData(pts)
      }
      add(series.capacity.actual,   CAP_COLOR,  false)
      add(series.capacity.forecast, CAP_COLOR,  true)
      add(series.production.actual,   PROD_COLOR, false)
      add(series.production.forecast, PROD_COLOR, true)
    },
    [series],
  )

  return (
    <Panel
      title="PRODUCTION vs CAPACITY"
      subtitle="EIA STEO · OPEC · crude basis · MBD"
      headerRight={<Badge variant="muted">CRUDE BASIS</Badge>}
    >
      {isLoading && !data ? (
        <Skel h={300} />
      ) : error ? (
        <ErrorBlock error={error} height={300} />
      ) : (
        <>
          <Legend />
          <div ref={containerRef} style={{ height: 300, width: '100%' }} />
        </>
      )}
    </Panel>
  )
}
