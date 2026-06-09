/**
 * Inter-PADD crude pipeline movements — net receipts per PADD + top flow pairs.
 * Source: EIA petroleum/move/pipe → /api/midstream/padd-movements.
 *
 * Net receipts: positive = PADD receives more than it ships (importer of crude).
 * PADD 3 (Gulf Coast) is typically the dominant net receiver — crude arrives from
 * PADD 2 (Midwest/Permian) and PADD 4 (Rocky Mtn) for Gulf Coast refinery runs.
 */

import { useMidstreamPaddMovements } from '../../hooks/useApiData'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import { Skel, ErrorBlock, fmtMonthYear } from '../upstream/_shared'

const PADD_ORDER = ['padd3', 'padd1', 'padd5', 'padd2', 'padd4']
const PADD_META: Record<string, { label: string; sub: string }> = {
  padd1: { label: 'PADD 1', sub: 'East Coast' },
  padd2: { label: 'PADD 2', sub: 'Midwest' },
  padd3: { label: 'PADD 3', sub: 'Gulf Coast' },
  padd4: { label: 'PADD 4', sub: 'Rocky Mtn' },
  padd5: { label: 'PADD 5', sub: 'West Coast' },
}

// Top flow pairs to highlight — largest inter-regional crude movements
const KEY_PAIRS = ['R20-R30', 'R40-R30', 'R30-R20', 'R10-R30', 'R30-R40']

export function PaddMovementsPanel() {
  const { data, isLoading, error } = useMidstreamPaddMovements()

  const net = data?.net_receipts ?? {}
  const absMax = Math.max(...Object.values(net).map(Math.abs), 1)

  return (
    <Panel
      title="INTER-PADD CRUDE MOVEMENTS"
      subtitle="Monthly · EIA petroleum/move/pipe process LMV · KBBL"
      headerRight={
        <>
          {data?.latest_period && (
            <Badge variant="muted">{fmtMonthYear(data.latest_period + '-01')}</Badge>
          )}
          <Badge variant="muted">PIPELINE</Badge>
        </>
      }
    >
      {isLoading && !data ? (
        <Skel h={320} />
      ) : error ? (
        <ErrorBlock error={error} height={320} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Net receipts — horizontal diverging bars */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', marginBottom: 10 }}>
              NET PIPELINE RECEIPTS · POSITIVE = NET RECEIVER
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {PADD_ORDER.map(key => {
                const val = net[key] ?? 0
                const isPos = val >= 0
                const pct = Math.abs(val) / absMax * 100
                const color = isPos ? 'var(--color-bull)' : 'var(--color-bear)'
                const meta = PADD_META[key]
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Label */}
                    <div style={{ width: 72, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                        fontWeight: key === 'padd3' ? 700 : 400,
                        color: key === 'padd3' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                        {meta.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
                        color: 'var(--color-text-tertiary)' }}>{meta.sub}</div>
                    </div>
                    {/* Diverging bar: negative flows left, positive flows right */}
                    <div style={{ flex: 1, height: 10, position: 'relative',
                      background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                      {isPos ? (
                        <div style={{ position: 'absolute', left: '50%', top: 0,
                          height: '100%', width: `${pct / 2}%`, background: color }} />
                      ) : (
                        <div style={{ position: 'absolute', right: '50%', top: 0,
                          height: '100%', width: `${pct / 2}%`, background: color }} />
                      )}
                      {/* Center line */}
                      <div style={{ position: 'absolute', left: '50%', top: 0,
                        height: '100%', width: 1, background: 'var(--color-border)' }} />
                    </div>
                    {/* Value */}
                    <div style={{ width: 80, textAlign: 'right', fontFamily: 'var(--font-mono)',
                      fontSize: 10, color }}>
                      {val !== 0 ? `${isPos ? '+' : ''}${(val / 1000).toFixed(1)}k` : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-text-tertiary)' }}>
              <span style={{ color: 'var(--color-bear)' }}>NET SHIPPER</span>
              <span style={{ color: 'var(--color-bull)' }}>NET RECEIVER</span>
            </div>
          </div>

          {/* Key flow pairs */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', marginBottom: 8 }}>
              KEY PIPELINE FLOWS · KBBL/MONTH
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {KEY_PAIRS.map(pair => {
                const pts = data?.flows?.[pair]
                const val = pts?.[0]?.value
                const label = data?.flow_labels?.[pair] ?? pair
                if (val == null) return null
                return (
                  <div key={pair} style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '4px 0',
                    borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9,
                      color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {val.toLocaleString('en-US')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
