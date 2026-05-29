/**
 * Monthly EIA-republished rig count. Three line series stacked in one chart:
 * total (amber), oil (teal), gas (violet). Surfaces onshore/offshore counts
 * as a row of static numerics under the header.
 */

import { useMemo } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { useUsRigCount } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

export function RigCountPanel() {
  const { data, isLoading, error } = useUsRigCount()

  const series = useMemo(() => {
    if (!data?.history?.length) return null
    const slice = data.history.slice(0, 60)
    return {
      total: toLwPoints(slice, 'total'),
      oil:   toLwPoints(slice, 'oil'),
      gas:   toLwPoints(slice, 'gas'),
    }
  }, [data])

  const containerRef = useLwChart(
    chart => {
      if (!series) return
      const total = chart.addSeries(LineSeries, {
        color: '#f5a623',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
        title: 'TOTAL',
      })
      const oil = chart.addSeries(LineSeries, {
        color: '#3dd6c4',
        lineWidth: 1.5,
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
        title: 'OIL',
      })
      const gas = chart.addSeries(LineSeries, {
        color: '#8b6cef',
        lineWidth: 1.5,
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
        title: 'GAS',
      })
      total.setData(series.total)
      oil.setData(series.oil)
      gas.setData(series.gas)
    },
    [series],
  )

  const latest = data?.history?.[0]

  return (
    <Panel
      title="US RIG COUNT"
      subtitle="EIA petroleum/crd/drill · republished Baker Hughes"
      headerRight={<CadenceBadge cadence="MONTHLY" updated={data?.last_updated} />}
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <>
          {latest && (
            <div style={{
              display: 'flex',
              gap: 24,
              marginBottom: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
            }}>
              <span><span style={{ color: 'var(--color-text-tertiary)' }}>ONSHORE</span>{' '}
                <span style={{ color: 'var(--color-text-primary)' }}>{latest.onshore ?? '—'}</span></span>
              <span><span style={{ color: 'var(--color-text-tertiary)' }}>OFFSHORE</span>{' '}
                <span style={{ color: 'var(--color-text-primary)' }}>{latest.offshore ?? '—'}</span></span>
              <span><span style={{ color: 'var(--color-text-tertiary)' }}>OIL</span>{' '}
                <span style={{ color: 'var(--color-bull)' }}>{latest.oil ?? '—'}</span></span>
              <span><span style={{ color: 'var(--color-text-tertiary)' }}>GAS</span>{' '}
                <span style={{ color: '#8b6cef' }}>{latest.gas ?? '—'}</span></span>
            </div>
          )}
          <div ref={containerRef} style={{ height: 240, width: '100%' }} />
        </>
      )}
    </Panel>
  )
}
