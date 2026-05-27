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
        display: 'block',
        padding: '10px 12px',
        marginBottom: 8,
        background: 'var(--color-bg-elevated, rgba(255,255,255,0.02))',
        border: '1px solid var(--color-border-muted)',
        borderLeft: '2px solid var(--color-amber)',
        borderRadius: 3,
        textDecoration: 'none',
        transition: 'background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-bg-hover)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.borderLeftColor = 'var(--color-amber)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--color-bg-elevated, rgba(255,255,255,0.02))'
        e.currentTarget.style.borderColor = 'var(--color-border-muted)'
        e.currentTarget.style.borderLeftColor = 'var(--color-amber)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
          {a.source ?? '—'}
        </span>
        {a.datetime != null && (
          <span style={{ marginLeft: 'auto', flexShrink: 0 }}>{timeAgo(a.datetime)}</span>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        lineHeight: 1.45,
        wordBreak: 'break-word',
      }}>
        {a.headline}
      </div>
    </a>
  )
}
