/**
 * FORECAST — source cross-check: OPEC crude production, EIA international vs
 * JODI, on the same 5 members that report to JODI (Saudi, Kuwait, Nigeria,
 * Algeria, Venezuela). Two lines; close tracking = the EIA read is corroborated.
 */

import { useMemo } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { useOpecCrossCheck } from '../../../hooks/useApiData'
import { ErrorBlock, Skel } from '../_shared'
import { useLwChart, toLwPoints } from '../lwChart'

const EIA_COLOR  = '#3dd6c4'
const JODI_COLOR = '#f5a623'

function Legend() {
  const items = [
    { c: EIA_COLOR,  label: 'EIA INTERNATIONAL' },
    { c: JODI_COLOR, label: 'JODI' },
  ]
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
      {items.map(i => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 2, background: i.c, display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>{i.label}</span>
        </div>
      ))}
    </div>
  )
}

export function OpecCrossCheckPanel() {
  const { data, isLoading, error } = useOpecCrossCheck()

  const eiaPts = useMemo(() => toLwPoints(data?.history ?? [], 'eia'), [data])
  const jodiPts = useMemo(() => toLwPoints(data?.history ?? [], 'jodi'), [data])

  const containerRef = useLwChart(
    chart => {
      const add = (pts: { time: string; value: number }[], color: string) => {
        if (!pts.length) return
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 2,
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          priceLineVisible: false,
        })
        s.setData(pts)
      }
      add(eiaPts, EIA_COLOR)
      add(jodiPts, JODI_COLOR)
    },
    [eiaPts, jodiPts],
  )

  const diff = data?.diff_latest ?? null

  return (
    <Panel
      title="SOURCE CROSS-CHECK"
      subtitle="OPEC crude — EIA vs JODI · 5 reporting members · MBD"
      headerRight={
        <>
          <Badge variant="muted">{data?.latest_period?.slice(0, 7) ?? '—'}</Badge>
          {diff != null && (
            <Badge variant="muted">Δ {diff > 0 ? '+' : ''}{diff.toFixed(2)} MBD</Badge>
          )}
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <>
          <Legend />
          <div ref={containerRef} style={{ height: 240, width: '100%' }} />
          <div style={{
            marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--color-text-tertiary)', letterSpacing: '0.04em',
          }}>
            {(data?.members ?? []).join(' · ')} — JODI's other OPEC members don't report production.
          </div>
        </>
      )}
    </Panel>
  )
}
