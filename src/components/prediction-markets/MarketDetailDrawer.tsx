import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import type { PolymarketMarket } from '../../types/polymarket'
import { ProbabilityBar } from './ProbabilityBar'

function fmtUSD(v: number | null): string {
  if (v == null || isNaN(v)) return '—'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function fmtDatetime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STAT_ROWS = [
  ['VOLUME', (m: PolymarketMarket) => fmtUSD(m.volume)],
  ['24H VOLUME', (m: PolymarketMarket) => fmtUSD(m.volume24hr)],
  ['LIQUIDITY', (m: PolymarketMarket) => fmtUSD(m.liquidity)],
  ['OUTCOMES', (m: PolymarketMarket) => String(m.outcomes.length)],
] as const

interface MarketDetailDrawerProps {
  market: PolymarketMarket | null
  onClose: () => void
}

export function MarketDetailDrawer({ market, onClose }: MarketDetailDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!market) return null

  const polymarketUrl = market.slug
    ? `https://polymarket.com/event/${market.slug}`
    : null

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

      {/* Drawer panel */}
      <div style={{
        position: 'fixed',
        top: 84,
        right: 0,
        bottom: 0,
        width: 420,
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
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.09em',
              color: market.active ? 'var(--color-bull)' : 'var(--color-text-tertiary)',
              marginBottom: 6,
            }}>
              {market.active ? 'ACTIVE' : market.closed ? 'CLOSED' : 'INACTIVE'}
            </div>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.45,
            }}>
              {market.question}
            </p>
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

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>

          {/* Probability */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              PROBABILITY
            </div>
            <ProbabilityBar outcomes={market.outcomes} prices={market.outcomePrices} size="md" />
          </div>

          {/* Stats grid */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              MARKET STATS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: 'var(--color-border)',
              border: '1px solid var(--color-border)',
            }}>
              {STAT_ROWS.map(([label, getValue]) => (
                <div key={label} style={{ background: 'var(--color-bg-elevated)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {getValue(market)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              DATES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['START', market.startDate],
                ['EXPIRES', market.endDate],
              ].map(([label, date]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {fmtDatetime(date ?? null)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {market.tags.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                TAGS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {market.tags.map((t, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    padding: '2px 8px',
                    borderRadius: 3,
                    letterSpacing: '0.06em',
                  }}>
                    {(t.label ?? t.slug ?? '').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External link */}
          {polymarketUrl && (
            <div style={{ marginTop: 'auto', paddingTop: 4 }}>
              <a
                href={polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  padding: '10px 16px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <ExternalLink size={12} />
                VIEW ON POLYMARKET
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
