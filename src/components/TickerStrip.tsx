import { TICKER_INSTRUMENTS } from '../constants/mockData'

function fmt(price: number, id: string) {
  if (id === 'rbob' || id === 'ho') return price.toFixed(3)
  if (id === 'bw') return price.toFixed(2)
  return price.toFixed(2)
}

export function TickerStrip() {
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
      {/* LIVE indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 18, flexShrink: 0 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--color-bull)',
          display: 'inline-block',
          boxShadow: '0 0 6px var(--color-bull)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--color-bull)',
        }}>LIVE</span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'var(--color-border)', marginRight: 18, flexShrink: 0 }} />

      {/* Instruments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, overflow: 'hidden' }}>
        {TICKER_INSTRUMENTS.map((inst, i) => {
          const isPos = inst.change >= 0
          const changeStr = (isPos ? '+' : '') + inst.change.toFixed(inst.id === 'rbob' || inst.id === 'ho' ? 3 : inst.id === 'bw' ? 2 : 2)
          return (
            <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {i > 0 && (
                <div style={{ width: 1, height: 14, background: 'var(--color-border)', marginInline: 14 }} />
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: inst.isSpread ? 'var(--color-amber)' : 'var(--color-text-secondary)',
                }}>
                  {inst.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}>
                  {fmt(inst.price, inst.id)}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: isPos ? 'var(--color-bull)' : 'var(--color-bear)',
                }}>
                  {changeStr}
                </span>
              </div>
            </div>
          )
        })}
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
        DELAYED 15M · SRC: NYMEX/ICE
      </div>
    </div>
  )
}
