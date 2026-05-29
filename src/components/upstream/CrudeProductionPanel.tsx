/**
 * Primary chart for the US upstream view: weekly US crude production as an
 * area chart, with 1Y / 3Y / 5Y range toggle. Uses lightweight-charts v5.
 */

import { useMemo, useState } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { Pill } from '../ui/Badge'
import { useUsCrudeProduction } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

type Range = '1Y' | '3Y' | '5Y'
const RANGE_WEEKS: Record<Range, number> = { '1Y': 52, '3Y': 156, '5Y': 260 }

export function CrudeProductionPanel() {
  const { data, isLoading, error } = useUsCrudeProduction()
  const [range, setRange] = useState<Range>('5Y')

  const points = useMemo(() => {
    if (!data?.weekly_history?.length) return []
    return toLwPoints(data.weekly_history.slice(0, RANGE_WEEKS[range]), 'value')
  }, [data, range])

  const containerRef = useLwChart(
    chart => {
      if (!points.length) return
      const series = chart.addSeries(AreaSeries, {
        topColor:    'rgba(61, 214, 196, 0.30)',
        bottomColor: 'rgba(61, 214, 196, 0.00)',
        lineColor:   '#3dd6c4',
        lineWidth:   2,
        priceFormat: { type: 'price', precision: 3, minMove: 0.001 },
        priceLineVisible: true,
        lastValueVisible: true,
      })
      series.setData(points)
    },
    [points],
  )

  return (
    <Panel
      title="US WEEKLY CRUDE PRODUCTION"
      subtitle="EIA Weekly Petroleum Status Report · process FPF · MBD"
      headerRight={
        <>
          {(['1Y', '3Y', '5Y'] as Range[]).map(r => (
            <Pill
              key={r}
              variant={range === r ? 'active' : 'default'}
              onClick={() => setRange(r)}
            >
              {r}
            </Pill>
          ))}
          <CadenceBadge cadence="WEEKLY · WED 10:30 ET" updated={data?.last_updated} />
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={320} />
      ) : error ? (
        <ErrorBlock error={error} height={320} />
      ) : (
        <div ref={containerRef} style={{ height: 320, width: '100%' }} />
      )}
    </Panel>
  )
}
