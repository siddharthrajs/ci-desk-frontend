import { useState, type CSSProperties } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCotPositions } from '../../hooks/useApiData'
import { refreshCotPositions } from '../../lib/api'
import type { COTContract, COTResponse, COTConcentration } from '../../types/api'

// =============================================================================
// Formatters
// =============================================================================

function fmtInt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('en-US')
}

function fmtSigned(n: number | null | undefined): string {
  if (n == null) return '—'
  const s = Math.abs(n).toLocaleString('en-US')
  return n >= 0 ? `+${s}` : `-${s}`
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

function fmtTrader(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n)
}

function signColor(n: number | null | undefined): string {
  if (n == null || n === 0) return 'var(--color-text-secondary)'
  return n > 0 ? 'var(--color-bull)' : 'var(--color-bear)'
}

function pctColor(pct: number | null | undefined): string {
  if (pct == null) return 'var(--color-text-secondary)'
  if (pct >= 80) return 'var(--color-bull)'
  if (pct <= 20) return 'var(--color-bear)'
  return 'var(--color-text-primary)'
}

// =============================================================================
// Header bar
// =============================================================================

function HeaderBar({
  reportDate,
  refreshing,
  onRefresh,
}: {
  reportDate: string
  refreshing: boolean
  onRefresh: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 14px',
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      marginBottom: 14,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-text-primary)',
        }}>
          CFTC COMMITMENTS OF TRADERS · PETROLEUM & PRODUCTS
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          SOURCE · publicreporting.cftc.gov · DISAGGREGATED FUTURES-ONLY · REL FRI 15:30 ET
          {reportDate ? ` · DATA AS OF ${reportDate}` : ''}
        </span>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          style={fetchButtonStyle(refreshing)}
        >
          {refreshing ? 'FETCHING…' : 'FETCH NOW'}
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Summary table — all contracts at a glance
// =============================================================================

