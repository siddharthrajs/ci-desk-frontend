/**
 * US crude imports by country — monthly final. Shows top origins table with
 * OPEC+ flag, OPEC+ share aggregate, and 12M history sparkline.
 * Source: EIA crude-oil-imports → /api/midstream/imports
 */

import { useMemo } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import { useMidstreamImports } from '../../hooks/useApiData'
import { Skel, ErrorBlock, CadenceBadge, fmtMonthYear } from '../upstream/_shared'
import { useLwChart } from '../upstream/lwChart'
import type { ExportsHistPoint } from '../../types/api'

export function ImportsPanel() {
  const { data, isLoading, error } = useMidstreamImports()

  const sparkPoints = useMemo(() => {
    const hist: ExportsHistPoint[] = data?.history ?? []
    return [...hist]
      .filter(p => p.value != null)
      .sort((a, b) => a.date < b.date ? -1 : 1)
      .map(p => ({ time: p.date, value: p.value }))
  }, [data])

  const sparkRef = useLwChart(
    chart => {
      if (!sparkPoints.length) return
      chart.applyOptions({
        rightPriceScale: { visible: false },
        timeScale: { visible: false },
        grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
        handleScale: false, handleScroll: false,
      })
      chart.addSeries(LineSeries, {
        color: '#f5a623', lineWidth: 2,
        priceLineVisible: false, lastValueVisible: false,
      }).setData(sparkPoints)
    },
    [sparkPoints],
  )

  const origins = data?.top_origins ?? []
  const total = data?.total_mbd
  const opecShare = data?.opec_plus_share

  return (
    <Panel
      title="US CRUDE IMPORTS BY COUNTRY"
      subtitle="Monthly final · EIA crude-oil-imports · MBD"
      headerRight={
        <>
          {opecShare != null && (
            <Badge variant="muted" style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,166,35,0.3)' }}>
              OPEC+ {opecShare.toFixed(1)}%
            </Badge>
          )}
          <CadenceBadge cadence="MONTHLY" updated={data?.last_updated} />
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={340} />
      ) : error ? (
        <ErrorBlock error={error} height={340} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* KPI + sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--color-text-tertiary)', letterSpacing: '0.07em', marginBottom: 4 }}>
                TOTAL IMPORTS
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600,
                  color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {total != null ? total.toFixed(3) : '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--color-text-tertiary)' }}>MBD</span>
              </div>
              {data?.opec_plus_mbd != null && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--color-amber)', marginTop: 3 }}>
                  OPEC+ {data.opec_plus_mbd.toFixed(3)} MBD
                </div>
              )}
            </div>
            <div ref={sparkRef} style={{ width: 120, height: 48 }} />
          </div>

          {/* Country table */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 52px 60px',
              padding: '4px 0 6px', borderBottom: '1px solid var(--color-border)' }}>
              {['COUNTRY', 'MBD', 'SHARE', 'MoM'].map(h => (
                <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
                  color: 'var(--color-text-tertiary)', letterSpacing: '0.08em',
                  textAlign: h === 'COUNTRY' ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {origins.map((o, i) => {
              const momColor = o.mom_change == null ? 'var(--color-text-tertiary)'
                : o.mom_change > 0 ? 'var(--color-bull)' : o.mom_change < 0 ? 'var(--color-bear)' : 'var(--color-text-tertiary)'
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 72px 52px 60px',
                  padding: '5px 0',
                  borderBottom: '1px solid var(--color-border)',
                  background: o.is_opec_plus ? 'rgba(245,166,35,0.04)' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {o.is_opec_plus && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7,
                        color: 'var(--color-amber)', letterSpacing: '0.05em' }}>OPEC+</span>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--color-text-primary)' }}>{o.country}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--color-text-primary)', textAlign: 'right' }}>
                    {o.volume_mbd.toFixed(3)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                    {o.share_pct.toFixed(1)}%
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: momColor, textAlign: 'right' }}>
                    {o.mom_change != null
                      ? `${o.mom_change > 0 ? '+' : ''}${o.mom_change.toFixed(3)}`
                      : '—'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Period note */}
          {sparkPoints.length > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>
              SPARKLINE: {fmtMonthYear(sparkPoints[0].time as string)} –{' '}
              {fmtMonthYear(sparkPoints[sparkPoints.length - 1].time as string)}
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
