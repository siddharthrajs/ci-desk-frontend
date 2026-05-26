import { useState, type CSSProperties } from 'react'
import { WpsrView } from '../components/reports/WpsrView'
import { CotView } from '../components/reports/CotView'

interface ReportDef {
  id: string
  label: string
  release: string
  available: boolean
}

const REPORTS: ReportDef[] = [
  { id: 'wpsr',  label: 'EIA · WPSR',  release: 'WED 10:30 ET', available: true },
  { id: 'cot',   label: 'CFTC · COT',  release: 'FRI 15:30 ET', available: true },
  { id: 'wngsr', label: 'EIA · WNGSR', release: 'THU 10:30 ET', available: false },
]

export function Reports() {
  const [activeId, setActiveId] = useState<string>('wpsr')
  const active = REPORTS.find(r => r.id === activeId) ?? REPORTS[0]

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          REPORTS
        </h1>
        <p style={{
          margin: '4px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          PERIODIC PUBLICATIONS · EIA · CFTC
        </p>
      </div>

      {/* ── Sub-nav: switch between source reports ──────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 18,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-panel)',
        overflow: 'hidden',
        flexWrap: 'wrap',
      }}>
        {REPORTS.map((r, i) => {
          const isActive = r.id === activeId
          const disabled = !r.available
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => r.available && setActiveId(r.id)}
              disabled={disabled}
              style={subNavButtonStyle(isActive, disabled, i === 0)}
              title={disabled ? 'Coming soon' : `Switch to ${r.label}`}
            >
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span>{r.label}</span>
                <span style={{
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  opacity: 0.6,
                }}>
                  {r.release}
                </span>
              </span>
              {disabled && (
                <span style={{
                  marginLeft: 8,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  padding: '1px 5px',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-tertiary)',
                }}>
                  SOON
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Active report ───────────────────────────────────────────────── */}
      {active.id === 'wpsr' && <WpsrView />}
      {active.id === 'cot'  && <CotView />}
    </div>
  )
}

function subNavButtonStyle(active: boolean, disabled: boolean, first: boolean): CSSProperties {
  return {
    flex: '1 1 0',
    minWidth: 200,
    padding: '10px 16px',
    background: active ? 'var(--color-amber)' : 'transparent',
    color: active ? '#000' : disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
    border: 'none',
    borderLeft: first ? 'none' : '1px solid var(--color-border)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    cursor: disabled ? 'not-allowed' : active ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    opacity: disabled ? 0.55 : 1,
    transition: 'background 0.1s, color 0.1s',
  }
}
