import type { ReactNode, CSSProperties } from 'react'

export interface PanelProps {
  title: string
  subtitle?: string
  headerRight?: ReactNode
  children: ReactNode
  style?: CSSProperties
  bodyStyle?: CSSProperties
  /** Remove body padding — use when a table/chart should bleed to the edges */
  noPadding?: boolean
}

export function Panel({
  title,
  subtitle,
  headerRight,
  children,
  style,
  bodyStyle,
  noPadding = false,
}: PanelProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        ...style,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: subtitle ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: '11px 18px',
          borderBottom: '1px solid var(--color-border)',
          gap: 12,
          minHeight: 42,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-tertiary)',
                marginTop: 2,
                letterSpacing: '0.06em',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {headerRight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {headerRight}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: noPadding ? 0 : 20, ...bodyStyle }}>
        {children}
      </div>
    </div>
  )
}
