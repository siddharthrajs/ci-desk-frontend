import { useState, useMemo } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { Pill } from '../ui/Badge'
import { useMidstreamStocks } from '../../hooks/useApiData'
import { Skel, ErrorBlock, CadenceBadge } from '../upstream/_shared'
import { useLwChart, toLwPoints } from '../upstream/lwChart'
import type { MidStreamHistPoint } from '../../types/api'

type Product = 'crude' | 'cushing' | 'gasoline' | 'distillate' | 'jet' | 'spr'

const PRODUCTS: { key: Product; label: string; color: string; topColor: string }[] = [
  { key: 'crude',      label: 'CRUDE',      color: '#f5a623', topColor: 'rgba(245,166,35,0.20)' },
  { key: 'cushing',   label: 'CUSHING',    color: '#f5a623', topColor: 'rgba(245,166,35,0.15)' },
  { key: 'gasoline',  label: 'GASOLINE',   color: '#3dd6c4', topColor: 'rgba(61,214,196,0.20)'  },
  { key: 'distillate',label: 'DIST',       color: '#6db3f2', topColor: 'rgba(109,179,242,0.20)' },
  { key: 'jet',       label: 'JET',        color: '#8b6cef', topColor: 'rgba(139,108,239,0.20)' },
  { key: 'spr',       label: 'SPR',        color: '#e05555', topColor: 'rgba(224,85,85,0.20)'   },
]

export function InventoryHistoryPanel() {
  const { data, isLoading, error } = useMidstreamStocks()
  const [product, setProduct] = useState<Product>('crude')

  const def = PRODUCTS.find(p => p.key === product)!

  const points = useMemo(() => {
    const history: MidStreamHistPoint[] = data?.[product]?.history ?? []
    if (!history.length) return []
    return toLwPoints(history.slice(0, 104), 'value')
  }, [data, product])

  const containerRef = useLwChart(
    chart => {
      if (!points.length) return
      const s = chart.addSeries(AreaSeries, {
        topColor:    def.topColor,
        bottomColor: 'rgba(0,0,0,0)',
        lineColor:   def.color,
        lineWidth:   2,
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
        priceLineVisible: false,
        lastValueVisible: true,
      })
      s.setData(points)
    },
    [points, def.color, def.topColor],
  )

  const latest = data?.[product]?.latest_kbbl
  const wow    = data?.[product]?.wow_kbbl
  const wowDir = wow == null ? '' : wow > 0 ? '▲ ' : wow < 0 ? '▼ ' : ''
  const wowColor = wow == null ? 'var(--color-text-tertiary)'
    : wow > 0 ? 'var(--color-bull)' : 'var(--color-bear)'

  return (
    <Panel
      title="INVENTORY HISTORY"
      subtitle="2Y WEEKLY · EIA petroleum/stoc/wstk · MBbl"
      headerRight={
        <>
          {PRODUCTS.map(p => (
            <Pill key={p.key} variant={product === p.key ? 'active' : 'default'} onClick={() => setProduct(p.key)}>
              {p.label}
            </Pill>
          ))}
          <CadenceBadge cadence="WEEKLY · WED" updated={data?.last_updated} />
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600,
                color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {latest != null ? (latest / 1000).toFixed(1) : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-text-tertiary)' }}>MBbl</span>
            </div>
            {wow != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: wowColor, alignSelf: 'center' }}>
                {wowDir}{wow > 0 ? '+' : ''}{(wow / 1000).toFixed(1)} MBbl WoW
              </span>
            )}
          </div>
          <div ref={containerRef} style={{ height: 220, width: '100%' }} />
        </>
      )}
    </Panel>
  )
}
