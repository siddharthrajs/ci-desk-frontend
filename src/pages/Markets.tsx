export function Markets() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          MARKETS
        </h1>
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          FUTURES · SPOT · DERIVATIVES · BENCHMARKS
        </p>
      </div>
      <PlaceholderGrid label="Markets" />
    </div>
  )
}

function PlaceholderGrid({ label }: { label: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="panel" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>
            {label.toUpperCase()} PANEL {i + 1}
          </span>
        </div>
      ))}
    </div>
  )
}
