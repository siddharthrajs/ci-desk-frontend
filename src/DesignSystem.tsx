export function DesignSystem() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)', minHeight: '100dvh', padding: '32px', gap: '20px', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
          CI-DESK / DESIGN SYSTEM
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '18px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Design Foundation
        </h1>
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Tokens · Typography · Color · Components
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>

        {/* ── Color Palette ── */}
        <section className="panel">
          <div className="label" style={{ marginBottom: '16px' }}>Color Palette</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Backgrounds</div>
            {[
              { label: '#0a0a0a — bg-base', bg: '#0a0a0a', border: '1px solid #333' },
              { label: '#111111 — bg-panel', bg: '#111111', border: '1px solid #333' },
              { label: '#161616 — bg-elevated', bg: '#161616', border: '1px solid #333' },
              { label: '#1c1c1c — bg-hover', bg: '#1c1c1c', border: '1px solid #333' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 32, height: 20, background: s.bg, border: s.border, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{s.label}</span>
              </div>
            ))}

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
            <div className="label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Data Accents</div>
            {[
              { label: '#3dd6c4 — bull / up', bg: '#3dd6c4' },
              { label: '#e5484d — bear / down', bg: '#e5484d' },
              { label: '#f5a623 — amber / selected', bg: '#f5a623' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 32, height: 20, background: s.bg, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{s.label}</span>
              </div>
            ))}

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
            <div className="label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Text</div>
            {[
              { label: '#e8e8e8 — primary', color: '#e8e8e8' },
              { label: '#888888 — secondary', color: '#888888' },
              { label: '#555555 — tertiary', color: '#555555' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 32, height: 20, background: s.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ── */}
        <section className="panel">
          <div className="label" style={{ marginBottom: '16px' }}>Typography</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div className="label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>Sans — Inter (labels / headers)</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>Panel Title</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 6 }}>Section Header</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 4 }}>Secondary label / description text</div>
              <div className="label" style={{ marginTop: 6 }}>Uppercase Label 10px</div>
            </div>

            <hr className="divider" />

            <div>
              <div className="label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>Mono — JetBrains Mono (data / numbers)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>82.47</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-bull)', marginTop: 4 }}>+1.23 (+1.52%)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 4 }}>Vol: 1,234,567 BBL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 4 }}>2026-05-25 14:32:01 UTC</div>
            </div>
          </div>
        </section>

        {/* ── Data Color Utilities ── */}
        <section className="panel">
          <div className="label" style={{ marginBottom: '16px' }}>Data Colors in Use</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Price row examples */}
            {[
              { symbol: 'WTI', price: '82.47', change: '+1.23', pct: '+1.52%', dir: 'bull' as const },
              { symbol: 'BRENT', price: '85.12', change: '-0.38', pct: '-0.45%', dir: 'bear' as const },
              { symbol: 'RBOB', price: '2.6710', change: '+0.0043', pct: '+0.16%', dir: 'bull' as const },
              { symbol: 'HO', price: '2.5980', change: '-0.0120', pct: '-0.46%', dir: 'bear' as const },
            ].map(row => (
              <div key={row.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', width: 52 }}>{row.symbol}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.price}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} className={row.dir}>{row.change}</span>
                <span className={`pill bg-${row.dir}`}>{row.pct}</span>
              </div>
            ))}

            <hr className="divider" />

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pill bg-bull">+1.52%</span>
              <span className="pill bg-bear">-0.45%</span>
              <span className="pill bg-amber">SELECTED</span>
              <span className="badge" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-muted)' }}>HEDGE</span>
              <span className="badge bg-bull">LONG</span>
              <span className="badge bg-bear">SHORT</span>
            </div>
          </div>
        </section>

        {/* ── Panel Hierarchy ── */}
        <section className="panel">
          <div className="label" style={{ marginBottom: '16px' }}>Panel Hierarchy</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '14px' }}>
              <div className="label" style={{ marginBottom: '6px' }}>bg-base · #0a0a0a</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Root / page background</span>
            </div>
            <div style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', padding: '14px' }}>
              <div className="label" style={{ marginBottom: '6px' }}>bg-panel · #111111</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Primary content panels</span>
            </div>
            <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-muted)', padding: '14px' }}>
              <div className="label" style={{ marginBottom: '6px' }}>bg-elevated · #161616</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Nested / elevated cards</span>
            </div>
            <div style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-border-muted)', padding: '14px' }}>
              <div className="label" style={{ marginBottom: '6px' }}>bg-hover · #1c1c1c</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Hover states / rows</span>
            </div>
          </div>
        </section>

        {/* ── Sample Panel — Price Ticker ── */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="label">Sample Panel — Crude Price Ticker</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>LIVE · 14:32:01 UTC</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--color-border)' }}>
            {[
              { symbol: 'WTI CRUDE', month: 'JUL 26', price: '82.47', change: '+1.23', pct: '+1.52%', bull: true },
              { symbol: 'BRENT', month: 'AUG 26', price: '85.12', change: '-0.38', pct: '-0.45%', bull: false },
              { symbol: 'RBOB GAS', month: 'JUL 26', price: '2.6710', change: '+0.0043', pct: '+0.16%', bull: true },
              { symbol: 'HEAT OIL', month: 'JUL 26', price: '2.5980', change: '-0.0120', pct: '-0.46%', bull: false },
              { symbol: 'NAT GAS', month: 'JUL 26', price: '2.1840', change: '+0.0210', pct: '+0.97%', bull: true },
              { symbol: 'GASOIL', month: 'AUG 26', price: '731.25', change: '-3.75', pct: '-0.51%', bull: false },
            ].map(item => (
              <div
                key={item.symbol}
                className="panel-elevated"
                style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label">{item.symbol}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{item.month}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {item.price}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} className={item.bull ? 'bull' : 'bear'}>
                    {item.change}
                  </span>
                  <span className={`badge ${item.bull ? 'bg-bull' : 'bg-bear'}`}>{item.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Spacing & Borders ── */}
        <section className="panel">
          <div className="label" style={{ marginBottom: '16px' }}>Spacing & Borders</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: '--spacing-panel', value: '22px', desc: 'Panel inner padding' },
              { name: '--spacing-gap', value: '18px', desc: 'Gap between panels' },
              { name: '--color-border', value: '#222', desc: 'Primary border' },
              { name: '--color-border-muted', value: '#2a2a2a', desc: 'Subtle border' },
              { name: '--radius-none', value: '0px', desc: 'Default (all elements)' },
              { name: '--radius-badge', value: '3px', desc: 'Small badges only' },
              { name: '--radius-pill', value: '999px', desc: 'Pill buttons/tags' },
            ].map(t => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{t.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-amber)', flexShrink: 0 }}>{t.value}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
