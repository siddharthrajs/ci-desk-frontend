/**
 * OPEC+ total production over time — area chart with a 3Y/5Y/10Y range toggle.
 *
 * The history endpoint returns per-member monthly series; we sum members per
 * period to get the OPEC+ aggregate. Per-member breakdown lives in the table
 * below. Uses lightweight-charts (shared lwChart helper), like the US panels.
 */

import { useMemo, useState } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Pill, Badge } from '../../ui/Badge'
import { useOpecHistory } from '../../../hooks/useApiData'
import type { OpecBasis } from '../../../types/api'
import { ErrorBlock, Skel } from '../_shared'
import { useLwChart, toLwPoints } from '../lwChart'

type Range = '3Y' | '5Y' | '10Y'
const RANGE_MONTHS: Record<Range, number> = { '3Y': 36, '5Y': 60, '10Y': 120 }

export function OpecProductionHistoryPanel({ basis }: { basis: OpecBasis }) {
  const { data, isLoading, error } = useOpecHistory(basis)
  const [range, setRange] = useState<Range>('10Y')

  // Sum members per period → OPEC+ total, newest-first.
  const totals = useMemo(() => {
    if (!data?.members) return []
    const byPeriod = new Map<string, number>()
    for (const points of Object.values(data.members)) {
      for (const pt of points) {
        if (pt.value == null) continue
        byPeriod.set(pt.period, (byPeriod.get(pt.period) ?? 0) + pt.value)
      }
    }
    return [...byPeriod.entries()]
      .map(([period, value]) => ({ period, value: Math.round(value * 1000) / 1000 }))
      .sort((a, b) => (a.period < b.period ? 1 : -1)) // newest-first
  }, [data])

  const points = useMemo(
    () => toLwPoints(totals.slice(0, RANGE_MONTHS[range]), 'value'),
    [totals, range],
  )

  const containerRef = useLwChart(
    chart => {
      if (!points.length) return
      const series = chart.addSeries(AreaSeries, {
        topColor:    'rgba(245, 166, 35, 0.30)',
        bottomColor: 'rgba(245, 166, 35, 0.00)',
        lineColor:   '#f5a623',
        lineWidth:   2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        priceLineVisible: true,
        lastValueVisible: true,
      })
      series.setData(points)
    },
    [points],
  )

  return (
    <Panel
      title="OPEC+ TOTAL PRODUCTION"
      subtitle={`EIA International · ${basis === 'crude' ? 'crude + condensate' : 'total liquids'} · MBD`}
      headerRight={
        <>
          {(['3Y', '5Y', '10Y'] as Range[]).map(r => (
            <Pill key={r} variant={range === r ? 'active' : 'default'} onClick={() => setRange(r)}>
              {r}
            </Pill>
          ))}
          <Badge variant="muted">MONTHLY</Badge>
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
