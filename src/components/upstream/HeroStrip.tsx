/**
 * Sticky top strip with 4 KPI cards:
 *   1. US weekly crude production
 *   2. EIA monthly rig count
 *   3. L48 weekly crude production
 *   4. Weekly net imports
 *
 * Composed from the crude-production + rig-count hooks — no extra fetch.
 */

import { useUsCrudeProduction, useUsRigCount } from '../../hooks/useApiData'
import { Delta, Skel } from './_shared'

function HeroCard({
  label,
  cadence,
  value,
  unit,
  wow,
  wowLabel,
  yoy,
  yoyIsPct,
  loading,
}: {
  label: string
  cadence: string
  value: number | null
  unit: string
  wow: number | null
  wowLabel: string
  yoy: number | null
  yoyIsPct?: boolean
  loading: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minHeight: 96,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.05em',
        }}>
          {cadence}
        </span>
      </div>

      {loading ? (
        <>
          <Skel h={28} w={120} />
          <Skel h={11} w={140} />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1,
              color: value == null ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {value == null ? '—' : value.toFixed(unit === 'count' ? 0 : 2)}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.05em',
            }}>
              {unit === 'count' ? '' : unit}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <Delta change={wow} label={wowLabel} decimals={unit === 'count' ? 0 : 2} compact />
            <Delta change={yoy} label="YoY" decimals={yoyIsPct ? 2 : 0} pct={yoyIsPct} compact />
          </div>
        </>
      )}
    </div>
  )
}

export function HeroStrip() {
  const prod = useUsCrudeProduction()
  const rigs = useUsRigCount()

  const prodLoading = prod.isLoading && !prod.data
  const rigsLoading = rigs.isLoading && !rigs.data

  // For rig count YoY we have raw counts; show abs change as the "YoY" value
  // since the percent ratio isn't always meaningful at low rig counts.
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 'var(--spacing-gap)',
    }}>
      <HeroCard
        label="US CRUDE PRODUCTION"
        cadence="WEEKLY · WED"
        value={prod.data?.weekly_us_mbd ?? null}
        unit="MBD"
        wow={prod.data?.weekly_us_wow ?? null}
        wowLabel="WoW"
        yoy={prod.data?.weekly_us_yoy ?? null}
        yoyIsPct
        loading={prodLoading}
      />
      <HeroCard
        label="EIA RIG COUNT"
        cadence="MONTHLY"
        value={rigs.data?.latest_total ?? null}
        unit="count"
        wow={rigs.data?.mom_change ?? null}
        wowLabel="MoM"
        yoy={rigs.data?.yoy_change ?? null}
        loading={rigsLoading}
      />
      <HeroCard
        label="LOWER 48 CRUDE"
        cadence="WEEKLY · WED"
        value={prod.data?.weekly_l48_mbd ?? null}
        unit="MBD"
        wow={prod.data?.weekly_l48_wow ?? null}
        wowLabel="WoW"
        yoy={null}
        loading={prodLoading}
      />
      <HeroCard
        label="NET CRUDE IMPORTS"
        cadence="WEEKLY · WED"
        value={prod.data?.weekly_net_imports_mbd ?? null}
        unit="MBD"
        wow={prod.data?.weekly_net_imports_wow ?? null}
        wowLabel="WoW"
        yoy={null}
        loading={prodLoading}
      />
    </div>
  )
}
