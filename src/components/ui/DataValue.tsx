import type { CSSProperties } from 'react'

export type DataSize = 'sm' | 'md' | 'lg' | 'hero'

interface SizeTokens {
  valueFontSize: number
  changeFontSize: number
  fontWeight: number
  changeGap: number
  arrowSize: number
}

const SIZE_MAP: Record<DataSize, SizeTokens> = {
  sm:   { valueFontSize: 13, changeFontSize: 11, fontWeight: 500, changeGap: 2, arrowSize: 9  },
  md:   { valueFontSize: 15, changeFontSize: 11, fontWeight: 600, changeGap: 2, arrowSize: 9  },
  lg:   { valueFontSize: 22, changeFontSize: 12, fontWeight: 600, changeGap: 3, arrowSize: 10 },
  hero: { valueFontSize: 48, changeFontSize: 13, fontWeight: 700, changeGap: 4, arrowSize: 11 },
}

export interface DataValueProps {
  value: number | string
  /** Signed delta (positive = bull, negative = bear) */
  change?: number
  /** Free-form label appended after the change number, e.g. "MOM" */
  changeLabel?: string
  /** Units appended inline after the value, e.g. "MBD" */
  unit?: string
  size?: DataSize
  /** Decimal places for numeric value (default: 2) */
  decimals?: number
  style?: CSSProperties
}

export function DataValue({
  value,
  change,
  changeLabel,
  unit,
  size = 'md',
  decimals = 2,
  style,
}: DataValueProps) {
  const t = SIZE_MAP[size]
  const isPos = change !== undefined && change >= 0
  const arrow = change === undefined ? null : change === 0 ? '—' : isPos ? '▲' : '▼'
  const changeColor = change === 0
    ? 'var(--color-text-tertiary)'
    : isPos
    ? 'var(--color-bull)'
    : 'var(--color-bear)'

  const displayValue =
    typeof value === 'number'
      ? value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : value

  const changeAbs = change !== undefined ? Math.abs(change) : 0
  const changeStr =
    change !== undefined
      ? (change > 0 ? '+' : change < 0 ? '-' : '') + changeAbs.toFixed(decimals)
      : null

  return (
    <div style={style}>
      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: t.valueFontSize,
            fontWeight: t.fontWeight,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: size === 'hero' ? '-0.02em' : 0,
          }}
        >
          {displayValue}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: t.changeFontSize,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.05em',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Change row */}
      {change !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.changeGap,
            marginTop: size === 'hero' ? 6 : 3,
            color: changeColor,
          }}
        >
          {arrow && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: t.arrowSize, lineHeight: 1 }}>
              {arrow}
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: t.changeFontSize, lineHeight: 1 }}>
            {changeStr}
          </span>
          {changeLabel && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: t.changeFontSize - 1,
                color: 'var(--color-text-tertiary)',
                marginLeft: 2,
                letterSpacing: '0.06em',
              }}
            >
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
