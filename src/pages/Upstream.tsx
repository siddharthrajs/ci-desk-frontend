import { useState } from 'react'
import { Pill } from '../components/ui/Badge'
import { HeroStrip } from '../components/upstream/HeroStrip'
import { CrudeProductionPanel } from '../components/upstream/CrudeProductionPanel'
import { RigCountPanel } from '../components/upstream/RigCountPanel'
import { ProductionByRegionPanel } from '../components/upstream/ProductionByRegionPanel'
import { ApiGravityPanel } from '../components/upstream/ApiGravityPanel'
import { CrudeImportsPanel } from '../components/upstream/CrudeImportsPanel'
import { NaturalGasPanel } from '../components/upstream/NaturalGasPanel'
import { ReservesFooter } from '../components/upstream/ReservesFooter'
import { OpecSubtab } from '../components/upstream/opec/OpecSubtab'

type Subtab = 'us' | 'opec'

export function Upstream() {
  const [subtab, setSubtab] = useState<Subtab>('us')

  return (
    <div>
      {/* Header */}
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
          E&amp;P · PRODUCTION · RIGS · IMPORTS
        </p>
      </div>

      {/* Subtab nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Pill variant={subtab === 'us'   ? 'active' : 'default'} onClick={() => setSubtab('us')}>UNITED STATES</Pill>
        <Pill variant={subtab === 'opec' ? 'active' : 'default'} onClick={() => setSubtab('opec')}>OPEC+</Pill>
      </div>

      {subtab === 'us' ? <UnitedStatesSubtab /> : <OpecSubtab />}
    </div>
  )
}

function UnitedStatesSubtab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap)' }}>
      {/* HERO row — 4 KPI cards */}
      <HeroStrip />

      {/* PRIMARY chart — full width */}
      <CrudeProductionPanel />

      {/* Row: rigs + production-by-region */}
      <div className="top-row-grid">
        <RigCountPanel />
        <ProductionByRegionPanel />
      </div>

      {/* Row: imports + api gravity */}
      <div className="top-row-grid">
        <CrudeImportsPanel />
        <ApiGravityPanel />
      </div>

      {/* Natural gas — full width */}
      <NaturalGasPanel />

      {/* Reserves footer */}
      <ReservesFooter />
    </div>
  )
}
