import type { NewsArticle } from '../../types/api'

export function timeAgo(unix: number): string {
  const diffMin = Math.floor((Date.now() / 1000 - unix) / 60)
  if (diffMin < 60) return `${diffMin}m`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`
  return `${Math.floor(diffMin / 1440)}d`
}

export function ArticleRow({ a }: { a: NewsArticle }) {
  return (
    <a
      href={a.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      title={a.summary ?? a.headline}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        padding: '7px 0',
        borderBottom: '1px solid var(--color-border-muted)',
        textDecoration: 'none',
        background: 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{
        color: 'var(--color-text-tertiary)',
        fontSize: 7,
        flexShrink: 0,
        lineHeight: '17px',
      }}>
        ●
      </span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-text-primary)',
        lineHeight: 1.4,
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {a.headline}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.04em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        {a.source ?? ''}{a.datetime ? ` · ${timeAgo(a.datetime)}` : ''}
      </span>
    </a>
  )
}
