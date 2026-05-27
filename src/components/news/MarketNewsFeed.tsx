import { useMarketNews } from '../../hooks/useApiData'
import { Panel } from '../ui/Panel'
import { ArticleRow } from './ArticleRow'

export function MarketNewsFeed() {
  const { data, isLoading, error } = useMarketNews()
  const articles = data?.articles ?? []

  return (
    <Panel
      title="Market News"
      subtitle="GENERAL · ENERGY · MACRO"
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
      <div style={{
        overflowY: 'auto',
        height: 'calc(100dvh - 391px)',
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
        {articles.map((a, i) => (
          <ArticleRow key={a.id ?? i} a={a} />
        ))}
      </div>
    </Panel>
  )
}
