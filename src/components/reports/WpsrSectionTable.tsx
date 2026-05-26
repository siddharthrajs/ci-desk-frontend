import type { WPSRSection } from '../../types/api'
import { DataTable, type ColumnDef } from '../ui'

/** Field-name heuristics — used to decide column formatting. */
function isChangeField(field: string): boolean {
  return field.startsWith('diff_') || field.startsWith('pct_')
}

function isPercentField(field: string): boolean {
  return field.startsWith('pct_') || field === 'share_2025_pct'
}

function decimalsFor(field: string): number {
  // Most WPSR numerics are quoted to 0–3 decimals; we choose by field family.
  if (field === 'share_2025_pct') return 1
  if (isPercentField(field)) return 1
  // Stocks tables (table 1 section A, 4, 5, 6) carry millions-of-barrels
  // values printed to 3 decimals; KBPD numbers (table 1 sect B, 2, 3, 7, 9)
  // are whole numbers. We can't tell from the field name alone, so default
  // to 2 and let the renderer trim trailing zeros where reasonable.
  return 2
}

interface Props {
  section: WPSRSection
}

export function WpsrSectionTable({ section }: Props) {
  const labelCols: ColumnDef<WPSRRow>[] = section.label_columns.map(name => ({
    key: name,
    header: name === 'group' ? 'GROUP' : 'ITEM',
    align: 'left',
    width: name === 'group' ? '22%' : undefined,
  }))

  const numericCols: ColumnDef<WPSRRow>[] = section.numeric_columns.map((field, i) => ({
    key: field,
    header: section.column_headers[i] ?? field,
    align: 'right',
    isChange: isChangeField(field),
    decimals: decimalsFor(field),
  }))

  const columns = [...labelCols, ...numericCols]

  // Labels repeat across rows (e.g. "East Coast (PADD 1)" under multiple
  // product groups), so synthesise an index field for the React row key.
  const rowsWithKey: WPSRRow[] = section.rows.map((row, i) => ({
    ...row,
    _idx: i,
  }))

  return (
    <DataTable<WPSRRow>
      columns={columns}
      rows={rowsWithKey}
      rowKey="_idx"
    />
  )
}

// Re-exported here so the column generic above resolves without dragging the
// type signature through every consumer.
type WPSRRow = Record<string, string | number | null>
