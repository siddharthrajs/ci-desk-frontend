import { useEffect, useRef, useState } from 'react'
import { useMarkets } from '../contexts/MarketsContext'

type TickerKey = 'brent' | 'wti' | 'ho' | 'gasoil'

interface TickerSpec {
  id: TickerKey
  label: string
  product: string
  decimals: number
}

const SPECS: TickerSpec[] = [
  { id: 'brent',  label: 'BRENT',  product: 'Brent',      decimals: 2 },
  { id: 'wti',    label: 'WTI',    product: 'WTI',        decimals: 2 },
  { id: 'ho',     label: 'HO',     product: 'HeatingOil', decimals: 4 },
  { id: 'gasoil', label: 'GASOIL', product: 'Gasoil',     decimals: 2 },
]

function fmt(value: number | null, decimals: number): string {
  if (value === null || !isFinite(value)) return '—'
  return value.toFixed(decimals)
}

interface RowProps {
  spec: TickerSpec
  vwap: number | null
  tenor: string | null
  flash: 'up' | 'down' | null
}

function TickerRow({ spec, vwap, tenor, flash }: RowProps) {
  const labelText = tenor ? `${spec.label} ${tenor}` : spec.label
  const flashColor =
    flash === 'up' ? 'var(--color-bull)' :
    flash === 'down' ? 'var(--color-bear)' :
    'var(--color-text-primary)'

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        color: 'var(--color-text-secondary)',
      }}>
        {labelText}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 500,
        color: flashColor,
        transition: 'color 600ms ease-out',
      }}>
        {fmt(vwap, spec.decimals)}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        color: 'var(--color-text-tertiary)',
      }}>
        VWAP
      </span>
    </div>
  )
}

export function TickerStrip() {
  const { curves } = useMarkets()

  // Track previous VWAP per ticker so we can flash green/red on change.
  const prevRef = useRef<Record<TickerKey, number | null>>({
    brent: null, wti: null, ho: null, gasoil: null,
  })
  const [flashes, setFlashes] = useState<Record<TickerKey, 'up' | 'down' | null>>({
    brent: null, wti: null, ho: null, gasoil: null,
  })

  const rows = SPECS.map(spec => {
    const outrights = curves[spec.product]?.OUTRIGHT ?? []
    const first = outrights[0] ?? null
    return {
      spec,
      vwap: first?.vwap ?? null,
      tenor: first?.label ?? null,
    }
  })

  useEffect(() => {
    const next: Partial<Record<TickerKey, 'up' | 'down'>> = {}
    let changed = false
    for (const row of rows) {
      const prev = prevRef.current[row.spec.id]
      if (row.vwap !== null && prev !== null && row.vwap !== prev) {
        next[row.spec.id] = row.vwap > prev ? 'up' : 'down'
        changed = true
      }
      if (row.vwap !== null) prevRef.current[row.spec.id] = row.vwap
    }
    if (!changed) return
    setFlashes(curr => ({ ...curr, ...next }))
    const t = setTimeout(() => {
      setFlashes(curr => {
        const reset = { ...curr }
        for (const key of Object.keys(next) as TickerKey[]) reset[key] = null
        return reset
      })
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map(r => r.vwap).join('|')])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 36,
      background: 'var(--color-bg-panel)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 14,
      gap: 0,
    }}>
      {/* Instruments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <div key={row.spec.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {i > 0 && (
              <div style={{ width: 1, height: 14, background: 'var(--color-border)', marginInline: 14 }} />
            )}
            <TickerRow
              spec={row.spec}
              vwap={row.vwap}
              tenor={row.tenor}
              flash={flashes[row.spec.id]}
            />
          </div>
        ))}
      </div>

      {/* Right: source info */}
      <div style={{
        marginLeft: 18,
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.06em',
      }}>
        LIVE · SRC: LIGHTSTREAMER
      </div>
    </div>
  )
}
