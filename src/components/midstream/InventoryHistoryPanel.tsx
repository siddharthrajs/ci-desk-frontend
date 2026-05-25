import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'
import type { MidstreamResponse } from '../../types/api'
import { ApiError } from '../../types/api'

type Product = 'crude' | 'cushing' | 'gasoline' | 'distillate'

const PRODUCT_LABELS: Record<Product, string> = {
  crude:      'CRUDE (EXCL. SPR)',
  cushing:    'CUSHING, OK',
  gasoline:   'GASOLINE',
  distillate: 'DISTILLATE',
}

function Skel({ h = 10 }: { h?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: h,
        background: 'var(--color-bg-elevated)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

function fmtPeriod(dateStr: string) {
  const parts = dateStr.split('-')
  const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const m = +parts[1]
  const d = +parts[2]
  return `${MONTHS[m]} ${d}`
}

interface Props {
  data: MidstreamResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function InventoryHistoryPanel({ data, isLoading, error }: Props) {
  const [product, setProduct] = useState<Product>('crude')

  const chartData = useMemo(() => {
    const series = data?.inventories?.[product]
    if (!series?.length) return []
    return [...series]
      .reverse()
      .map(p => ({ label: fmtPeriod(p.period), value: +(p.value / 1000).toFixed(2) }))
  }, [data, product])

  const latest = data?.inventories?.[product]?.[0]
  const pointCount = data?.inventories?.[product]?.length ?? 0

  return (
    <Panel
      title="INVENTORY HISTORY"
      subtitle={PRODUCT_LABELS[product]}
      noPadding
      headerRight={
        <div style={{ display: 'flex', gap: 4 }}>
          {(Object.keys(PRODUCT_LABELS) as Product[]).map(p => (
            <Badge
              key={p}
              variant={product === p ? 'active' : 'muted'}
              onClick={() => setProduct(p)}
              style={{ cursor: 'pointer' }}
            >
              {p === 'distillate' ? 'DIST' : p === 'cushing' ? 'CUSH' : p.toUpperCase()}
            </Badge>
          ))}
        </div>
      }
    >
      <div style={{ padding: '14px 18px 18px' }}>
        {/* KPI header */}
        {!error && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {pointCount}WK HISTORY · 5Y BAND PENDING EXPANDED FETCH
              </span>
            </div>
            {!isLoading && latest && (
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {(latest.value / 1000).toFixed(1)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    marginLeft: 4,
                  }}
                >
                  MBbl
                </span>
              </div>
            )}
          </div>
        )}

        {/* Chart area */}
        {isLoading && !data ? (
          <Skel h={160} />
        ) : error ? (
          <div
            style={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-bear)',
                letterSpacing: '0.08em',
              }}
            >
              FETCH FAILED
              {error instanceof ApiError ? ` · HTTP ${error.status}` : ` · ${error.message}`}
            </span>
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.07em',
              }}
            >
              NO DATA
            </span>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => v.toFixed(0)}
                  width={36}
                  tickCount={4}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    padding: '5px 9px',
                  }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                  labelStyle={{ color: 'var(--color-text-secondary)', fontSize: 10, marginBottom: 2 }}
                  formatter={(v: unknown) => [`${(v as number).toFixed(1)} MBbl`, PRODUCT_LABELS[product]]}
                  wrapperStyle={{ outline: 'none' }}
                />
                {/* Current year — solid amber */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f5a623"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 3, fill: '#f5a623', stroke: '#0a0a0a', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* 5Y band annotation */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 6,
                  background: 'var(--color-border-muted)',
                  opacity: 0.5,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.06em',
                }}
              >
                5Y MIN/MAX: HISTORY PENDING
              </span>
              <span
                style={{
                  width: 24,
                  height: 1,
                  background: 'var(--color-border-muted)',
                  display: 'inline-block',
                  opacity: 0.5,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.06em',
                }}
              >
                5Y AVG: HISTORY PENDING
              </span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
