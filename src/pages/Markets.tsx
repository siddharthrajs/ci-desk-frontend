import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useMarketWebSocket } from '../hooks/useMarketWebSocket'
import { ForwardCurvePanel } from '../components/markets/ForwardCurvePanel'
import { SpreadCurvePanel } from '../components/markets/SpreadCurvePanel'

type InstrumentType = 'OUTRIGHT' | '1MS' | 'FLY'

interface Selection {
  product: string
  type: InstrumentType
}

interface ProductMeta {
  key: string
  display: string
  color: string
  unit: string
}

const PRODUCTS: ProductMeta[] = [
  { key: 'Brent', display: 'BRENT', color: '#f5a623', unit: '$/BBL' },
  { key: 'WTI', display: 'WTI', color: '#26a69a', unit: '$/BBL' },
  { key: 'Gasoil', display: 'GASOIL', color: '#42a5f5', unit: '$/MT' },
  { key: 'HeatingOil', display: 'HEATING OIL', color: '#ab47bc', unit: '$/GAL' },
]

const TYPES: { value: InstrumentType; suffix: string }[] = [
  { value: 'OUTRIGHT', suffix: 'FORWARD CURVE' },
  { value: '1MS', suffix: 'SPREADS (1MS)' },
  { value: 'FLY', suffix: 'BUTTERFLIES (FLY)' },
]

const STORAGE_KEY = 'ci-desk.markets.selections.v1'

const DEFAULT_SELECTIONS: Selection[] = [
  { product: 'Brent', type: 'OUTRIGHT' },
  { product: 'WTI', type: 'OUTRIGHT' },
  { product: 'Gasoil', type: 'OUTRIGHT' },
  { product: 'HeatingOil', type: 'OUTRIGHT' },
]

function loadSelections(): Selection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SELECTIONS
    const parsed = JSON.parse(raw) as Selection[]
    if (!Array.isArray(parsed)) return DEFAULT_SELECTIONS
    const valid = parsed.filter(s =>
      PRODUCTS.some(p => p.key === s.product) &&
      TYPES.some(t => t.value === s.type),
    )
    return valid
  } catch {
    return DEFAULT_SELECTIONS
  }
}

function saveSelections(selections: Selection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
  } catch {
    /* ignore */
  }
}

function selectionKey(s: Selection): string {
  return `${s.product}::${s.type}`
}

function formatTime(ts: number | null): string {
  if (ts === null) return '—'
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
}

function countInstruments(curves: Record<string, Record<string, unknown[]>>): number {
  let n = 0
  for (const byType of Object.values(curves)) {
    for (const arr of Object.values(byType)) n += arr.length
  }
  return n
}

function typeSuffix(type: InstrumentType): string {
  return TYPES.find(t => t.value === type)?.suffix ?? type
}

export function Markets() {
  const { connected, curves, lastTick, feedError } = useMarketWebSocket()

  const [selections, setSelections] = useState<Selection[]>(() => loadSelections())
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    saveSelections(selections)
  }, [selections])

  useEffect(() => {
    if (!pickerOpen) return
    function onClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen])

  const totalInstruments = countInstruments(curves)

  const selectedKeys = useMemo(() => new Set(selections.map(selectionKey)), [selections])

  function addSelection(sel: Selection) {
    setSelections(prev => {
      if (prev.some(s => s.product === sel.product && s.type === sel.type)) return prev
      return [...prev, sel]
    })
  }

  function removeAt(index: number) {
    setSelections(prev => prev.filter((_, i) => i !== index))
  }

  function resetToDefaults() {
    setSelections(DEFAULT_SELECTIONS)
  }

  const statusColor = connected ? '#26a69a' : feedError ? '#ef5350' : '#f5a623'
  const statusLabel = connected ? 'CONNECTED' : feedError ? 'ERROR' : 'CONNECTING'
  const pulseStyle: CSSProperties = !connected && !feedError ? {
    animation: 'pulse 1.2s ease-in-out infinite',
  } : {}

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          MARKETS
        </h1>
        <p style={{
          margin: '4px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          FUTURES · OUTRIGHTS · SPREADS · CRACKS
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 18,
        padding: '6px 12px',
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColor,
            ...pulseStyle,
          }} />
          <span style={{ color: statusColor, letterSpacing: '0.07em' }}>{statusLabel}</span>
        </span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          LAST TICK: <span style={{ color: 'var(--color-text-secondary)' }}>{formatTime(lastTick)}</span>
        </span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          INSTRUMENTS: <span style={{ color: 'var(--color-text-secondary)' }}>{totalInstruments}</span>
        </span>
        {feedError && (
          <span style={{ color: '#ef5350', letterSpacing: '0.06em' }}>
            {feedError.toUpperCase()}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen(o => !o)}
            style={configButtonStyle}
          >
            + ADD CURVE
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            style={configButtonStyle}
            title="Reset to default 4 outright curves"
          >
            RESET
          </button>

          {pickerOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 260,
              background: 'var(--color-bg-panel)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              padding: 8,
              zIndex: 100,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.09em',
                color: 'var(--color-text-tertiary)',
                padding: '4px 6px 8px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: 6,
              }}>
                <span>CHOOSE PRODUCT & DERIVATIVE</span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  aria-label="Close"
                  title="Close"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gap: 2 }}>
                {PRODUCTS.map((p, pIdx) => (
                  <div key={p.key} style={{ marginTop: pIdx === 0 ? 0 : 6 }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: p.color,
                      padding: '4px 6px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <span style={{ color: p.color }}>●</span>
                      {p.display}
                    </div>
                    {TYPES.map(t => {
                      const sel: Selection = { product: p.key, type: t.value }
                      const already = selectedKeys.has(selectionKey(sel))
                      return (
                        <button
                          key={selectionKey(sel)}
                          type="button"
                          disabled={already}
                          onClick={() => addSelection(sel)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: already ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            padding: '5px 8px 5px 20px',
                            cursor: already ? 'default' : 'pointer',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                          onMouseEnter={(e) => {
                            if (!already) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-elevated)'
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                          }}
                        >
                          <span>{t.suffix}</span>
                          {already && <span style={{ fontSize: 9 }}>ADDED</span>}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selections.length === 0 ? (
        <div style={{
          padding: 32,
          marginBottom: 16,
          background: 'var(--color-bg-panel)',
          border: '1px dashed var(--color-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
          letterSpacing: '0.1em',
        }}>
          NO CURVES SELECTED — CLICK "+ ADD CURVE" TO START
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18, marginBottom: 16 }}>
          {PRODUCTS.map(product => {
            const items = selections
              .map((sel, idx) => ({ sel, idx }))
              .filter(({ sel }) => sel.product === product.key)
            if (items.length === 0) return null
            return (
              <section key={product.key}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${product.color}33`,
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: product.color,
                  }} />
                  <h2 style={{
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-primary)',
                  }}>
                    {product.display}
                  </h2>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.06em',
                  }}>
                    {product.unit}
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 16,
                }}>
                  {items.map(({ sel, idx }) => {
                    const curve = curves[sel.product]?.[sel.type] ?? []
                    return (
                      <ForwardCurvePanel
                        key={`${selectionKey(sel)}-${idx}`}
                        product={sel.product}
                        displayName={`${product.display} ${typeSuffix(sel.type)}`}
                        curve={curve}
                        color={product.color}
                        unit={product.unit}
                        onRemove={() => removeAt(idx)}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <SpreadCurvePanel curves={curves} />
    </div>
  )
}

const configButtonStyle: CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.07em',
  padding: '4px 10px',
  cursor: 'pointer',
  height: 24,
}
