/**
 * Tiny shared helpers for the US upstream panels — formatters, skeletons,
 * standard error block, release-cadence badge. Each panel imports from here
 * to keep the visual conventions consistent without inheriting heavy state.
 */

import type { ReactNode } from 'react'
import { Badge } from '../ui/Badge'
import { ApiError } from '../../types/api'

// ── Formatters ──────────────────────────────────────────────────────────────
const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function fmtMonthShort(d: string) {
  const mm = +d.split('-')[1]
  return MONTHS[mm] ?? d
}

export function fmtMonthYear(d: string) {
  const [y, m] = d.split('-')
  return `${MONTHS[+m]} '${y.slice(2)}`
}

export function fmtDateShort(d: string) {
  const [, m, day] = d.split('-')
  return `${MONTHS[+m]} ${+day}`
}

export function fmtSignedPct(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return `${n > 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

export function fmtSigned(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return `${n > 0 ? '+' : ''}${n.toFixed(decimals)}`
}

export function fmtUtcTime(iso: string | null | undefined) {
  if (!iso) return null
  return (
    new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
    }) + ' UTC'
  )
}

// ── Skeleton placeholder ────────────────────────────────────────────────────
export function Skel({ h = 12, w }: { h?: number; w?: string | number }) {
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

// ── Error / unavailable block ──────────────────────────────────────────────
export function ErrorBlock({ error, height = 160 }: { error: unknown; height?: number }) {
  const status = error instanceof ApiError ? ` · HTTP ${error.status}` : ''
  return (
    <div style={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-elevated)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-bear)',
        letterSpacing: '0.08em',
      }}>
        DATA UNAVAILABLE{status}
      </span>
    </div>
  )
}

// ── Release-cadence badge for panel headerRight ────────────────────────────
export function CadenceBadge({ cadence, updated }: { cadence: string; updated?: string | null }) {
  return (
    <>
      <Badge variant="muted">{cadence}</Badge>
      {updated && (
        <Badge variant="muted" style={{ color: 'var(--color-text-primary)' }}>
          UPDATED {fmtUtcTime(updated)}
        </Badge>
      )}
    </>
  )
}

// ── Inline delta — colored arrow + value + label ────────────────────────────
export interface DeltaProps {
  change: number | null | undefined
  label?: string
  decimals?: number
  unit?: string
  pct?: boolean
  compact?: boolean
}

export function Delta({ change, label, decimals = 2, unit, pct, compact }: DeltaProps): ReactNode {
  if (change == null) {
    return (
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: compact ? 10 : 11,
        color: 'var(--color-text-tertiary)',
      }}>—</span>
    )
  }
  const isPos = change > 0
  const isZero = change === 0
  const color = isZero
    ? 'var(--color-text-tertiary)'
    : isPos ? 'var(--color-bull)' : 'var(--color-bear)'
  const arrow = isZero ? '' : isPos ? '▲' : '▼'
  const sign = isPos ? '+' : change < 0 ? '−' : ''
  const display = `${sign}${Math.abs(change).toFixed(decimals)}${pct ? '%' : ''}`

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? 2 : 3,
      fontFamily: 'var(--font-mono)',
      fontSize: compact ? 10 : 11,
      color,
    }}>
      {arrow && <span style={{ fontSize: compact ? 8 : 9 }}>{arrow}</span>}
      <span>{display}{unit ? ` ${unit}` : ''}</span>
      {label && (
        <span style={{
          color: 'var(--color-text-tertiary)',
          fontSize: compact ? 9 : 10,
          letterSpacing: '0.05em',
          marginLeft: 1,
        }}>{label}</span>
      )}
    </span>
  )
}
