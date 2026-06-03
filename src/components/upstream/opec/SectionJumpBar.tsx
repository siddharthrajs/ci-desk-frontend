/**
 * Sticky in-page navigation for the OPEC+ subtab. Renders one pill per section
 * and scroll-spies the document so the pill for the section currently in view
 * is highlighted. Clicking a pill smooth-scrolls to that section.
 */

import { useEffect, useState } from 'react'
import type { OpecSectionDef } from './opecShared'

export function SectionJumpBar({ sections }: { sections: OpecSectionDef[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  // Scroll-spy: the active section is the topmost one whose heading has
  // scrolled past the fixed chrome (ticker + navbar + this bar).
  useEffect(() => {
    const els = sections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null)
    if (!els.length) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // Top margin clears the fixed chrome; bottom margin makes a section
      // "active" once it reaches the upper third of the viewport.
      { rootMargin: '-150px 0px -55% 0px', threshold: 0 },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      padding: '10px 0',
      background: 'linear-gradient(var(--color-bg-base) 70%, rgba(10,10,10,0))',
      backdropFilter: 'blur(2px)',
    }}>
      {sections.map(s => {
        const isActive = s.id === active
        return (
          <button
            key={s.id}
            onClick={() => jump(s.id)}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              padding: '5px 11px',
              border: '1px solid',
              borderColor: isActive ? 'var(--color-amber)' : 'var(--color-border)',
              background: isActive ? 'rgba(245,166,35,0.10)' : 'transparent',
              color: isActive ? 'var(--color-amber)' : 'var(--color-text-secondary)',
              transition: 'color 120ms, border-color 120ms, background 120ms',
            }}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
