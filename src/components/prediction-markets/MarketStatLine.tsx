function fmtUSD(v: number | null): string {
  if (v == null || isNaN(v)) return '—'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function fmtExpiry(iso: string | null): string {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'EXPIRED'
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'TODAY'
  if (days === 1) return '1D'
  if (days <= 60) return `${days}D`
  return `${Math.round(days / 30)}MO`
}

interface MarketStatLineProps {
  volume: number | null
  volume24hr: number | null
  liquidity: number | null
  endDate: string | null
}

export function MarketStatLine({ volume, volume24hr, liquidity, endDate }: MarketStatLineProps) {
  const parts: string[] = []
  if (volume != null) parts.push(`VOL ${fmtUSD(volume)}`)
  if (volume24hr != null) parts.push(`24H ${fmtUSD(volume24hr)}`)
  if (liquidity != null) parts.push(`LIQ ${fmtUSD(liquidity)}`)
  const exp = fmtExpiry(endDate)
  if (exp) parts.push(`EXP ${exp}`)

  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--color-text-tertiary)',
      letterSpacing: '0.06em',
    }}>
      {parts.join(' · ') || '—'}
    </div>
  )
}
