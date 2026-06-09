const OUTCOME_COLORS = [
  'var(--color-bull)',
  'var(--color-bear)',
  'var(--color-amber)',
  '#4a9eff',
  '#a78bfa',
]

interface ProbabilityBarProps {
  outcomes: string[]
  prices: number[]
  size?: 'sm' | 'md'
}

export function ProbabilityBar({ outcomes, prices, size = 'sm' }: ProbabilityBarProps) {
  if (outcomes.length === 0 || prices.length === 0) return null

  const count = Math.min(outcomes.length, prices.length)
  const clipped = prices.slice(0, count).map(p => Math.min(Math.max(p, 0), 1))
  const total = clipped.reduce((a, b) => a + b, 0)
  const widths = total > 0
    ? clipped.map(p => (p / total) * 100)
    : clipped.map(() => 100 / count)

  const barHeight = size === 'md' ? 10 : 6

  return (
    <div>
      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: count === 2 ? 'space-between' : 'flex-start',
        flexWrap: 'wrap',
        gap: count === 2 ? 0 : 8,
        marginBottom: 4,
      }}>
        {count === 2 ? (
          <>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: OUTCOME_COLORS[0],
              letterSpacing: '0.06em',
            }}>
              {outcomes[0].toUpperCase()} {Math.round(clipped[0] * 100)}%
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: OUTCOME_COLORS[1],
              letterSpacing: '0.06em',
            }}>
              {Math.round(clipped[1] * 100)}% {outcomes[1].toUpperCase()}
            </span>
          </>
        ) : (
          outcomes.slice(0, count).map((outcome, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
              letterSpacing: '0.06em',
            }}>
              {outcome.toUpperCase()} {Math.round(clipped[i] * 100)}%
            </span>
          ))
        )}
      </div>

      {/* Bar */}
      <div style={{
        display: 'flex',
        height: barHeight,
        overflow: 'hidden',
        borderRadius: 999,
        background: 'var(--color-bg-elevated)',
      }}>
        {widths.map((w, i) => (
          <div
            key={i}
            style={{
              width: `${w}%`,
              background: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
              transition: 'width 0.4s ease',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
