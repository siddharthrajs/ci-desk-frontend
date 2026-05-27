import { useOilQuotes } from '../../hooks/useApiData'
import type { QuoteData } from '../../types/api'

function QuoteCell({ q }: { q: QuoteData }) {
  const bull = (q.dp ?? 0) >= 0
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 16px',
      borderRight: '1px solid var(--color-border)',
      flexShrink: 0,
      height: '100%',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        color: 'var(--color-text-secondary)',
      }}>
        {q.symbol}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
      }}>
        {q.c != null ? `$${q.c.toFixed(2)}` : '—'}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: bull ? 'var(--color-bull)' : 'var(--color-bear)',
      }}>
        {q.dp != null ? `${q.dp >= 0 ? '+' : ''}${q.dp.toFixed(2)}%` : '—'}
      </span>
    </div>
  )
}

export function QuotesBar() {
  const { data, isLoading } = useOilQuotes()

  return (
    <div style={{
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      height: 40,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 14px',
        borderRight: '1px solid var(--color-border)',
        flexShrink: 0,
        height: '100%',
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--color-bull)',
          display: 'inline-block',
          boxShadow: '0 0 5px var(--color-bull)',
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--color-text-tertiary)',
        }}>
          EQUITIES
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        height: '100%',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {isLoading && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            padding: '0 16px',
          }}>
            Loading quotes...
          </span>
        )}
        {data?.quotes.map(q => <QuoteCell key={q.symbol} q={q} />)}
      </div>

      <div style={{
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.06em',
        padding: '0 14px',
        borderLeft: '1px solid var(--color-border)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        FINNHUB · 30S
      </div>
    </div>
  )
}
