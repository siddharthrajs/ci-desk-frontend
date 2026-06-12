import { useState, useEffect, type CSSProperties } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { getWpsrTable, refreshWpsrTable } from '../../lib/api'
import { API_BASE_URL } from '../../lib/config'
import type { WPSRTable, WPSRPeriodDates } from '../../types/api'
import { Panel } from '../ui'
import { WpsrSectionTable } from './WpsrSectionTable'
import { WpsrKpiBar } from './WpsrKpiBar'

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const HOUR_MS = 60 * 60 * 1000

const wpsrQueryKey = (n: number) => ['wpsr', n] as const

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
  const [refreshingAll, setRefreshingAll] = useState(false)
  const [cronRefreshing, setCronRefreshing] = useState(false)

  useEffect(() => {
    const es = new EventSource(`${API_BASE_URL}/api/reports/wpsr/stream`)
    es.addEventListener('wpsr_refresh_start', () => setCronRefreshing(true))
    es.addEventListener('wpsr_refresh_done', () => {
      setCronRefreshing(false)
      TABLE_NUMBERS.forEach(n =>
        queryClient.invalidateQueries({ queryKey: wpsrQueryKey(n) })
      )
    })
    es.onerror = () => setCronRefreshing(false)
    return () => es.close()
  }, [queryClient])

  // Fire all 9 fetches in parallel; each table renders the moment its single
  // request lands rather than waiting on the slowest one. Tables already
  // cached in React Query during the same browser session resolve instantly.
  const queries = useQueries({
    queries: TABLE_NUMBERS.map(n => ({
      queryKey: wpsrQueryKey(n),
      queryFn:  () => getWpsrTable(n),
      staleTime: HOUR_MS,
    })),
  })

  const selectedQuery = queries[selectedTable - 1]
  const table: WPSRTable | undefined = selectedQuery.data

  // Force-refresh: hit `?refresh=true` for every table in parallel and write
  // results into the cache as they arrive. The selected table re-renders the
  // moment it lands, even if 1-2 of the others are still in flight.
  async function refreshAll() {
    setRefreshingAll(true)
    try {
      await Promise.allSettled(
        TABLE_NUMBERS.map(async n => {
          const fresh = await refreshWpsrTable(n)
          queryClient.setQueryData<WPSRTable>(wpsrQueryKey(n), fresh)
        }),
      )
    } finally {
      setRefreshingAll(false)
    }
  }

  const inFlightCount = queries.filter(q => q.isFetching).length
  const firstError = queries.find(q => q.error)?.error as Error | undefined

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
        {cronRefreshing && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-amber)',
            letterSpacing: '0.06em',
          }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-amber)',
              animation: 'wpsrPulse 1.2s ease-in-out infinite',
            }} />
            CRON REFRESH
          </span>
        )}
        {refreshingAll && inFlightCount > 0 && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-amber)',
            letterSpacing: '0.06em',
          }}>
            {inFlightCount}/{TABLE_NUMBERS.length} IN FLIGHT
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          LAST FETCH:{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {formatFetchedAt(table?.last_fetched)}
          </span>
        </span>
        <button
          type="button"
          onClick={refreshAll}
          disabled={refreshingAll}
          style={fetchButtonStyle(refreshingAll)}
        >
          {refreshingAll ? 'FETCHING…' : 'FETCH NOW'}
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
        const q = queries[n - 1]
        const loading = q.isFetching
        const errored = !!q.error && !q.data
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
              position: 'relative',
            }}
          >
            <span style={{ opacity: 0.7, fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>TBL {n}</span>
              <span style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: errored
                  ? 'var(--color-bear)'
                  : loading
                  ? 'var(--color-amber)'
                  : q.data
                  ? 'var(--color-bull)'
                  : 'var(--color-text-tertiary)',
                animation: loading ? 'wpsrPulse 1.2s ease-in-out infinite' : 'none',
              }} />
            </span>
            <span>{TABLE_SHORT_LABELS[n]}</span>
          </button>
        )
      })}
    </div>
  )

  // ── Body content ──
  let body: React.ReactNode
  if (!table && selectedQuery.isLoading) {
    body = <LoadingState message={`LOADING TABLE ${selectedTable}…`} />
  } else if (!table && selectedQuery.error) {
    body = <ErrorState message={(selectedQuery.error as Error).message} />
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
      <style>{`@keyframes wpsrPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
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
      {firstError && table && (
        <div style={{
          marginTop: 10,
          padding: '6px 10px',
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-bear)',
          color: 'var(--color-bear)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.06em',
        }}>
          ONE OR MORE TABLES FAILED: {firstError.message.toUpperCase()}
        </div>
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
