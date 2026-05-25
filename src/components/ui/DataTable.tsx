import type { ReactNode, CSSProperties } from 'react'
import { Sparkline } from './Sparkline'
import type { SparklineColor } from './Sparkline'

export interface ColumnDef<T extends Record<string, unknown>> {
  key: keyof T & string
  header: string
  align?: 'left' | 'right' | 'center'
  width?: number | string
  /** Render the cell as a signed change value with ▲/▼ and color */
  isChange?: boolean
  /** Render the cell as an inline Sparkline — column value must be number[] */
  isSparkline?: boolean
  /** Override sparkline color; defaults to auto (based on trend) */
  sparklineColor?: SparklineColor
  /** Decimal precision for numeric values (default: 2) */
  decimals?: number
  /** Custom render — takes precedence over all built-in rendering */
  render?: (row: T) => ReactNode
  style?: CSSProperties
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[]
  rows: T[]
  /** Field used as React key */
  rowKey: keyof T & string
  /** Mark a row as a totals/summary row — rendered bold with a top border */
  isTotalRow?: (row: T) => boolean
}

function fmtNum(val: number, decimals: number): string {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function renderCell<T extends Record<string, unknown>>(
  col: ColumnDef<T>,
  row: T,
): ReactNode {
  if (col.render) return col.render(row)

  const raw = row[col.key]

  // Sparkline
  if (col.isSparkline) {
    const arr = raw as number[]
    if (!Array.isArray(arr) || arr.length === 0) return null
    return (
      <Sparkline
        data={arr}
        autoColor={col.sparklineColor === undefined}
        color={col.sparklineColor}
        width={72}
        height={22}
      />
    )
  }

  // Change column
  if (col.isChange) {
    if (raw === null || raw === undefined) {
      return <span style={{ color: 'var(--color-text-tertiary)' }}>n/a</span>
    }
    const num = raw as number
    const isPos = num > 0
    const isZero = num === 0
    const arrow = isZero ? '' : isPos ? '▲' : '▼'
    const color = isZero
      ? 'var(--color-text-tertiary)'
      : isPos
      ? 'var(--color-bull)'
      : 'var(--color-bear)'
    const sign = isPos ? '+' : ''
    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {arrow && <span style={{ fontSize: '0.7em' }}>{arrow}</span>}
        <span>{sign}{fmtNum(Math.abs(num), col.decimals ?? 2)}</span>
      </span>
    )
  }

  // Null / undefined fallback
  if (raw === null || raw === undefined) {
    return <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
  }

  // Numeric
  if (typeof raw === 'number') {
    return fmtNum(raw, col.decimals ?? 2)
  }

  return String(raw)
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  isTotalRow,
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
        }}
      >
        {/* Head */}
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: '6px 10px 7px',
                  textAlign: col.align ?? 'left',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-tertiary)',
                  borderBottom: '1px solid var(--color-border)',
                  whiteSpace: 'nowrap',
                  width: col.width,
                  ...col.style,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row, ri) => {
            const isTotal = isTotalRow?.(row) ?? false
            return (
              <tr
                key={String(row[rowKey])}
                style={{
                  background: isTotal ? 'var(--color-bg-hover)' : 'transparent',
                  borderTop: isTotal ? '1px solid var(--color-border)' : undefined,
                  cursor: 'default',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (!isTotal) e.currentTarget.style.background = 'var(--color-bg-hover)'
                }}
                onMouseLeave={e => {
                  if (!isTotal) e.currentTarget.style.background = 'transparent'
                }}
              >
                {columns.map((col, ci) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '7px 10px',
                      textAlign: col.align ?? 'left',
                      color: isTotal ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      fontWeight: isTotal || (ri === 0 && ci === 0) ? 600 : 400,
                      borderBottom: '1px solid var(--color-border)',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                      ...col.style,
                    }}
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
