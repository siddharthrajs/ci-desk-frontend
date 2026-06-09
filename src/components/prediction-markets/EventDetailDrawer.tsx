import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { PolymarketEvent } from '../../types/polymarket'
import { ProbabilityBar } from './ProbabilityBar'
import { MarketStatLine } from './MarketStatLine'

interface EventDetailDrawerProps {
  event: PolymarketEvent | null
  onClose: () => void
}

export function EventDetailDrawer({ event, onClose }: EventDetailDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!event) return null

  function fmtVolume(v: number | null): string {
    if (v == null) return ''
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
    return `$${v.toFixed(0)}`
  }

  const vol = fmtVolume(event.volume)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 84,
        right: 0,
        bottom: 0,
        width: 460,
        background: 'var(--color-bg-panel)',
        borderLeft: '1px solid var(--color-border)',
        zIndex: 101,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--color-border)',
          gap: 12,
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg-panel)',
          zIndex: 1,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.09em',
                color: event.active ? 'var(--color-bull)' : 'var(--color-text-tertiary)',
              }}>
                {event.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
              {vol && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--color-amber)',
                  letterSpacing: '0.06em',
                  background: 'rgba(245,166,35,0.12)',
                  padding: '1px 7px',
                  borderRadius: 3,
                }}>
                  {vol}
                </span>
              )}
            </div>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}>
              {event.title}
            </p>
            {event.tags.length > 0 && (
              <p style={{
                margin: '6px 0 0',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
              }}>
                {event.tags.map(t => t.label).filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 7,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Markets list */}
        <div style={{ flex: 1 }}>
          {event.markets.length === 0 ? (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              padding: '20px',
              margin: 0,
            }}>
              No markets available.
            </p>
          ) : (
            event.markets.map((m, i) => (
              <div
                key={m.conditionId}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < event.markets.length - 1 ? '1px solid var(--color-border)' : 'none',
                  opacity: m.closed ? 0.5 : 1,
                }}
              >
                {/* Status + question */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  {m.closed && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-tertiary)',
                      border: '1px solid var(--color-border)',
                      padding: '1px 5px',
                      borderRadius: 2,
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      CLOSED
                    </span>
                  )}
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4,
                  }}>
                    {m.question}
                  </p>
                </div>

                {/* Probability bar */}
                <div style={{ marginBottom: 8 }}>
                  <ProbabilityBar outcomes={m.outcomes} prices={m.outcomePrices} size="md" />
                </div>

                {/* Stats */}
                <MarketStatLine
                  volume={m.volume}
                  volume24hr={m.volume24hr}
                  liquidity={m.liquidity}
                  endDate={m.endDate}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
