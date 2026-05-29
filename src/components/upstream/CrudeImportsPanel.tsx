/**
 * Crude imports by country — toggleable between weekly preliminary (wimpc)
 * and monthly final (crude-oil-imports). Renders:
 *   - Top-10 country list as horizontal bars (HTML, not a chart)
 *   - Total imports history as a lightweight-charts line below
 */

import { useMemo, useState } from 'react'
import { LineSeries } from 'lightweight-charts'
import { Panel } from '../ui/Panel'
import { Pill, Badge } from '../ui/Badge'
import type { ImportsFeed } from '../../types/api'
import { useUsCrudeImports } from '../../hooks/useApiData'
import { CadenceBadge, ErrorBlock, Skel, Delta } from './_shared'
import { useLwChart, toLwPoints } from './lwChart'

type FeedKey = 'weekly_preliminary' | 'monthly_final'

function CountryRow({
  country, volume_mbd, share_pct, mom_change, is_opec_plus, maxVol,
}: {
  country: string
  volume_mbd: number
  share_pct: number
  mom_change: number | null
  is_opec_plus: boolean
  maxVol: number
}) {
  const widthPct = maxVol > 0 ? (volume_mbd / maxVol) * 100 : 0
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr 70px 60px 80px',
      alignItems: 'center',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid var(--color-border-muted)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{country}</span>
        {is_opec_plus && (
          <Badge variant="muted" style={{ fontSize: 9, color: 'var(--color-amber)', borderColor: 'rgba(245,166,35,0.4)' }}>
            OPEC+
          </Badge>
        )}
      </div>

      {/* bar */}
      <div style={{
        position: 'relative',
        height: 18,
        background: 'var(--color-bg-elevated)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${widthPct}%`,
          background: is_opec_plus ? 'rgba(245, 166, 35, 0.55)' : 'rgba(61, 214, 196, 0.55)',
        }} />
      </div>

      <span style={{
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--color-text-primary)',
      }}>{volume_mbd.toFixed(2)}</span>
      <span style={{
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
      }}>{share_pct.toFixed(1)}%</span>
      <div style={{ textAlign: 'right' }}>
        <Delta change={mom_change} decimals={2} compact />
      </div>
    </div>
  )
}

export function CrudeImportsPanel() {
  const { data, isLoading, error } = useUsCrudeImports()
  const [feedKey, setFeedKey] = useState<FeedKey>('weekly_preliminary')

  const feed: ImportsFeed | undefined = data?.[feedKey]
  const maxVol = feed?.top_origins?.[0]?.volume_mbd ?? 0

  const historyPoints = useMemo(() => {
    if (!feed?.history?.length) return []
    return toLwPoints(feed.history, 'value')
  }, [feed])

  const containerRef = useLwChart(
    chart => {
      if (!historyPoints.length) return
      const series = chart.addSeries(LineSeries, {
        color: '#3dd6c4',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      })
      series.setData(historyPoints)
    },
    [historyPoints],
  )

  return (
    <Panel
      title="US CRUDE IMPORTS BY ORIGIN"
      subtitle={feedKey === 'weekly_preliminary'
        ? 'Weekly preliminary · top-10 countries · MBD'
        : 'Monthly final · top-10 countries · MBD'}
      headerRight={
        <>
          <Pill
            variant={feedKey === 'weekly_preliminary' ? 'active' : 'default'}
            onClick={() => setFeedKey('weekly_preliminary')}
          >
            WEEKLY
          </Pill>
          <Pill
            variant={feedKey === 'monthly_final' ? 'active' : 'default'}
            onClick={() => setFeedKey('monthly_final')}
          >
            MONTHLY
          </Pill>
          <CadenceBadge
            cadence={feedKey === 'weekly_preliminary' ? 'WED 10:30 ET' : 'MONTHLY · ~60D LAG'}
            updated={data?.last_updated}
          />
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={320} />
      ) : error ? (
        <ErrorBlock error={error} height={320} />
      ) : !feed?.top_origins?.length ? (
        <ErrorBlock error={null} height={320} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Totals row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: 6,
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: 'var(--color-text-tertiary)',
              }}>TOTAL IMPORTS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}>{feed?.total_mbd?.toFixed(2) ?? '—'}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-text-tertiary)',
              }}>MBD</span>
            </div>
          </div>

          {/* Bar list */}
          <div>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 70px 60px 80px',
              gap: 12,
              padding: '4px 0',
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--color-text-tertiary)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span>COUNTRY</span>
              <span />
              <span style={{ textAlign: 'right' }}>MBD</span>
              <span style={{ textAlign: 'right' }}>SHARE</span>
              <span style={{ textAlign: 'right' }}>MoM</span>
            </div>
            {feed.top_origins.map(o => (
              <CountryRow key={o.country} {...o} maxVol={maxVol} />
            ))}
          </div>

          {/* Total history chart */}
          <div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', color: 'var(--color-text-tertiary)',
              marginBottom: 6,
            }}>TOTAL IMPORTS HISTORY</div>
            <div ref={containerRef} style={{ height: 120, width: '100%' }} />
          </div>
        </div>
      )}
    </Panel>
  )
}
