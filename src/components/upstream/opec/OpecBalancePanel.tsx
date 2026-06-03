/**
 * FORECAST — world oil supply/demand balance (STEO), incl. forward forecast.
 * Implied balance = −(net inventory withdrawals): above zero = surplus (build,
 * green), below zero = deficit (draw, red). Baseline series at 0.
 */

import { useMemo } from 'react'
import { BaselineSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { useOpecOverview } from '../../../hooks/useApiData'
import { ErrorBlock, Skel } from '../_shared'
import { useLwChart, toLwPoints } from '../lwChart'

const MONTHS = 96 // ~8Y incl. forecast

export function OpecBalancePanel() {
  const { data, isLoading, error } = useOpecOverview()

  const points = useMemo(
    () => toLwPoints((data?.balance_history ?? []).slice(0, MONTHS), 'implied_balance'),
    [data],
  )

  const containerRef = useLwChart(
    chart => {
      if (!points.length) return
      const s = chart.addSeries(BaselineSeries, {
        baseValue:        { type: 'price', price: 0 },
        topLineColor:     '#3dd6c4',
        topFillColor1:    'rgba(61, 214, 196, 0.28)',
        topFillColor2:    'rgba(61, 214, 196, 0.05)',
        bottomLineColor:  '#e5484d',
        bottomFillColor1: 'rgba(229, 72, 77, 0.05)',
        bottomFillColor2: 'rgba(229, 72, 77, 0.28)',
        lineWidth:        2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      })
      s.setData(points)
    },
    [points],
  )

  return (
    <Panel
      title="WORLD SUPPLY / DEMAND BALANCE"
      subtitle="EIA STEO · MBD · +surplus (build) / −deficit (draw) · incl. forecast"
      headerRight={<Badge variant="muted">STEO → 2027</Badge>}
    >
      {isLoading && !data ? (
        <Skel h={240} />
      ) : error ? (
        <ErrorBlock error={error} height={240} />
      ) : (
        <div ref={containerRef} style={{ height: 240, width: '100%' }} />
      )}
    </Panel>
  )
}
