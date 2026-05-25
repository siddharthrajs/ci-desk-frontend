import { useMidstreamData } from '../hooks/useApiData'
import { InventoryKpiRow } from '../components/midstream/InventoryKpiRow'
import { InventoryHistoryPanel } from '../components/midstream/InventoryHistoryPanel'
import { SprLevelPanel } from '../components/midstream/SprLevelPanel'
import { RefineryUtilizationPanel } from '../components/midstream/RefineryUtilizationPanel'
import { DaysOfSupplyPanel } from '../components/midstream/DaysOfSupplyPanel'

export function Midstream() {
  const { data, isLoading, error } = useMidstreamData()
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
          INVENTORIES · SPR · REFINERY UTILIZATION · SUPPLY LOGISTICS
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ── Inventory KPI cards — full width ────────────────────────────── */}
        <InventoryKpiRow {...panelProps} />

        {/* ── Inventory History — full width ──────────────────────────────── */}
        <InventoryHistoryPanel {...panelProps} />

        {/* ── Bottom row: SPR | Refinery Util | Days of Supply ────────────── */}
        <div className="ms-bottom-grid">
          <SprLevelPanel {...panelProps} />
          <RefineryUtilizationPanel {...panelProps} />
          <DaysOfSupplyPanel {...panelProps} />
        </div>
      </div>
    </div>
  )
}
