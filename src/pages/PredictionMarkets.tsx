import { useState, useRef } from 'react'
import { Search } from 'lucide-react'
import { useGeopoliticsEvents, useMarkets } from '../hooks/useApiData'
import type { PolymarketEvent, PolymarketMarket } from '../types/polymarket'
import { EventCard } from '../components/prediction-markets/EventCard'
import { EventDetailDrawer } from '../components/prediction-markets/EventDetailDrawer'
import { MarketRow } from '../components/prediction-markets/MarketRow'
import { MarketDetailDrawer } from '../components/prediction-markets/MarketDetailDrawer'

type SubTab = 'geopolitics' | 'markets'
type SortOption = 'volume' | 'volume24hr' | 'liquidity' | 'endDate'
type ActiveFilter = 'active' | 'all' | 'closed'

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

function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    padding: '4px 14px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    color: active ? '#000' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-text-secondary)' : 'transparent',
    transition: 'color 0.15s, background 0.15s',
  }
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-border)',
          height: 120,
          opacity: 0.5,
        }} />
      ))}
    </>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--color-bear)',
      letterSpacing: '0.06em',
      margin: 0,
    }}>
      {msg}
    </p>
  )
}

function GeopoliticsTab() {
  const [limit, setLimit] = useState(20)
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null)
  const { data, isLoading, isFetching, error } = useGeopoliticsEvents(0, limit)
  const events = data?.events ?? []
  const hasMore = events.length === limit

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}>
        {isLoading && <LoadingRows />}
        {!isLoading && error && <ErrorMsg msg="Failed to load geopolitics markets. Check backend connection." />}
        {!isLoading && !error && events.length === 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
            No geopolitics events found.
          </p>
        )}
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => setSelectedEvent(event)}
          />
        ))}
      </div>

      {!isLoading && !error && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => setLimit(l => l + 20)}
            disabled={isFetching}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.09em',
              color: isFetching ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              padding: '7px 28px',
              cursor: isFetching ? 'default' : 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (!isFetching) { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)'; e.currentTarget.style.color = 'var(--color-text-primary)' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            {isFetching ? 'LOADING...' : 'LOAD MORE'}
          </button>
        </div>
      )}

      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  )
}

function MarketsTab() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [sort, setSort] = useState<SortOption>('volume')
  const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = (v: string) => {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(v), 300)
  }

  const { data, isLoading, error } = useMarkets({
    q: debouncedQuery || undefined,
    active: activeFilter === 'active' ? true : activeFilter === 'closed' ? undefined : undefined,
    closed: activeFilter === 'closed' ? true : activeFilter === 'active' ? false : undefined,
    order: sort,
    ascending: false,
    limit: 40,
  })

  const markets = data?.markets ?? []

  return (
    <>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-border)',
          padding: '6px 12px',
          flex: '1 1 240px',
          maxWidth: 380,
        }}>
          <Search size={12} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="SEARCH MARKETS..."
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'var(--color-text-primary)',
              width: '100%',
            }}
          />
        </div>

        {/* Active filter */}
        <div style={{
          display: 'flex',
          gap: 2,
          border: '1px solid var(--color-border)',
          borderRadius: 999,
          padding: 2,
        }}>
          {(['active', 'all', 'closed'] as ActiveFilter[]).map(f => (
            <button key={f} style={filterBtnStyle(activeFilter === f)} onClick={() => setActiveFilter(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-panel)',
            border: '1px solid var(--color-border)',
            padding: '5px 10px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="volume">SORT: VOLUME</option>
          <option value="volume24hr">SORT: 24H VOL</option>
          <option value="liquidity">SORT: LIQUIDITY</option>
          <option value="endDate">SORT: EXPIRY</option>
        </select>
      </div>

      {/* Count */}
      {!isLoading && !error && data && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
          marginBottom: 14,
        }}>
          {markets.length} MARKETS{data.count > markets.length ? ` OF ${data.count}` : ''}
        </div>
      )}

      {/* Grid */}
      {isLoading && <LoadingRows />}
      {!isLoading && error && <ErrorMsg msg="Failed to load markets. Check backend connection." />}
      {!isLoading && !error && markets.length === 0 && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
          No markets found.
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 14,
      }}>
        {markets.map(m => (
          <MarketRow
            key={m.conditionId}
            market={m}
            asCard
            onClick={() => setSelectedMarket(m)}
          />
        ))}
      </div>

      <MarketDetailDrawer
        market={selectedMarket}
        onClose={() => setSelectedMarket(null)}
      />
    </>
  )
}

export function PredictionMarkets() {
  const [tab, setTab] = useState<SubTab>('geopolitics')

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
          PREDICTION MARKETS
        </h1>
        <p style={{
          margin: '4px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          GEOPOLITICS · POLYMARKET
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        padding: 3,
        width: 'fit-content',
        marginBottom: 20,
      }}>
        <button style={tabStyle(tab === 'geopolitics')} onClick={() => setTab('geopolitics')}>
          GEOPOLITICS
        </button>
        <button style={tabStyle(tab === 'markets')} onClick={() => setTab('markets')}>
          MARKETS
        </button>
      </div>

      {tab === 'geopolitics' && <GeopoliticsTab />}
      {tab === 'markets' && <MarketsTab />}
    </div>
  )
}
