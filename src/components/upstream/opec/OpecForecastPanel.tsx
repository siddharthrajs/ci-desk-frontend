/**
 * FORECAST — OPEC+ crude production, actual + STEO forward forecast (to 2027).
 * OPEC+ total here is STEO crude (OPEC + OPEC+ other participants); this is the
 * forecast cone, separate from the international production totals (which lag).
 */

import { useMemo } from 'react'
import { AreaSeries, LineSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { useOpecOverview } from '../../../hooks/useApiData'
import { ErrorBlock, Skel } from '../_shared'
import { useLwChart, splitActualForecast } from '../lwChart'

const COLOR = '#9b8cff' // distinct from production/capacity panels

export function OpecForecastPanel() {
  const { data, isLoading, error } = useOpecOverview()

  const { actual, forecast } = useMemo(() => {
    const rows = (data?.split_history ?? []).map(p => ({
      period: p.period,
      is_forecast: p.is_forecast,
      // OPEC+ (STEO crude) = OPEC members + OPEC+ other participants
      value: p.opec != null && p.opec_plus_other != null ? p.opec + p.opec_plus_other : null,
    }))
    return splitActualForecast(rows)
  }, [data])

  const containerRef = useLwChart(
    chart => {
      if (actual.length) {
        const a = chart.addSeries(AreaSeries, {
          topColor:    'rgba(155, 140, 255, 0.28)',
          bottomColor: 'rgba(155, 140, 255, 0.00)',
          lineColor:   COLOR,
          lineWidth:   2,
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          priceLineVisible: false,
        })
        a.setData(actual)
      }
      if (forecast.length) {
        const f = chart.addSeries(LineSeries, {
          color: COLOR,
          lineWidth: 2,
          lineStyle: 2, // dashed
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          priceLineVisible: false,
          lastValueVisible: true,
        })
        f.setData(forecast)
      }
    },
    [actual, forecast],
  )

  return (
    <Panel
      title="OPEC+ PRODUCTION FORECAST"
      subtitle="EIA STEO · crude · MBD · solid = actual, dashed = forecast"
      headerRight={<Badge variant="muted">STEO → 2027</Badge>}
    >
      {isLoading && !data ? (
        <Skel h={280} />
      ) : error ? (
        <ErrorBlock error={error} height={280} />
      ) : (
        <div ref={containerRef} style={{ height: 280, width: '100%' }} />
      )}
    </Panel>
  )
}
