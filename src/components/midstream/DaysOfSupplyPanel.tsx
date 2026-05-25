import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { MidstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

function Skel({ h = 10, w }: { h?: number; w?: string | number }) {
  return (
    <div
      style={{
        width: w ?? '100%',
        height: h,
        background: 'var(--color-bg-elevated)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

function dosColor(days: number): string {
  if (days < 20) return 'var(--color-bear)'
  if (days < 25) return 'var(--color-amber)'
  return 'var(--color-bull)'
}

function DosCard({
  label,
  days,
  note,
}: {
  label: string
  days: number | null
  note?: string
}) {
  const color = days != null ? dosColor(days) : 'var(--color-text-tertiary)'

  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 26,
            fontWeight: 600,
            color: days != null ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            lineHeight: 1,
          }}
        >
          {days != null ? days.toFixed(1) : '—'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
          }}
        >
          days
        </span>
      </div>

      {days != null && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color,
            letterSpacing: '0.05em',
          }}
        >
          {days < 20 ? 'CRITICALLY LOW' : days < 25 ? 'BELOW NORMAL' : 'ADEQUATE'}
        </div>
      )}

      {note && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.04em',
            marginTop: 2,
          }}
        >
          {note}
        </div>
      )}
    </div>
  )
}

interface Props {
  data: MidstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function DaysOfSupplyPanel({ data, isLoading, error }: Props) {
  const dos = data?.days_of_supply

  return (
    <Panel
      title="DAYS OF SUPPLY"
      subtitle="STOCKS ÷ 4-WEEK AVG PRODUCT SUPPLIED"
      headerRight={<Badge variant="muted">EIA WPSR</Badge>}
    >
      {isLoading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel h={60} />
          <Skel h={60} />
        </div>
      ) : error ? (
        <div
          style={{
            padding: '16px 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-bear)',
            letterSpacing: '0.08em',
          }}
        >
          FETCH FAILED
          {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DosCard
            label="GASOLINE"
            days={dos?.gasoline ?? null}
            note="STOCKS ÷ DEMAND"
          />
          <DosCard
            label="DISTILLATE"
            days={dos?.distillate ?? null}
            note="STOCKS ÷ DEMAND"
          />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.05em',
              marginTop: 2,
            }}
          >
            * CRUDE DOS NOT REPORTED — SPR SEE GAUGE
          </div>
        </div>
      )}
    </Panel>
  )
}
