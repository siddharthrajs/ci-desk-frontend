import type { CSSProperties } from 'react'
import { useCotPositions } from '../../hooks/useApiData'
import type { ManagedMoneyPosition } from '../../types/api'
import { Panel } from '../ui'

function fmt(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function signedFmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return (n > 0 ? '+' : '') + fmt(n, 0)
}

function changeColor(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return 'var(--color-text-tertiary)'
  return n > 0 ? 'var(--color-bull)' : 'var(--color-bear)'
}

function PositionCard({ position }: { position: ManagedMoneyPosition }) {
  return (
    <Panel
      title={`${position.commodity} · MANAGED MONEY`}
      subtitle={`REPORT WEEK ENDING ${position.report_date}`}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        marginBottom: 14,
      }}>
        <Stat label="NET POSITION" value={fmt(position.net_position)} />
        <Stat label="LONG"          value={fmt(position.long)} accent="bull" />
        <Stat label="SHORT"         value={fmt(position.short)} accent="bear" />
      </div>

      <div style={{
        display: 'flex',
        gap: 18,
        padding: '10px 12px',
        background: 'var(--color-bg-base)',
        border: '1px solid var(--color-border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}>
        <div>
          <div style={miniLabelStyle}>WoW Δ NET</div>
          <div style={{ color: changeColor(position.wow_change), fontWeight: 700 }}>
            {signedFmt(position.wow_change)}
          </div>
        </div>
        <div>
          <div style={miniLabelStyle}>3-YR PERCENTILE</div>
          <div style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {position.percentile_rank == null ? '—' : `${fmt(position.percentile_rank, 1)}%`}
          </div>
        </div>
      </div>
    </Panel>
  )
}

function Stat({
  label, value, accent,
}: { label: string; value: string; accent?: 'bull' | 'bear' }) {
  const accentColor =
    accent === 'bull' ? 'var(--color-bull)' :
    accent === 'bear' ? 'var(--color-bear)' :
    'var(--color-text-primary)'
  return (
    <div>
      <div style={miniLabelStyle}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        fontWeight: 700,
        color: accentColor,
        letterSpacing: '-0.01em',
      }}>
        {value}
      </div>
    </div>
  )
}

export function CotView() {
  const { data, isLoading, error } = useCotPositions()

  if (isLoading) {
    return <div style={emptyStateStyle}>LOADING COT…</div>
  }
  if (error) {
    return (
      <div style={{ ...emptyStateStyle, borderColor: 'var(--color-bear)', color: 'var(--color-bear)' }}>
        {(error as Error).message.toUpperCase()}
      </div>
    )
  }
  if (!data) {
    return <div style={emptyStateStyle}>NO DATA</div>
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px',
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--color-text-primary)',
          }}>
            CFTC COMMITMENTS OF TRADERS · MANAGED MONEY
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
          }}>
            SOURCE · cftc.gov · REL FRI 15:30 ET (TUE DATA)
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 14,
      }}>
        <PositionCard position={data.wti} />
        <PositionCard position={data.brent} />
      </div>
    </div>
  )
}

const miniLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'var(--color-text-tertiary)',
  marginBottom: 4,
}

const emptyStateStyle: CSSProperties = {
  padding: 32,
  background: 'var(--color-bg-panel)',
  border: '1px dashed var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  letterSpacing: '0.1em',
}
