/**
 * One labeled section of the OPEC+ subtab. Owns the scroll-anchor id (so the
 * jump-bar can target it) and a section header rule. Panels are passed as
 * children and stacked with the standard gap.
 */

import type { ReactNode } from 'react'
import { JUMP_BAR_OFFSET } from './opecShared'

export function OpecSection({
  id,
  label,
  note,
  children,
}: {
  id: string
  label: string
  note?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: JUMP_BAR_OFFSET + 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-gap)',
      }}
    >
      {/* Section header rule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        {note && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}>
            {note}
          </span>
        )}
        <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      </div>

      {children}
    </section>
  )
}