function SummaryTable({
  contracts,
  selectedCode,
  onSelect,
}: {
  contracts: COTContract[]
  selectedCode: string
  onSelect: (code: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const selected = contracts.find(c => c.contract_market_code === selectedCode)

  return (
    <div style={{ border: '1px solid var(--color-border)', marginBottom: 16 }}>
      {/* Collapse toggle header */}
      <button
        type="button"
        onClick={() => setCollapsed(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '7px 10px',
          background: 'var(--color-bg-elevated)',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid var(--color-border)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-text-tertiary)',
          transition: 'transform 0.15s',
          display: 'inline-block',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        }}>
          ▾
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--color-text-tertiary)',
        }}>
          ALL CONTRACTS
        </span>
        {collapsed && selected && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginLeft: 6,
          }}>
            — {selected.contract_market_name}
          </span>
        )}
      </button>

      {!collapsed && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-elevated)' }}>
                {['CONTRACT', 'EXCHANGE', 'OPEN INT', 'MM LONG', 'MM SHORT', 'MM NET', 'WOW Δ NET', '3YR %ILE'].map((h, i) => (
                  <th key={h} style={thStyle(i > 1 ? 'right' : 'left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => {
                const active = c.contract_market_code === selectedCode
                return (
                  <tr
                    key={c.contract_market_code}
                    onClick={() => onSelect(c.contract_market_code)}
                    style={{
                      cursor: 'pointer',
                      background: active ? 'var(--color-bg-elevated)' : 'transparent',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <td style={{ ...tdStyle('left'), fontWeight: active ? 700 : 400 }}>
                      {active && (
                        <span style={{
                          display: 'inline-block',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: 'var(--color-amber)',
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }} />
                      )}
                      {c.contract_market_name}
                    </td>
                    <td style={tdStyle('left')}>{c.exchange}</td>
                    <td style={tdStyle('right')}>{fmtInt(c.open_interest)}</td>
                    <td style={{ ...tdStyle('right'), color: 'var(--color-bull)' }}>{fmtInt(c.managed_money.long)}</td>
                    <td style={{ ...tdStyle('right'), color: 'var(--color-bear)' }}>{fmtInt(c.managed_money.short)}</td>
                    <td style={{ ...tdStyle('right'), color: signColor(c.mm_net), fontWeight: 700 }}>{fmtSigned(c.mm_net)}</td>
                    <td style={{ ...tdStyle('right'), color: signColor(c.mm_wow_net_change) }}>{fmtSigned(c.mm_wow_net_change)}</td>
                    <td style={{ ...tdStyle('right'), color: pctColor(c.mm_percentile_rank), fontWeight: 700 }}>
                      {c.mm_percentile_rank != null ? fmtPct(c.mm_percentile_rank) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Contract detail — full long-format table
// =============================================================================

type RowSection = 'positions' | 'changes' | 'pct' | 'traders'

function DetailTable({ contract: c }: { contract: COTContract }) {
  const rows: Array<{
    label: string
    section: RowSection
    oi: string
    pm: [string, string]
    sd: [string, string, string]
    mm: [string, string, string]
    or_: [string, string, string]
    nr: [string, string]
    colors?: Record<string, string>
  }> = [
    {
      label: 'POSITIONS',
      section: 'positions',
      oi: fmtInt(c.open_interest),
      pm: [fmtInt(c.producer_merchant.long), fmtInt(c.producer_merchant.short)],
      sd: [fmtInt(c.swap_dealers.long), fmtInt(c.swap_dealers.short), fmtInt(c.swap_dealers.spreading)],
      mm: [fmtInt(c.managed_money.long), fmtInt(c.managed_money.short), fmtInt(c.managed_money.spreading)],
      or_: [fmtInt(c.other_reportables.long), fmtInt(c.other_reportables.short), fmtInt(c.other_reportables.spreading)],
      nr: [fmtInt(c.non_reportable.long), fmtInt(c.non_reportable.short)],
    },
    {
      label: 'CHANGES',
      section: 'changes',
      oi: fmtSigned(c.open_interest_change),
      pm: [fmtSigned(c.producer_merchant_change.long), fmtSigned(c.producer_merchant_change.short)],
      sd: [fmtSigned(c.swap_dealers_change.long), fmtSigned(c.swap_dealers_change.short), fmtSigned(c.swap_dealers_change.spreading)],
      mm: [fmtSigned(c.managed_money_change.long), fmtSigned(c.managed_money_change.short), fmtSigned(c.managed_money_change.spreading)],
      or_: [fmtSigned(c.other_reportables_change.long), fmtSigned(c.other_reportables_change.short), fmtSigned(c.other_reportables_change.spreading)],
      nr: [fmtSigned(c.non_reportable_change.long), fmtSigned(c.non_reportable_change.short)],
    },
    {
      label: '% OF OI',
      section: 'pct',
      oi: '100.0%',
      pm: [fmtPct(c.producer_merchant_pct.long), fmtPct(c.producer_merchant_pct.short)],
      sd: [fmtPct(c.swap_dealers_pct.long), fmtPct(c.swap_dealers_pct.short), fmtPct(c.swap_dealers_pct.spreading)],
      mm: [fmtPct(c.managed_money_pct.long), fmtPct(c.managed_money_pct.short), fmtPct(c.managed_money_pct.spreading)],
      or_: [fmtPct(c.other_reportables_pct.long), fmtPct(c.other_reportables_pct.short), fmtPct(c.other_reportables_pct.spreading)],
      nr: [fmtPct(c.non_reportable_pct.long), fmtPct(c.non_reportable_pct.short)],
    },
    {
      label: 'TRADERS',
      section: 'traders',
      oi: fmtTrader(null),
      pm: [fmtTrader(c.producer_merchant_traders.long), fmtTrader(c.producer_merchant_traders.short)],
      sd: [fmtTrader(c.swap_dealers_traders.long), fmtTrader(c.swap_dealers_traders.short), fmtTrader(c.swap_dealers_traders.spreading)],
      mm: [fmtTrader(c.managed_money_traders.long), fmtTrader(c.managed_money_traders.short), fmtTrader(c.managed_money_traders.spreading)],
      or_: [fmtTrader(c.other_reportables_traders.long), fmtTrader(c.other_reportables_traders.short), fmtTrader(c.other_reportables_traders.spreading)],
      nr: ['—', '—'],
    },
  ]

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 1100, width: '100%', fontSize: 11 }}>
        <thead>
          <tr style={{ background: 'var(--color-bg-elevated)' }}>
            <th style={thStyle('left')} rowSpan={2} />
            <th style={{ ...thStyle('right'), borderRight: '2px solid var(--color-border)' }} rowSpan={2}>OPEN INT</th>
            <th style={{ ...thStyle('center'), borderRight: '1px solid var(--color-border)' }} colSpan={2}>PROD / MERCH</th>
            <th style={{ ...thStyle('center'), borderRight: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }} colSpan={3}>SWAP DEALERS</th>
            <th style={{ ...thStyle('center'), borderRight: '1px solid var(--color-border)', color: 'var(--color-amber)' }} colSpan={3}>MANAGED MONEY</th>
            <th style={{ ...thStyle('center'), borderRight: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }} colSpan={3}>OTHER REPT</th>
            <th style={{ ...thStyle('center'), color: 'var(--color-text-tertiary)' }} colSpan={2}>NON-REPT</th>
          </tr>
          <tr style={{ background: 'var(--color-bg-elevated)' }}>
            {['L', 'S', 'L', 'S', 'SPR', 'L', 'S', 'SPR', 'L', 'S', 'SPR', 'L', 'S'].map((h, i) => (
              <th key={i} style={{
                ...thStyle('right'),
                borderRight: [1, 4, 7, 10].includes(i) ? '1px solid var(--color-border)' : undefined,
                color: h === 'L' ? 'var(--color-bull)' : h === 'S' ? 'var(--color-bear)' : 'var(--color-text-tertiary)',
                fontSize: 9,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isChanges = row.section === 'changes'
            const isPct = row.section === 'pct'
            return (
              <tr
                key={row.label}
                style={{
                  borderTop: ri === 0 ? '2px solid var(--color-border)' : '1px solid var(--color-border)',
                  background: ri % 2 === 0 ? 'transparent' : 'var(--color-bg-panel)',
                }}
              >
                <td style={{
                  ...tdStyle('left'),
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-tertiary)',
                  whiteSpace: 'nowrap',
                  paddingRight: 12,
                }}>
                  {row.label}
                </td>
                <td style={{
                  ...tdStyle('right'),
                  borderRight: '2px solid var(--color-border)',
                  color: isChanges ? signColor(parseFloat(row.oi.replace(/[+,]/g, ''))) : 'var(--color-text-primary)',
                  fontWeight: 600,
                }}>
                  {row.oi}
                </td>
                {/* Producer/Merchant */}
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.pm[0].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bull)' }}>{row.pm[0]}</td>
                <td style={{ ...tdStyle('right'), borderRight: '1px solid var(--color-border)', color: isChanges ? signColor(parseFloat(row.pm[1].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bear)' }}>{row.pm[1]}</td>
                {/* Swap Dealers */}
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.sd[0].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bull)' }}>{row.sd[0]}</td>
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.sd[1].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bear)' }}>{row.sd[1]}</td>
                <td style={{ ...tdStyle('right'), borderRight: '1px solid var(--color-border)', color: isChanges ? signColor(parseFloat(row.sd[2].replace(/[+,]/g, ''))) : 'var(--color-text-tertiary)' }}>{row.sd[2]}</td>
                {/* Managed Money */}
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.mm[0].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bull)', fontWeight: 600 }}>{row.mm[0]}</td>
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.mm[1].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bear)', fontWeight: 600 }}>{row.mm[1]}</td>
                <td style={{ ...tdStyle('right'), borderRight: '1px solid var(--color-border)', color: isChanges ? signColor(parseFloat(row.mm[2].replace(/[+,]/g, ''))) : 'var(--color-text-tertiary)', fontWeight: 600 }}>{row.mm[2]}</td>
                {/* Other Reportables */}
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.or_[0].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bull)' }}>{row.or_[0]}</td>
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.or_[1].replace(/[+,]/g, ''))) : isPct ? 'var(--color-text-primary)' : 'var(--color-bear)' }}>{row.or_[1]}</td>
                <td style={{ ...tdStyle('right'), borderRight: '1px solid var(--color-border)', color: isChanges ? signColor(parseFloat(row.or_[2].replace(/[+,]/g, ''))) : 'var(--color-text-tertiary)' }}>{row.or_[2]}</td>
                {/* Non-Reportable */}
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.nr[0].replace(/[+,]/g, ''))) : 'var(--color-text-tertiary)' }}>{row.nr[0]}</td>
                <td style={{ ...tdStyle('right'), color: isChanges ? signColor(parseFloat(row.nr[1].replace(/[+,]/g, ''))) : 'var(--color-text-tertiary)' }}>{row.nr[1]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// KPI bar
// =============================================================================

function KpiBar({ contract: c }: { contract: COTContract }) {
  const stats: Array<{ label: string; value: string; color: string }> = [
    {
      label: 'MM NET',
      value: fmtSigned(c.mm_net),
      color: signColor(c.mm_net),
    },
    {
      label: 'WOW Δ NET',
      value: fmtSigned(c.mm_wow_net_change),
      color: signColor(c.mm_wow_net_change),
    },
    {
      label: '3-YR %ILE',
      value: c.mm_percentile_rank != null ? fmtPct(c.mm_percentile_rank) : '—',
      color: pctColor(c.mm_percentile_rank),
    },
    {
      label: 'OPEN INTEREST',
      value: fmtInt(c.open_interest),
      color: 'var(--color-text-primary)',
    },
    {
      label: 'UNITS',
      value: c.contract_units,
      color: 'var(--color-text-tertiary)',
    },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg-panel)',
      marginBottom: 12,
      flexWrap: 'wrap',
    }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          flex: '1 1 0',
          minWidth: 120,
          padding: '10px 14px',
          borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--color-text-tertiary)',
            marginBottom: 4,
          }}>
            {s.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: i < 3 ? 18 : 12,
            fontWeight: 700,
            color: s.color,
            letterSpacing: '-0.01em',
          }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Concentration panel
