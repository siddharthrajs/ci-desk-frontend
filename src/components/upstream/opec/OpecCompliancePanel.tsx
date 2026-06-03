/**
 * COMPLIANCE — OPEC+ required (quota) vs actual crude production.
 * Over-producing (actual > required) is the notable state, shown amber.
 * Actuals lag the quota month — both periods are surfaced.
 */

import { useMemo } from 'react'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { DataTable, type ColumnDef } from '../../ui/DataTable'
import { useOpecCompliance } from '../../../hooks/useApiData'
import { ErrorBlock, Skel } from '../_shared'

type Row = {
  iso3: string
  country: string
  required_mbd: number
  actual_mbd: number | null
  delta_mbd: number | null
  status: string | null
}

const COLUMNS: ColumnDef<Row>[] = [
  { key: 'country',      header: 'MEMBER',   align: 'left' },
  { key: 'required_mbd', header: 'REQUIRED', align: 'right', decimals: 2 },
  { key: 'actual_mbd',   header: 'ACTUAL',   align: 'right', decimals: 2 },
  {
    key: 'delta_mbd', header: 'Δ vs QUOTA', align: 'right',
    render: row => {
      if (row.delta_mbd == null) return '—'
      const over = row.delta_mbd > 0
      return (
        <span style={{ fontFamily: 'var(--font-mono)', color: over ? 'var(--color-amber)' : 'var(--color-bull)' }}>
          {over ? '+' : ''}{row.delta_mbd.toFixed(2)}
        </span>
      )
    },
  },
  {
    key: 'status', header: 'STATUS', align: 'right',
    render: row =>
      row.status === 'over' ? <Badge variant="bear">OVER</Badge>
      : row.status === 'under' ? <Badge variant="muted">UNDER</Badge>
      : row.status === 'on' ? <Badge variant="muted">ON</Badge>
      : <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>,
  },
]

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: color ?? 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}

export function OpecCompliancePanel() {
  const { data, isLoading, error } = useOpecCompliance()
  const rows = useMemo<Row[]>(() => data?.rows ?? [], [data])

  const delta = data?.total_delta_mbd ?? null
  const deltaColor = delta == null ? undefined : delta > 0 ? 'var(--color-amber)' : 'var(--color-bull)'

  return (
    <Panel
      title="QUOTA COMPLIANCE"
      subtitle="OPEC+ required vs actual crude · MBD"
      headerRight={<Badge variant="muted">{data?.as_of ? `QUOTA ${data.as_of}` : '—'}</Badge>}
      noPadding
    >
      {isLoading && !data ? (
        <div style={{ padding: 20 }}><Skel h={300} /></div>
      ) : error ? (
        <ErrorBlock error={error} height={300} />
      ) : (
        <>
          {/* Summary */}
          <div style={{
            display: 'flex', gap: 28, flexWrap: 'wrap',
            padding: '14px 18px', borderBottom: '1px solid var(--color-border)',
          }}>
            <SummaryItem label="Required" value={data?.total_required_mbd != null ? data.total_required_mbd.toFixed(2) : '—'} />
            <SummaryItem label="Actual" value={data?.total_actual_mbd != null ? data.total_actual_mbd.toFixed(2) : '—'} />
            <SummaryItem
              label="Group Δ"
              value={delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)}` : '—'}
              color={deltaColor}
            />
            <SummaryItem label="Actual as of" value={data?.actual_period ?? '—'} />
          </div>

          <DataTable columns={COLUMNS} rows={rows} rowKey="iso3" />

          <div style={{
            padding: '8px 18px 14px', fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--color-text-tertiary)', letterSpacing: '0.04em',
          }}>
            Actual = crude + condensate (EIA international), lags the quota month. Iran / Libya / Venezuela exempt.
          </div>
        </>
      )}
    </Panel>
  )
}
