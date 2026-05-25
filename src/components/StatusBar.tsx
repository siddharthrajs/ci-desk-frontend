import { useEffect, useState } from 'react'
import { STATUS_SOURCES, STATUS_STREAMS } from '../constants/mockData'

function formatTime(d: Date) {
  return d.toTimeString().slice(0, 8)
}

function formatUTC(d: Date) {
  return d.toUTCString().slice(17, 25)
}

function nextRefreshUTC(d: Date) {
  const next = new Date(d)
  next.setSeconds(next.getSeconds() + 30 - (next.getSeconds() % 30))
  next.setMilliseconds(0)
  return formatUTC(next)
}

export function StatusBar() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Mock system stats
  const cpu = '04'
  const mem = '318MB'

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 28,
      background: 'var(--color-bg-panel)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 14,
      gap: 0,
    }}>
      {/* Left: connection + sources */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--color-bull)',
            display: 'inline-block',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.06em',
          }}>
            CONNECTED · {STATUS_STREAMS} STREAMS
          </span>
        </div>

        <div style={{ width: 1, height: 12, background: 'var(--color-border)', flexShrink: 0 }} />

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.05em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          SRC: {STATUS_SOURCES.join(' · ')}
        </span>
      </div>

      {/* Center: refresh times */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}>
        LAST REFRESH: {formatUTC(now)} UTC · NEXT: {nextRefreshUTC(now)} UTC
      </div>

      {/* Right: sys stats + clocks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.05em',
        }}>
          CPU {cpu}% · MEM {mem}
        </span>

        <div style={{ width: 1, height: 12, background: 'var(--color-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
            }}>LOC</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
            }}>
              {formatTime(now)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
            }}>UTC</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
            }}>
              {formatUTC(now)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
