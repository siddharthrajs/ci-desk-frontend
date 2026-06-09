import type { PolymarketMarket } from '../../types/polymarket'
import { ProbabilityBar } from './ProbabilityBar'
import { MarketStatLine } from './MarketStatLine'

interface MarketRowProps {
  market: PolymarketMarket
  onClick?: () => void
  asCard?: boolean
}

export function MarketRow({ market, onClick, asCard = false }: MarketRowProps) {
  const inner = (
    <div style={{ padding: asCard ? 16 : '12px 18px' }}>
      <p style={{
        margin: '0 0 8px',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        lineHeight: 1.4,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {market.question}
      </p>
      <div style={{ marginBottom: 6 }}>
        <ProbabilityBar outcomes={market.outcomes} prices={market.outcomePrices} />
      </div>
      <MarketStatLine
        volume={market.volume}
        volume24hr={market.volume24hr}
        liquidity={market.liquidity}
        endDate={market.endDate}
      />
    </div>
  )

  const hoverStyle = onClick ? {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.background = asCard
        ? 'var(--color-bg-elevated)'
        : 'var(--color-bg-elevated)'
      if (asCard) e.currentTarget.style.borderColor = 'var(--color-text-tertiary)'
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.background = asCard
        ? 'var(--color-bg-panel)'
        : 'transparent'
      if (asCard) e.currentTarget.style.borderColor = 'var(--color-border)'
    },
  } : {}

  if (asCard) {
    return (
      <div
        onClick={onClick}
        {...hoverStyle}
        style={{
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-border)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {inner}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      {...hoverStyle}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background 0.1s',
      }}
    >
      {inner}
    </div>
  )
}
