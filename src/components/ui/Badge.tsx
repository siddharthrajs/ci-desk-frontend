import type { ReactNode, CSSProperties, MouseEvent } from 'react'

export type BadgeVariant = 'default' | 'active' | 'muted' | 'bull' | 'bear'

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: 'transparent',
    border: '1px solid var(--color-border-muted)',
    color: 'var(--color-text-secondary)',
  },
  active: {
    background: 'var(--color-amber)',
    border: '1px solid var(--color-amber)',
    color: '#000',
  },
  muted: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-tertiary)',
  },
  bull: {
    background: 'var(--color-bull)',
    border: '1px solid var(--color-bull)',
    color: '#000',
  },
  bear: {
    background: 'var(--color-bear)',
    border: '1px solid var(--color-bear)',
    color: '#fff',
  },
}

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  style?: CSSProperties
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

/** Square-cornered label — source tags, statuses, row markers */
export function Badge({ children, variant = 'default', style, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.07em',
        padding: '2px 6px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        lineHeight: 1.5,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export interface PillProps extends BadgeProps {
  /** Dot indicator on the left */
  dot?: boolean
  dotColor?: string
}

/** Pill-shaped label — nav tabs, toggles, workspace labels */
export function Pill({ children, variant = 'default', dot, dotColor, style, onClick }: PillProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dot ? 5 : 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.07em',
        padding: '4px 12px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        lineHeight: 1.5,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: dotColor ?? 'currentColor',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}
