import { useState, type CSSProperties } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getWpsrTables, refreshWpsrTables } from '../../lib/api'
import type { WPSRResponse, WPSRTable, WPSRPeriodDates } from '../../types/api'
import { Panel } from '../ui'
import { WpsrSectionTable } from './WpsrSectionTable'
import { WpsrKpiBar } from './WpsrKpiBar'

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const TABLE_SHORT_LABELS: Record<number, string> = {
  1: 'Balance',
  2: 'Refiner',
  3: 'Blender',
  4: 'Stocks',
  5: 'Gas/Eth',
  6: 'Dist/Jet',
  7: 'Im/Ex',
  8: 'Origins',
  9: 'History',
}

function formatIsoDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso + 'T00:00:00Z')
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    })
  } catch { return iso }
}

function formatFetchedAt(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-GB', { hour12: false })
  } catch { return iso }
}

function PeriodChip({ label, date }: { label: string; date?: string }) {
  if (!date) return null
  return (
    <div style={chipStyle}>
      <span style={chipLabelStyle}>{label}</span>
      <span style={chipDateStyle}>{formatIsoDate(date)}</span>
    </div>
  )
}

function PeriodStrip({ dates }: { dates: WPSRPeriodDates }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <PeriodChip label="CURRENT"      date={dates.current} />
      <PeriodChip label="PRIOR WEEK"   date={dates.prior_week} />
      <PeriodChip label="YEAR AGO"     date={dates.year_ago} />
      <PeriodChip label="TWO YEARS AGO" date={dates.two_years_ago} />
    </div>
  )
}

export function WpsrView() {
  const queryClient = useQueryClient()
  const [selectedTable, setSelectedTable] = useState<number>(1)

  const query = useQuery<WPSRResponse>({
    queryKey: ['wpsr'],
    queryFn: getWpsrTables,
    staleTime: 60_000,
  })

  const refresh = useMutation({
    mutationFn: refreshWpsrTables,
    onSuccess: data => queryClient.setQueryData<WPSRResponse>(['wpsr'], data),
  })

  const isBusy = query.isFetching || refresh.isPending
  const data = query.data
  const table: WPSRTable | undefined = data?.tables[String(selectedTable)]

  // ── Header bar ──
  const headerBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 14px',
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      marginBottom: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-text-primary)',
        }}>
          EIA WEEKLY PETROLEUM STATUS REPORT
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          SOURCE · ir.eia.gov/wpsr · REL WED 10:30 ET
        </span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          LAST FETCH:{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {formatFetchedAt(data?.last_fetched)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => refresh.mutate()}
          disabled={isBusy}
          style={fetchButtonStyle(isBusy)}
        >
          {isBusy ? 'FETCHING…' : 'FETCH NOW'}
        </button>
      </div>
    </div>
  )

  // ── Table selector pills ──
  const selector = (
    <div style={{
      display: 'flex',
      gap: 0,
      marginBottom: 14,
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg-panel)',
      overflow: 'hidden',
      flexWrap: 'wrap',
    }}>
      {TABLE_NUMBERS.map((n, i) => {
        const active = n === selectedTable
        return (
          <button
            key={n}
            type="button"
            onClick={() => setSelectedTable(n)}
            style={{
              flex: '1 1 0',
              minWidth: 90,
              padding: '8px 10px',
              background: active ? 'var(--color-amber)' : 'transparent',
              color: active ? '#000' : 'var(--color-text-secondary)',
              border: 'none',
              borderLeft: i === 0 ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'background 0.1s, color 0.1s',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <span style={{ opacity: 0.7, fontSize: 9 }}>TBL {n}</span>
            <span>{TABLE_SHORT_LABELS[n]}</span>
          </button>
        )
      })}
    </div>
  )

  // ── Body content ──
  let body: React.ReactNode
  if (query.isLoading) {
    body = <LoadingState message="LOADING WPSR…" />
  } else if (query.error) {
    body = <ErrorState message={(query.error as Error).message} />
  } else if (!table) {
    body = <LoadingState message="NO DATA" />
  } else {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <WpsrKpiBar table={table} />
        {table.sections.map(section => (
          <Panel
            key={section.name}
            title={section.title}
            subtitle={`TABLE ${table.table_number}${
              table.sections.length > 1 ? ` · §${section.name.toUpperCase()}` : ''
            }`}
            headerRight={<PeriodStrip dates={section.period_dates} />}
            noPadding
          >
            <WpsrSectionTable section={section} />
          </Panel>
        ))}
      </div>
    )
  }

  return (
    <div>
      {headerBar}
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: 'var(--color-text-primary)',
        marginBottom: 8,
      }}>
        {table?.title ?? 'WPSR'}
      </div>
      {selector}
      {body}
      {refresh.isError && (
        <ErrorState message={`Refresh failed: ${(refresh.error as Error).message}`} />
      )}
    </div>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function LoadingState({ message }: { message: string }) {
  return (
    <div style={emptyStateStyle}>{message}</div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ ...emptyStateStyle, borderColor: 'var(--color-bear)', color: 'var(--color-bear)' }}>
      {message.toUpperCase()}
    </div>
  )
}

const emptyStateStyle: CSSProperties = {
  padding: 32,
  background: 'var(--color-bg-panel)',
  border: '1px dashed var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  letterSpacing: '0.1em',
}

const chipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-base)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.05em',
}

const chipLabelStyle: CSSProperties = {
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.08em',
  fontSize: 9,
}

const chipDateStyle: CSSProperties = {
  color: 'var(--color-text-primary)',
  fontWeight: 600,
}

function fetchButtonStyle(disabled: boolean): CSSProperties {
  return {
    background: disabled ? 'var(--color-bg-elevated)' : 'var(--color-amber)',
    color: disabled ? 'var(--color-text-tertiary)' : '#000',
    border: `1px solid ${disabled ? 'var(--color-border)' : 'var(--color-amber)'}`,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '6px 14px',
    cursor: disabled ? 'wait' : 'pointer',
    transition: 'background 0.1s, color 0.1s',
  }
}
