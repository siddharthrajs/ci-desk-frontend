import type { PolymarketEvent, PolymarketMarket } from '../../types/polymarket'
import { ProbabilityBar } from './ProbabilityBar'

function fmtVolume(v: number | null): string {
  if (v == null) return ''
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function fmtEndDate(iso: string | null): string {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'EXPIRED'
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'TODAY'
  if (days <= 60) return `${days}D`
  return `${Math.round(days / 30)}MO`
}

function featuredMarket(markets: PolymarketMarket[]): PolymarketMarket | null {
  const active = markets.filter(m => m.active && !m.closed)
  const pool = active.length > 0 ? active : markets
  return pool.slice().sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))[0] ?? null
}

interface EventCardProps {
  event: PolymarketEvent
  onClick: () => void
}

export function EventCard({ event, onClick }: EventCardProps) {
  const vol = fmtVolume(event.volume)
  const end = fmtEndDate(event.endDate)
  const featured = featuredMarket(event.markets)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '14px 18px 10px',
        gap: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}>
            {event.title}
          </p>
          {event.tags.length > 0 && (
            <p style={{
              margin: '4px 0 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
            }}>
              {event.tags.map(t => t.label).filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {vol && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-amber)',
              letterSpacing: '0.06em',
              background: 'rgba(245,166,35,0.12)',
              padding: '2px 7px',
              borderRadius: 3,
            }}>
              {vol}
            </span>
          )}
          {end && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
            }}>
              {end}
            </span>
          )}
        </div>
      </div>

      {/* Featured probability bar */}
      {featured ? (
        <div style={{ padding: '12px 18px' }}>
          <p style={{
            margin: '0 0 8px',
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}>
            {featured.question}
          </p>
          <ProbabilityBar outcomes={featured.outcomes} prices={featured.outcomePrices} />
        </div>
      ) : (
        <div style={{ padding: '12px 18px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
            NO ACTIVE MARKETS
          </p>
        </div>
      )}
    </div>
  )
}
