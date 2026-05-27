import { useRef, useState } from 'react'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0 })
  const [dragging, setDragging] = useState(false)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    drag.current.isDown = true
    drag.current.startX = e.clientX
    drag.current.scrollLeft = scrollRef.current.scrollLeft
    scrollRef.current.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.isDown || !scrollRef.current) return
    e.preventDefault()
    const walk = e.clientX - drag.current.startX
    scrollRef.current.scrollLeft = drag.current.scrollLeft - walk
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.isDown) return
    drag.current.isDown = false
    if (scrollRef.current?.hasPointerCapture(e.pointerId)) {
      scrollRef.current.releasePointerCapture(e.pointerId)
    }
    setDragging(false)
  }

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

      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: dragging ? 'none' : 'auto',
          touchAction: 'pan-x',
        }}
      >
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
