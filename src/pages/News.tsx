import { useState } from 'react'
import { QuotesBar } from '../components/news/QuotesBar'
import { MarketNewsFeed } from '../components/news/MarketNewsFeed'
import { CompanyNewsFeed } from '../components/news/CompanyNewsFeed'
import { FinancialJuiceWidget } from '../components/news/FinancialJuiceWidget'
import { EconomicCalendar } from '../components/news/EconomicCalendar'

type Tab = 'news' | 'calendar'

function tabStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.09em',
    padding: '4px 16px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    color: active ? '#000' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-amber)' : 'transparent',
    transition: 'color 0.15s, background 0.15s',
  }
}

export function News() {
  const [tab, setTab] = useState<Tab>('news')

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          NEWS
        </h1>
        <p style={{
          margin: '4px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          MARKET · COMPANIES · ECONOMIC CALENDAR
        </p>
      </div>

      {/* Equity quotes bar */}
      <div style={{ marginBottom: 14 }}>
        <QuotesBar />
      </div>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        padding: 3,
        width: 'fit-content',
        marginBottom: 16,
      }}>
        <button style={tabStyle(tab === 'news')} onClick={() => setTab('news')}>NEWS</button>
        <button style={tabStyle(tab === 'calendar')} onClick={() => setTab('calendar')}>CALENDAR</button>
      </div>

      {/* Content */}
      {tab === 'news' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 18 }}>
          <MarketNewsFeed />
          <CompanyNewsFeed />
          <FinancialJuiceWidget />
        </div>
      )}

      {tab === 'calendar' && <EconomicCalendar />}
    </div>
  )
}
