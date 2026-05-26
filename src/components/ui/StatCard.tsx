import type { CSSProperties } from 'react'
import { DataValue } from './DataValue'
import type { DataSize } from './DataValue'

export interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  change?: number
  changeLabel?: string
  decimals?: number
  size?: DataSize
  /** Dim secondary line below the change */
  note?: string
  style?: CSSProperties
}

export function StatCard({
  label,
  value,
  unit,
  change,
  changeLabel,
  decimals,
  size = 'lg',
  note,
  style,
}: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </div>

      <DataValue
        value={value}
        unit={unit}
        change={change}
        changeLabel={changeLabel}
        decimals={decimals}
        size={size}
      />

      {note && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.05em',
            marginTop: 2,
          }}
        >
          {note}
        </div>
      )}
    </div>
  )
}
