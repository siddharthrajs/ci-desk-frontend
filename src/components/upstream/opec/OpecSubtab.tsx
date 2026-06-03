/**
 * OPEC+ subtab — composition root.
 *
 * Layout (sectioned single-scroll with a sticky jump-bar):
 *   OVERVIEW · PRODUCTION · CAPACITY & SPARE · SUPPLY RISK · COMPLIANCE · FORECAST
 *
 * The basis toggle (crude / total liquids) lives here and is threaded into the
 * data hooks as panels are wired up. Step 1 renders the shell with placeholders;
 * panels land section by section.
 */

import { useState } from 'react'
import { OpecBasisToggle } from './OpecBasisToggle'
import { SectionJumpBar } from './SectionJumpBar'
import { OpecSection } from './OpecSection'
import { OpecHeroStrip } from './OpecHeroStrip'
import { OpecProductionHistoryPanel } from './OpecProductionHistoryPanel'
import { OpecMemberTablePanel } from './OpecMemberTablePanel'
import { OpecCapacityPanel } from './OpecCapacityPanel'
import { OpecForecastPanel } from './OpecForecastPanel'
import { OpecBalancePanel } from './OpecBalancePanel'
import { OpecDisruptionsPanel } from './OpecDisruptionsPanel'
import { OpecCompliancePanel } from './OpecCompliancePanel'
import { OpecCrossCheckPanel } from './OpecCrossCheckPanel'
import type { OpecBasis } from './opecShared'
import { BASIS_LABEL, OPEC_SECTIONS } from './opecShared'

// Planned panels per section — drives the step-1 placeholders so the full
// layout is legible before the data panels are wired in.
const SECTION_PLAN: Record<string, { note?: string; panels: string[] }> = {
  overview: {
    panels: [
      'Hero KPIs — OPEC+ total · OPEC-12 · spare capacity · production capacity · compliance · market balance',
    ],
  },
  production: {
    panels: [
      'OPEC+ production — 10Y stacked area by member',
      'Member table (mb/d · MoM · YoY · share)',
      'Group split — OPEC vs OPEC+ others vs non-OPEC+',
      'Top movers (MoM Δ)',
    ],
  },
  capacity: {
    note: 'crude basis',
    panels: [
      'Production vs capacity over time (gap = spare)',
      'Spare capacity by country',
    ],
  },
  'supply-risk': {
    panels: ['Unplanned production disruptions — barrels offline by country'],
  },
  compliance: {
    note: 'crude basis',
    panels: [
      'Quota compliance table (required vs actual)',
      'Over / under-production by country',
    ],
  },
  forecast: {
    panels: [
      'OPEC+ production forecast cone (STEO, to 2027)',
      'Source cross-check — EIA vs JODI vs MOMR',
    ],
  },
}

function Placeholder({ panels }: { panels: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap)' }}>
      {panels.map(p => (
        <div
          key={p}
          style={{
            background: 'var(--color-bg-panel)',
            border: '1px dashed var(--color-border-muted)',
            padding: '22px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 64,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--color-amber)',
            border: '1px solid var(--color-amber)',
            padding: '1px 5px',
            borderRadius: 3,
            flexShrink: 0,
          }}>
            SOON
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.04em',
          }}>
            {p}
          </span>
        </div>
      ))}
    </div>
  )
}

export function OpecSubtab() {
  const [basis, setBasis] = useState<OpecBasis>('crude')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap)' }}>
      {/* Subtab sub-header — basis context + toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--color-text-primary)',
          }}>
            OPEC+
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.04em',
          }}>
            {BASIS_LABEL[basis]} · sources: EIA international / STEO · JODI · OPEC
          </span>
        </div>
        <OpecBasisToggle value={basis} onChange={setBasis} />
      </div>

      {/* Sticky in-page nav */}
      <SectionJumpBar sections={OPEC_SECTIONS} />

      {/* Sections */}
      {OPEC_SECTIONS.map(s => {
        const plan = SECTION_PLAN[s.id]
        return (
          <OpecSection key={s.id} id={s.id} label={s.label} note={plan?.note}>
            {s.id === 'overview' ? (
              <OpecHeroStrip basis={basis} />
            ) : s.id === 'production' ? (
              <>
                <OpecProductionHistoryPanel basis={basis} />
                <OpecMemberTablePanel basis={basis} />
              </>
            ) : s.id === 'capacity' ? (
              <OpecCapacityPanel />
            ) : s.id === 'supply-risk' ? (
              <OpecDisruptionsPanel />
            ) : s.id === 'compliance' ? (
              <OpecCompliancePanel />
            ) : s.id === 'forecast' ? (
              <>
                <OpecForecastPanel />
                <OpecBalancePanel />
                <OpecCrossCheckPanel />
              </>
            ) : (
              <Placeholder panels={plan?.panels ?? []} />
            )}
          </OpecSection>
        )
      })}
    </div>
  )
}