// =============================================================================

function ConcentrationPanel({ c: conc }: { c: COTConcentration }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg-panel)',
      padding: '10px 14px',
      marginTop: 12,
    }}>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--color-text-tertiary)',
        marginBottom: 10,
      }}>
        % OF OI HELD BY LARGEST TRADERS
      </div>
      <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={thStyle('left')} />
            <th style={{ ...thStyle('center'), color: 'var(--color-text-tertiary)' }} colSpan={2}>GROSS</th>
            <th style={{ ...thStyle('center'), color: 'var(--color-text-tertiary)' }} colSpan={2}>NET</th>
          </tr>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={thStyle('left')} />
            {['4 OR FEWER', '8 OR FEWER', '4 OR FEWER', '8 OR FEWER'].map((h, i) => (
              <th key={i} style={{ ...thStyle('right'), fontSize: 9 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdStyle('left'), color: 'var(--color-bull)', fontWeight: 700, paddingRight: 20 }}>LONG</td>
            <td style={tdStyle('right')}>{fmtPct(conc.gross_le4_long)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.gross_le8_long)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.net_le4_long)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.net_le8_long)}</td>
          </tr>
          <tr style={{ borderTop: '1px solid var(--color-border)' }}>
            <td style={{ ...tdStyle('left'), color: 'var(--color-bear)', fontWeight: 700, paddingRight: 20 }}>SHORT</td>
            <td style={tdStyle('right')}>{fmtPct(conc.gross_le4_short)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.gross_le8_short)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.net_le4_short)}</td>
            <td style={tdStyle('right')}>{fmtPct(conc.net_le8_short)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// Contract detail panel
// =============================================================================

function ContractDetail({ contract: c }: { contract: COTContract }) {
  return (
    <div style={{
      border: '1px solid var(--color-amber)',
      background: 'var(--color-bg-panel)',
      padding: '12px 14px',
      marginBottom: 14,
    }}>
      {/* Contract header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: 'var(--color-text-primary)',
        }}>
          {c.contract_market_name}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          {c.exchange} · CODE {c.contract_market_code} · {c.report_date}
        </span>
      </div>

      <KpiBar contract={c} />
      <DetailTable contract={c} />
      <ConcentrationPanel c={c.concentration} />
    </div>
  )
}

// =============================================================================
// Main view
// =============================================================================

export function CotView() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useCotPositions()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string>('067651') // WTI-Physical default

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const fresh = await refreshCotPositions()
      queryClient.setQueryData<COTResponse>(['cot'], fresh)
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) return <div style={emptyStateStyle}>LOADING COT…</div>
  if (error) return (
    <div style={{ ...emptyStateStyle, borderColor: 'var(--color-bear)', color: 'var(--color-bear)' }}>
      {(error as Error).message.toUpperCase()}
    </div>
  )
  if (!data || !data.contracts.length) return <div style={emptyStateStyle}>NO DATA</div>

  // If the default code isn't in the data, fall back to first
  const activeCode = data.contracts.some(c => c.contract_market_code === selectedCode)
    ? selectedCode
    : data.contracts[0].contract_market_code

  const selectedContract = data.contracts.find(c => c.contract_market_code === activeCode)!

  return (
    <div>
      <HeaderBar
        reportDate={data.report_date}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <SummaryTable
        contracts={data.contracts}
        selectedCode={activeCode}
        onSelect={setSelectedCode}
      />

      <ContractDetail contract={selectedContract} />
    </div>
  )
}

// =============================================================================
// Shared styles
// =============================================================================

function thStyle(align: 'left' | 'right' | 'center'): CSSProperties {
  return {
    padding: '6px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-tertiary)',
    textAlign: align,
    whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--color-border)',
  }
}

function tdStyle(align: 'left' | 'right'): CSSProperties {
  return {
    padding: '5px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    textAlign: align,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  }
}

function fetchButtonStyle(disabled: boolean): CSSProperties {
  return {
    background: disabled ? 'var(--color-bg-elevated)' : 'var(--color-amber)',
    color: disabled ? 'var(--color-text-tertiary)' : '#000',
    border: `1px solid ${disabled ? 'var(--color-border)' : 'var(--color-amber)'}`,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '6px 14px',
    cursor: disabled ? 'wait' : 'pointer',
    transition: 'background 0.1s, color 0.1s',
  }
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
