import { useCrackSpreads, useRefineryUtilization, useProductDemand } from '../hooks/useApiData'
import { CrackSpreadsPanel } from '../components/downstream/CrackSpreadsPanel'
import { CrackSpreadHistoryPanel } from '../components/downstream/CrackSpreadHistoryPanel'
import { RefineryUtilizationHistoryPanel } from '../components/downstream/RefineryUtilizationHistoryPanel'
import { ProductDemandPanel } from '../components/downstream/ProductDemandPanel'

export function Downstream() {
  const crackQuery  = useCrackSpreads()
  const utilQuery   = useRefineryUtilization()
  const demandQuery = useProductDemand()

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
          <CrackSpreadsPanel
            data={crackQuery.data}
            isLoading={crackQuery.isLoading}
            error={crackQuery.error as Error | null}
          />
          <CrackSpreadHistoryPanel
            data={crackQuery.data}
            isLoading={crackQuery.isLoading}
            error={crackQuery.error as Error | null}
          />
        </div>

        {/* ── Bottom row: Refinery util history | Product demand ───────────── */}
        <div className="ds-bottom-grid">
          <RefineryUtilizationHistoryPanel
            data={utilQuery.data}
            isLoading={utilQuery.isLoading}
            error={utilQuery.error as Error | null}
          />
          <ProductDemandPanel
            data={demandQuery.data}
            isLoading={demandQuery.isLoading}
            error={demandQuery.error as Error | null}
          />
        </div>
      </div>
    </div>
  )
}
