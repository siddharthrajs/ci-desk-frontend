/**
 * Lower-48 crude production by API gravity bucket. Stacked area via
 * pre-summed cumulative series — lightweight-charts has no native stack mode,
 * so we draw each bucket as a separate area at its cumulative height. Order
 * is biggest-cumulative-first so smaller stacks paint on top.
 */

import { useMemo } from 'react'
import { AreaSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { useUsApiGravity } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel, fmtSignedPct } from './_shared'
import { useLwChart } from './lwChart'

interface BucketDef {
  key: 'heavy' | 'medium' | 'light' | 'condensate'
  label: string
  color: string
}

// Stack order: heavy at the bottom → condensate at the top.
const STACK_ORDER: BucketDef[] = [
  { key: 'heavy',      label: 'HEAVY · ≤30°',       color: '#e5484d' },
  { key: 'medium',     label: 'MEDIUM · 30–40°',    color: '#f5a623' },
  { key: 'light',      label: 'LIGHT · 40–50°',     color: '#3dd6c4' },
  { key: 'condensate', label: 'CONDENSATE · 50°+',  color: '#8b6cef' },
]

export function ApiGravityPanel() {
  const { data, isLoading, error } = useUsApiGravity()

  // Build cumulative-stacked series for each bucket, ascending time order.
  const stacked = useMemo(() => {
    if (!data?.history?.length) return null
    const oldestFirst = [...data.history].reverse()
    const out: Record<string, { time: string; value: number }[]> = {
      heavy: [], medium: [], light: [], condensate: [],
    }
    for (const row of oldestFirst) {
      const h = row.heavy ?? 0
      const m = row.medium ?? 0
      const l = row.light ?? 0
      const c = row.condensate ?? 0
      out.heavy.push(     { time: row.date, value: h })
      out.medium.push(    { time: row.date, value: h + m })
      out.light.push(     { time: row.date, value: h + m + l })
      out.condensate.push({ time: row.date, value: h + m + l + c })
    }
    return out
  }, [data])

  const containerRef = useLwChart(
    chart => {
      if (!stacked) return
      // Draw largest cumulative first (paints behind), smallest last (on top).
      for (const def of [...STACK_ORDER].reverse()) {
        const series = chart.addSeries(AreaSeries, {
          topColor:    def.color + 'AA',  // ~67% opacity
          bottomColor: def.color + '11',  // very transparent
          lineColor:   def.color,
          lineWidth:   1,
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          priceLineVisible: false,
        })
        series.setData(stacked[def.key])
      }
    },
    [stacked],
  )

  const latestRow = data?.history?.[0]

  return (
    <Panel
      title="CRUDE QUALITY · API GRAVITY MIX"
      subtitle="Monthly · Lower-48 production, summed by state · MBD"
      headerRight={<CadenceBadge cadence="MONTHLY · ~5MO LAG" updated={data?.last_updated} />}
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <>
          {/* Legend with current % shares */}
          <div style={{
            display: 'flex',
            gap: 18,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}>
            {STACK_ORDER.map(b => {
              const pct = data?.[`latest_${b.key}_pct` as `latest_${typeof b.key}_pct`] ?? null
              const vol = latestRow?.[b.key] ?? null
              return (
                <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: b.color, display: 'inline-block' }} />
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                  }}>{b.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--color-text-primary)',
                  }}>
                    {pct != null ? fmtSignedPct(pct, 1).replace('+', '') : '—'}
                  </span>
                  {vol != null && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--color-text-tertiary)',
                    }}>{vol.toFixed(2)}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div ref={containerRef} style={{ height: 240, width: '100%' }} />
        </>
      )}
    </Panel>
  )
}
