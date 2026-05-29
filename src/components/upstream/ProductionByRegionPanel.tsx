/**
 * Small-multiples: one mini chart per region (TX, ND, NM, PADD 2, PADD 3, GoA).
 * Each tile has a label, latest value, MoM/YoY deltas, and a sparkline-style
 * lightweight-charts line.
 */

import { useMemo } from 'react'
import { LineSeries, type IChartApi } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import type { ProductionByRegionResponse, RegionHistoryPoint } from '../../types/api'
import { useUsProductionByRegion } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel, Delta } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

type RegionKey = keyof Omit<RegionHistoryPoint, 'date'>

const REGION_DEFS: { key: RegionKey; label: string; color: string }[] = [
  { key: 'texas',           label: 'TEXAS',       color: '#3dd6c4' },
  { key: 'north_dakota',    label: 'NORTH DAKOTA', color: '#3dd6c4' },
  { key: 'new_mexico',      label: 'NEW MEXICO',  color: '#3dd6c4' },
  { key: 'padd2',           label: 'PADD 2',      color: '#f5a623' },
  { key: 'padd3',           label: 'PADD 3',      color: '#f5a623' },
  { key: 'gulf_of_america', label: 'GULF OF AMERICA', color: '#8b6cef' },
]

function RegionTile({
  label, color, history, latest,
}: {
  label:   string
  color:   string
  history: { time: string; value: number }[]
  latest:  { current: number | null; mom_change: number | null; yoy_change: number | null } | undefined
}) {
  const ref = useLwChart(
    (chart: IChartApi) => {
      if (!history.length) return
      // Strip everything visual except the line itself.
      chart.applyOptions({
        rightPriceScale: { visible: false },
        leftPriceScale:  { visible: false },
        timeScale: { visible: false, borderVisible: false },
        grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
        handleScale:  false,
        handleScroll: false,
      })
      const s = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      s.setData(history)
    },
    [history, color],
  )

  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-text-secondary)',
      }}>{label}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 20,
          fontWeight: 600,
          color: latest?.current == null ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        }}>
          {latest?.current == null ? '—' : latest.current.toFixed(3)}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
        }}>MBD</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 1 }}>
        <Delta change={latest?.mom_change ?? null} label="MoM" decimals={3} compact />
        <Delta change={latest?.yoy_change ?? null} label="YoY" decimals={3} compact />
      </div>

      <div ref={ref} style={{ height: 50, marginTop: 2, width: '100%' }} />
    </div>
  )
}

export function ProductionByRegionPanel() {
  const { data, isLoading, error } = useUsProductionByRegion()

  const seriesByKey = useMemo(() => {
    const out: Record<string, { time: string; value: number }[]> = {}
    if (!data?.history) return out
    for (const r of REGION_DEFS) {
      out[r.key] = toLwPoints(data.history.slice(0, 24), r.key as RegionKey)
    }
    return out
  }, [data])

  return (
    <Panel
      title="PRODUCTION BY REGION"
      subtitle="Monthly · petroleum/crd/crpdn · MBD"
      headerRight={<CadenceBadge cadence="MONTHLY" updated={data?.last_updated} />}
    >
      {isLoading && !data ? (
        <Skel h={260} />
      ) : error ? (
        <ErrorBlock error={error} height={260} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--spacing-gap)',
        }}>
          {REGION_DEFS.map(r => (
            <RegionTile
              key={r.key}
              label={r.label}
              color={r.color}
              history={seriesByKey[r.key] ?? []}
              latest={data?.regions?.[r.key as keyof ProductionByRegionResponse['regions']]}
            />
          ))}
        </div>
      )}
    </Panel>
  )
}
