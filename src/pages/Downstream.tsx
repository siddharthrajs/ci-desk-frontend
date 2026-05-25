import { useDownstreamData } from '../hooks/useApiData'
import { CrackSpreadsPanel } from '../components/downstream/CrackSpreadsPanel'
import { CrackSpreadHistoryPanel } from '../components/downstream/CrackSpreadHistoryPanel'
import { RefineryUtilizationHistoryPanel } from '../components/downstream/RefineryUtilizationHistoryPanel'
import { ProductDemandPanel } from '../components/downstream/ProductDemandPanel'

export function Downstream() {
  const { data, isLoading, error } = useDownstreamData()
  const panelProps = { data, isLoading, error: error as Error | null }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          DOWNSTREAM
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
          }}
        >
          CRACK SPREADS · REFINING MARGINS · PRODUCT DEMAND
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ── Top row: Crack spreads table | Crack spread history ─────────── */}
        <div className="ds-top-grid">
          <CrackSpreadsPanel {...panelProps} />
          <CrackSpreadHistoryPanel {...panelProps} />
        </div>

        {/* ── Bottom row: Refinery util history | Product demand ───────────── */}
        <div className="ds-bottom-grid">
          <RefineryUtilizationHistoryPanel {...panelProps} />
          <ProductDemandPanel {...panelProps} />
        </div>
      </div>
    </div>
  )
}
