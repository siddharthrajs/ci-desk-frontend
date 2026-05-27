import { useEconomicCalendar } from '../../hooks/useApiData'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { BadgeVariant } from '../ui/Badge'
import type { EconomicEvent } from '../../types/api'

const COLS = '110px 1fr 72px 100px 100px 100px'
const HEADERS = ['DATE / TIME', 'EVENT', 'IMPACT', 'PREVIOUS', 'ESTIMATE', 'ACTUAL']

function impactVariant(impact: string | null): BadgeVariant {
  const i = (impact ?? '').toLowerCase()
  if (i === 'high') return 'bear'
  if (i === 'medium') return 'active'
  return 'muted'
}

function fmtVal(val: number | null, unit: string | null): string {
  if (val == null) return '—'
  const s = val % 1 === 0 ? val.toString() : val.toFixed(2)
  return unit ? `${s} ${unit}` : s
}

function EventRow({ e }: { e: EconomicEvent }) {
  const isPast = e.actual != null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        alignItems: 'center',
        gap: 12,
        padding: '8px 18px',
        borderBottom: '1px solid var(--color-border-muted)',
        opacity: isPast ? 0.6 : 1,
        background: 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={el => (el.currentTarget.style.background = 'var(--color-bg-hover)')}
      onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {e.time ?? '—'}
      </span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {e.event ?? '—'}
      </span>
      <div>
        <Badge variant={impactVariant(e.impact)}>
          {(e.impact ?? '—').toUpperCase()}
        </Badge>
      </div>
      {(['prev', 'estimate', 'actual'] as const).map(field => (
        <span key={field} style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: field === 'actual' && e.actual != null
            ? 'var(--color-text-primary)'
            : 'var(--color-text-secondary)',
          textAlign: 'right',
        }}>
          {fmtVal(e[field], e.unit)}
        </span>
      ))}
    </div>
  )
}

export function EconomicCalendar() {
  const { data, isLoading, error } = useEconomicCalendar()
  const events = data?.events ?? []

  return (
    <Panel
      title="Economic Calendar"
      subtitle="EIA RELEASES · OPEC · MACRO EVENTS"
      headerRight={
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
        }}>
          {events.length} EVENTS · DAILY
        </span>
      }
      noPadding
    >
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        gap: 12,
        padding: '7px 18px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
      }}>
        {HEADERS.map(h => (
          <span key={h} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)',
          }}>
            {h}
          </span>
        ))}
      </div>

      <div style={{
        overflowY: 'auto',
        height: 'calc(100dvh - 336px)',
      }}>
        {isLoading && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            padding: '16px 18px',
            margin: 0,
          }}>
            Loading...
          </p>
        )}
        {!isLoading && error && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-bear)',
            padding: '16px 18px',
            margin: 0,
          }}>
            Failed to load calendar
          </p>
        )}
        {!isLoading && !error && events.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            padding: '16px 18px',
            margin: 0,
          }}>
            No events in the selected date range
          </p>
        )}
        {events.map((e, i) => <EventRow key={i} e={e} />)}
      </div>
    </Panel>
  )
}
