/**
 * OPEC+ member production table — one row per country, sorted by output.
 * Source: /opec/production (EIA international, basis-aware). Numbers only
 * (charts elsewhere use lightweight-charts).
 */

import { useMemo } from 'react'
import { Panel } from '../../ui/Panel'
import { Badge } from '../../ui/Badge'
import { DataTable, type ColumnDef } from '../../ui/DataTable'
import { useOpecProduction } from '../../../hooks/useApiData'
import type { OpecBasis } from '../../../types/api'
import { ErrorBlock, Skel } from '../_shared'

type MemberRow = {
  iso3: string
  country: string
  latest_mbd: number
  mom: number | null
  yoy: number | null
  share_pct: number | null
}

const COLUMNS: ColumnDef<MemberRow>[] = [
  { key: 'country',    header: 'COUNTRY',  align: 'left' },
  { key: 'latest_mbd', header: 'MB/D',     align: 'right', decimals: 2 },
  { key: 'mom',        header: 'MoM',      align: 'right', isChange: true, decimals: 3 },
  { key: 'yoy',        header: 'YoY',      align: 'right', isChange: true, decimals: 3 },
  {
    key: 'share_pct', header: 'SHARE', align: 'right',
    render: row => (row.share_pct == null ? '—' : `${row.share_pct.toFixed(1)}%`),
  },
]

export function OpecMemberTablePanel({ basis }: { basis: OpecBasis }) {
  const { data, isLoading, error } = useOpecProduction(basis)

  const rows = useMemo<MemberRow[]>(
    () =>
      (data?.table ?? []).map(r => ({
        iso3: r.iso3,
        country: r.country,
        latest_mbd: r.latest_mbd,
        mom: r.mom,
        yoy: r.yoy,
        share_pct: r.share_pct,
      })),
    [data],
  )

  return (
    <Panel
      title="MEMBER PRODUCTION"
      subtitle={`${basis === 'crude' ? 'crude + condensate' : 'total liquids'} · MBD`}
      headerRight={<Badge variant="muted">{data?.hero?.latest_period ?? 'MONTHLY'}</Badge>}
      noPadding
    >
      {isLoading && !data ? (
        <div style={{ padding: 20 }}><Skel h={320} /></div>
      ) : error ? (
        <ErrorBlock error={error} height={320} />
      ) : (
        <DataTable columns={COLUMNS} rows={rows} rowKey="iso3" />
      )}
    </Panel>
  )
}
