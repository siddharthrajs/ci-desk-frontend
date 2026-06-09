/**
 * US crude oil exports — weekly MBD trend (lightweight-charts area) + latest-month
 * PADD-of-origin breakdown (horizontal bars). Source: EIA petroleum/sum/sndw + move/expcp.
 */

import { useState, useMemo } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { Pill } from '../ui/Badge'
import { useMidstreamExports } from '../../hooks/useApiData'
import { Skel, ErrorBlock, CadenceBadge, Delta } from '../upstream/_shared'
import { useLwChart, toLwPoints } from '../upstream/lwChart'

type Range = '1Y' | '2Y' | '5Y'
const RANGE_WEEKS: Record<Range, number> = { '1Y': 52, '2Y': 104, '5Y': 260 }

const PADD_DEFS = [
  { key: 'padd1_mbbl' as const, label: 'PADD 1', sub: 'East Coast' },
  { key: 'padd2_mbbl' as const, label: 'PADD 2', sub: 'Midwest' },
  { key: 'padd3_mbbl' as const, label: 'PADD 3', sub: 'Gulf Coast' },
  { key: 'padd4_mbbl' as const, label: 'PADD 4', sub: 'Rocky Mtn' },
  { key: 'padd5_mbbl' as const, label: 'PADD 5', sub: 'West Coast' },
]

export function ExportsPanel() {
  const { data, isLoading, error } = useMidstreamExports()
  const [range, setRange] = useState<Range>('2Y')

  const points = useMemo(() => {
    if (!data?.weekly_history?.length) return []
    return toLwPoints(data.weekly_history.slice(0, RANGE_WEEKS[range]), 'value')
  }, [data, range])

  const containerRef = useLwChart(
    chart => {
      if (!points.length) return
      chart.addSeries(AreaSeries, {
        topColor:    'rgba(109,179,242,0.25)',
        bottomColor: 'rgba(109,179,242,0.00)',
        lineColor:   '#6db3f2',
        lineWidth:   2,
        priceFormat: { type: 'price', precision: 3, minMove: 0.001 },
        priceLineVisible: false,
        lastValueVisible: true,
        title: 'MBD',
      }).setData(points)
    },
    [points],
  )

  // PADD bar max for scaling
  const paddValues = PADD_DEFS.map(p => data?.[p.key] ?? 0)
  const maxPadd = Math.max(...paddValues, 1)

  return (
    <Panel
      title="US CRUDE OIL EXPORTS"
      subtitle="Weekly MBD · petroleum/sum/sndw process EEX — PADD breakdown monthly · move/expcp"
      headerRight={
        <>
          {(['1Y', '2Y', '5Y'] as Range[]).map(r => (
            <Pill key={r} variant={range === r ? 'active' : 'default'} onClick={() => setRange(r)}>{r}</Pill>
          ))}
          <CadenceBadge cadence="WEEKLY · WED" updated={data?.last_updated} />
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={320} />
      ) : error ? (
        <ErrorBlock error={error} height={320} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600,
              color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {data?.latest_mbd != null ? data.latest_mbd.toFixed(3) : '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--color-text-tertiary)' }}>MBD</span>
            <Delta change={data?.wow_mbd ?? null} label="WoW" decimals={3} compact />
          </div>

          {/* Weekly chart */}
          <div ref={containerRef} style={{ height: 200, width: '100%' }} />

          {/* PADD breakdown */}
          {data?.latest_period_m && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--color-text-tertiary)', letterSpacing: '0.07em', marginBottom: 10 }}>
                PADD OF ORIGIN · {data.latest_period_m} · KBBL/MONTH
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {PADD_DEFS.map((p, i) => {
                  const val = paddValues[i]
                  const pct = val / maxPadd * 100
                  return (
                    <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 56, flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                          fontWeight: p.label === 'PADD 3' ? 700 : 400,
                          color: p.label === 'PADD 3' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                          {p.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
                          color: 'var(--color-text-tertiary)' }}>{p.sub}</div>
                      </div>
                      <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%',
                          width: `${pct}%`, background: '#6db3f2', opacity: p.label === 'PADD 3' ? 1 : 0.6 }} />
                      </div>
                      <div style={{ width: 64, textAlign: 'right', fontFamily: 'var(--font-mono)',
                        fontSize: 10, color: 'var(--color-text-secondary)' }}>
                        {val > 0 ? val.toLocaleString('en-US') : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
