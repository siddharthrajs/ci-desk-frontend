import { useMacroData, useMacroBrief } from '../hooks/useApiData'
import { StatCard } from '../components/ui/StatCard'
import { MorningBriefPanel } from '../components/macro/MorningBriefPanel'

export function Macro() {
  const { data: macro } = useMacroData()
  const { data: brief, isLoading: briefLoading, error: briefError } = useMacroBrief()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          MACRO
        </h1>
        <p style={{
          margin: '4px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          FRED INDICATORS · MORNING BRIEF
        </p>
      </div>

      {/* FRED strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard
          label="DXY"
          value={macro?.dxy.latest_value ?? '—'}
          decimals={2}
          note={macro?.dxy.latest_date ?? undefined}
        />
        <StatCard
          label="10Y UST"
          value={macro?.us10y.latest_value ?? '—'}
          unit="%"
          decimals={2}
          note={macro?.us10y.latest_date ?? undefined}
        />
        <StatCard
          label="Fed Funds"
          value={macro?.fed_funds.latest_value ?? '—'}
          unit="%"
          decimals={2}
          note={macro?.fed_funds.latest_date ?? undefined}
        />
        <StatCard
          label="WTI"
          value={macro?.wti.latest_value ?? '—'}
          unit="$/bbl"
          decimals={2}
          note={macro?.wti.latest_date ?? undefined}
        />
      </div>

      {/* Morning brief */}
      <MorningBriefPanel
        data={brief}
        isLoading={briefLoading}
        error={briefError as Error | null}
      />
    </div>
  )
}
