import { useUpstreamData } from '../hooks/useApiData'
import { OpecMonitorPanel } from '../components/upstream/OpecMonitorPanel'
import { SupplyBalancePanel } from '../components/upstream/SupplyBalancePanel'
import { UsProductionPanel } from '../components/upstream/UsProductionPanel'
import { DucWellsPanel } from '../components/upstream/DucWellsPanel'
import { NonOpecProductionPanel } from '../components/upstream/NonOpecProductionPanel'

export function Upstream() {
  const { data, isLoading, error } = useUpstreamData()
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
          UPSTREAM
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
          SUPPLY · RIGS · OPEC+
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ── Top row: OPEC monitor (60%) + supply balance (40%) ─────────── */}
        <div className="top-row-grid">
          <OpecMonitorPanel {...panelProps} />
          <SupplyBalancePanel {...panelProps} />
        </div>

        {/* ── Middle row: US production (65%) + DUC wells (35%) ──────────── */}
        <div className="mid-row-grid">
          <UsProductionPanel {...panelProps} />
          <DucWellsPanel {...panelProps} />
        </div>

        {/* ── Bottom row: Non-OPEC production by country (full width) ─────── */}
        <NonOpecProductionPanel {...panelProps} />
      </div>
    </div>
  )
}
