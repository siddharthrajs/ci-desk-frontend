/**
 * Monthly US natural-gas production. Two lines: gross withdrawals and dry
 * production, both in Bcf/d. Five years of history.
 */

import { useMemo } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { useUsNaturalGas } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel, Delta } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

export function NaturalGasPanel() {
  const { data, isLoading, error } = useUsNaturalGas()

  const series = useMemo(() => {
    if (!data?.history?.length) return null
    return {
      gross: toLwPoints(data.history, 'gross_withdrawals'),
      dry:   toLwPoints(data.history, 'dry_production'),
    }
  }, [data])

  const containerRef = useLwChart(
    chart => {
      if (!series) return
      const gross = chart.addSeries(LineSeries, {
        color: '#8b6cef',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        title: 'GROSS',
      })
      const dry = chart.addSeries(LineSeries, {
        color: '#3dd6c4',
        lineWidth: 1.5,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        title: 'DRY',
      })
      gross.setData(series.gross)
      dry.setData(series.dry)
    },
    [series],
  )

  return (
    <Panel
      title="US NATURAL GAS PRODUCTION"
      subtitle="Monthly · natural-gas/prod/sum · Bcf/d"
      headerRight={<CadenceBadge cadence="MONTHLY" updated={data?.last_updated} />}
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <>
          <div style={{
            display: 'flex',
            gap: 28,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: '#8b6cef',
              }}>GROSS WITHDRAWALS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  {data?.latest_gross_withdrawals?.toFixed(2) ?? '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                  Bcf/d
                </span>
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: 'var(--color-bull)',
              }}>DRY PRODUCTION</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  {data?.latest_dry_production?.toFixed(2) ?? '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                  Bcf/d
                </span>
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: 'var(--color-text-tertiary)',
              }}>YoY · GROSS</div>
              <Delta change={data?.yoy_change_pct ?? null} pct decimals={2} />
            </div>
          </div>
          <div ref={containerRef} style={{ height: 220, width: '100%' }} />
        </>
      )}
    </Panel>
  )
}
