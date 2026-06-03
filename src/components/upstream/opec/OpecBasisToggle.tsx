/**
 * Global crude / total-liquids toggle for the OPEC+ subtab.
 * Lives in the subtab header; its value is threaded into the data hooks so the
 * crude and liquids views cache independently.
 */

import { Pill } from '../../ui/Badge'
import type { OpecBasis } from './opecShared'
import { BASIS_SHORT } from './opecShared'

export function OpecBasisToggle({
  value,
  onChange,
}: {
  value: OpecBasis
  onChange: (b: OpecBasis) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-text-tertiary)',
      }}>
        Basis
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {(['crude', 'liquids'] as OpecBasis[]).map(b => (
          <Pill
            key={b}
            variant={value === b ? 'active' : 'default'}
            onClick={() => onChange(b)}
          >
            {BASIS_SHORT[b]}
          </Pill>
        ))}
      </div>
    </div>
  )
}
