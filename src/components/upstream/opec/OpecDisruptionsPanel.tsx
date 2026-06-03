/**
 * SUPPLY RISK — unplanned production disruptions (barrels offline) from STEO.
 * Current snapshot as horizontal bars + total-offline trend (lightweight-charts).
 */

import { useMemo } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { useOpecDisruptions } from '../../../hooks/useApiData'
import { Delta, ErrorBlock, Skel } from '../_shared'
import { useLwChart, toLwPoints } from '../lwChart'

export function OpecDisruptionsPanel() {
  const { data, isLoading, error } = useOpecDisruptions()

  const bars = useMemo(
    () => (data?.countries ?? []).filter(c => c.latest_mbd > 0),
    [data],
  )
  const maxVal = bars.length ? Math.max(...bars.map(c => c.latest_mbd)) : 1

  // Total offline per period (sum across countries), newest-first → area.
  const totalPoints = useMemo(() => {
    const series = data?.series
    if (!series) return []
    const byPeriod = new Map<string, number>()
    for (const points of Object.values(series)) {
      for (const pt of points) {
        if (pt.value == null) continue
        byPeriod.set(pt.period, (byPeriod.get(pt.period) ?? 0) + pt.value)
      }
    }
    const rows = [...byPeriod.entries()]
      .map(([period, value]) => ({ period, value: Math.round(value * 1000) / 1000 }))
      .sort((a, b) => (a.period < b.period ? 1 : -1))
    return toLwPoints(rows, 'value')
  }, [data])

  const containerRef = useLwChart(
    chart => {
      if (!totalPoints.length) return
      const s = chart.addSeries(AreaSeries, {
        topColor:    'rgba(229, 72, 77, 0.30)',
        bottomColor: 'rgba(229, 72, 77, 0.00)',
        lineColor:   '#e5484d',
        lineWidth:   2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      })
      s.setData(totalPoints)
    },
    [totalPoints],
  )

  return (
    <Panel
      title="UNPLANNED DISRUPTIONS"
      subtitle="EIA STEO · barrels offline · MBD"
      headerRight={
        <>
          <Badge variant="muted">{data?.latest_period ?? '—'}</Badge>
          <Badge variant="bear">{data?.total_mbd != null ? `${data.total_mbd.toFixed(2)} MBD OFFLINE` : '—'}</Badge>
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={280} />
      ) : error ? (
        <ErrorBlock error={error} height={280} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current snapshot — bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {bars.map(c => (
              <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 120, flexShrink: 0,
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                  color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{c.name}</span>
                <div style={{ flex: 1, height: 14, background: 'var(--color-bg-elevated)' }}>
                  <div style={{ width: `${(c.latest_mbd / maxVal) * 100}%`, height: '100%', background: 'var(--color-bear)' }} />
                </div>
                <span style={{
                  width: 56, textAlign: 'right', flexShrink: 0,
                  fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-primary)',
                }}>{c.latest_mbd.toFixed(2)}</span>
                <span style={{ width: 70, textAlign: 'right', flexShrink: 0 }}>
                  <Delta change={c.mom} decimals={2} compact />
                </span>
              </div>
            ))}
          </div>

          {/* Total offline over time */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)', marginBottom: 6,
            }}>TOTAL OFFLINE — TREND</div>
            <div ref={containerRef} style={{ height: 180, width: '100%' }} />
          </div>
        </div>
      )}
    </Panel>
  )
}
