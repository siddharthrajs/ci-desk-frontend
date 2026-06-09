import { useMidstreamData } from '../hooks/useApiData'
import { InventoryKpiRow }         from '../components/midstream/InventoryKpiRow'
import { InventoryHistoryPanel }   from '../components/midstream/InventoryHistoryPanel'
import { SprLevelPanel }           from '../components/midstream/SprLevelPanel'
import { RefineryUtilizationPanel } from '../components/midstream/RefineryUtilizationPanel'
import { DaysOfSupplyPanel }       from '../components/midstream/DaysOfSupplyPanel'
import { ExportsPanel }            from '../components/midstream/ExportsPanel'
import { ImportsPanel }            from '../components/midstream/ImportsPanel'
import { PaddMovementsPanel }      from '../components/midstream/PaddMovementsPanel'

export function Midstream() {
  // Legacy monolith — still consumed by SprLevelPanel and RefineryUtilizationPanel.
  const { data, isLoading, error } = useMidstreamData()
  const legacyProps = { data, isLoading, error: error as Error | null }

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
          MIDSTREAM
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
          INVENTORIES · SPR · REFINERY · EXPORTS · IMPORTS · PADD FLOWS
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap)' }}>

        {/* ── Inventory KPI strip — 5 stocks ──────────────────────────────── */}
        <InventoryKpiRow />

        {/* ── Inventory history — full-width lwcharts area ─────────────────── */}
        <InventoryHistoryPanel />

        {/* ── Bottom row: SPR | Refinery | Days of Supply ─────────────────── */}
        <div className="ms-bottom-grid">
          <SprLevelPanel {...legacyProps} />
          <RefineryUtilizationPanel {...legacyProps} />
          <DaysOfSupplyPanel />
        </div>

        {/* ── Crude exports — full-width ───────────────────────────────────── */}
        <ExportsPanel />

        {/* ── Imports | PADD Movements ─────────────────────────────────────── */}
        <div className="top-row-grid">
          <ImportsPanel />
          <PaddMovementsPanel />
        </div>

      </div>
    </div>
  )
}
