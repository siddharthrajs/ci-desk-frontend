/**
 * Annual proved reserves — crude (BBbl) + dry natural gas (Tcf). Two tile
 * cards side-by-side, each with a sparkline of the historical series.
 */

import { useMemo } from 'react'
import { LineSeries, type IChartApi } from 'lightweight-charts'
import type { ReservesPoint } from '../../types/api'
import { useUsReserves } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

function ReservesTile({
  label, year, value, unit, history, color,
}: {
  label:   string
  year:    string | null
  value:   number | null
  unit:    string
  history: ReservesPoint[]
  color:   string
}) {
  const points = useMemo(() => toLwPoints(history, 'value'), [history])

  const ref = useLwChart(
    (chart: IChartApi) => {
      if (!points.length) return
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
        color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false,
      })
      s.setData(points)
    },
    [points, color],
  )

  return (
    <div style={{
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      minHeight: 90,
    }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-text-secondary)', marginBottom: 4,
        }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
            color: value == null ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          }}>
            {value == null ? '—' : value.toFixed(1)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {unit}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          {year ? `as of ${year}` : '—'}
        </div>
      </div>
      <div ref={ref} style={{ flex: 1, height: 60, minWidth: 0 }} />
    </div>
  )
}

export function ReservesFooter() {
  const { data, isLoading, error } = useUsReserves()

  if (isLoading && !data) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-gap)' }}>
        <Skel h={90} />
        <Skel h={90} />
      </div>
    )
  }

  if (error) {
    return <ErrorBlock error={error} height={90} />
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
        }}>
          US PROVED RESERVES
        </span>
        <CadenceBadge cadence="ANNUAL · ~3Y LAG" updated={data?.last_updated} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-gap)' }}>
        <ReservesTile
          label="CRUDE OIL"
          year={data?.crude_latest_year ?? null}
          value={data?.crude_proved_bbbl ?? null}
          unit="Billion Bbl"
          history={data?.crude_history ?? []}
          color="#3dd6c4"
        />
        <ReservesTile
          label="DRY NATURAL GAS"
          year={data?.ng_latest_year ?? null}
          value={data?.ng_proved_tcf ?? null}
          unit="Trillion Cf"
          history={data?.ng_history ?? []}
          color="#8b6cef"
        />
      </div>
    </div>
  )
}
