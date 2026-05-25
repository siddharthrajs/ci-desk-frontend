import { LineChart, Line, AreaChart, Area } from 'recharts'

export type SparklineColor = 'bull' | 'bear' | 'amber'
export type SparklineVariant = 'line' | 'area'

const COLOR_MAP: Record<SparklineColor, string> = {
  bull:  'var(--color-bull)',
  bear:  'var(--color-bear)',
  amber: 'var(--color-amber)',
}

const HEX_MAP: Record<SparklineColor, string> = {
  bull:  '#3dd6c4',
  bear:  '#e5484d',
  amber: '#f5a623',
}

export interface SparklineProps {
  data: number[]
  color?: SparklineColor
  variant?: SparklineVariant
  width?: number
  height?: number
  /** Infer color from trend (last - first) — overrides `color` */
  autoColor?: boolean
}

export function Sparkline({
  data,
  color,
  variant = 'line',
  width = 80,
  height = 26,
  autoColor = false,
}: SparklineProps) {
  if (!data.length) return null

  const trend = data[data.length - 1] - data[0]
  const resolvedColor: SparklineColor = autoColor
    ? trend >= 0 ? 'bull' : 'bear'
    : color ?? 'amber'

  const stroke = COLOR_MAP[resolvedColor]
  const hex = HEX_MAP[resolvedColor]

  const points = data.map((v, i) => ({ i, v }))

  const margin = { top: 2, right: 2, bottom: 2, left: 2 }

  if (variant === 'area') {
    return (
      <AreaChart width={width} height={height} data={points} margin={margin}>
        <defs>
          <linearGradient id={`sg-${resolvedColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={hex} stopOpacity={0.25} />
            <stop offset="95%" stopColor={hex} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#sg-${resolvedColor})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    )
  }

  return (
    <LineChart width={width} height={height} data={points} margin={margin}>
      <Line
        type="monotone"
        dataKey="v"
        stroke={stroke}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  )
}
