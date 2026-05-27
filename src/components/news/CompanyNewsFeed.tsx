import { useState } from 'react'
import { useCompanyNews } from '../../hooks/useApiData'
import { Panel } from '../ui/Panel'
import { ArticleRow } from './ArticleRow'

const OIL_TICKERS = ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'COP', 'MRO', 'DVN', 'SLB', 'HAL', 'USO', 'XLE']

export function CompanyNewsFeed() {
  const [selected, setSelected] = useState('XOM')
  const { data, isLoading, error } = useCompanyNews(selected)
  const articles = data?.articles ?? []

  return (
    <Panel
      title="Company News"
      subtitle={selected}
      headerRight={
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
        }}>
          {articles.length} ARTICLES · 1MIN
        </span>
      }
      noPadding
    >
      {/* Ticker tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: '10px 14px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {OIL_TICKERS.map(t => (
          <button
            key={t}
            onClick={() => setSelected(t)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.07em',
              padding: '3px 8px',
              border: '1px solid',
              borderRadius: 3,
              cursor: 'pointer',
              background: selected === t ? 'var(--color-amber)' : 'transparent',
              borderColor: selected === t ? 'var(--color-amber)' : 'var(--color-border-muted)',
              color: selected === t ? '#000' : 'var(--color-text-secondary)',
              transition: 'all 0.1s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{
        overflowY: 'auto',
        height: 'calc(100dvh - 448px)',
        padding: '2px 16px 8px',
      }}>
        {isLoading && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            padding: '16px 0',
            margin: 0,
          }}>
            Loading...
          </p>
        )}
        {!isLoading && error && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-bear)',
            padding: '16px 0',
            margin: 0,
          }}>
            Failed to load news
          </p>
        )}
        {!isLoading && !error && articles.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            padding: '16px 0',
            margin: 0,
          }}>
            No articles in the last 30 days
          </p>
        )}
        {articles.map((a, i) => (
          <ArticleRow key={a.id ?? i} a={a} />
        ))}
      </div>
    </Panel>
  )
}
