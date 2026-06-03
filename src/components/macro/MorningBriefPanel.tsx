import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Panel } from '../ui/Panel'
import { postMacroBriefRefresh } from '../../lib/api'
import type { MorningBriefResponse } from '../../types/api'

interface Props {
  data: MorningBriefResponse | undefined
  isLoading: boolean
  error: Error | null
}

function formatTime(published: string): string {
  if (!published) return '—'
  try {
    return new Date(published).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export function MorningBriefPanel({ data, isLoading, error }: Props) {
  const queryClient = useQueryClient()
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleFetchNow = async () => {
    setFetching(true)
    setFetchError(null)
    try {
      const fresh = await postMacroBriefRefresh()
      queryClient.setQueryData(['macro-brief'], fresh)
    } catch {
      setFetchError('Fetch failed. Check backend logs.')
    } finally {
      setFetching(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        Loading morning brief...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-bear)' }}>
        Failed to load brief.
      </div>
    )
  }

  if (!data || data.sources.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          Brief not yet available — scheduled daily at 08:00 IST.
        </span>
        <button
          onClick={handleFetchNow}
          disabled={fetching}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.09em',
            padding: '3px 10px',
            borderRadius: 999,
            border: 'none',
            cursor: fetching ? 'wait' : 'pointer',
            color: '#000',
            background: fetching ? 'var(--color-text-tertiary)' : 'var(--color-amber)',
          }}
        >
          {fetching ? 'FETCHING...' : 'FETCH NOW'}
        </button>
        {fetchError && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-bear)' }}>
            {fetchError}
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.09em',
            color: 'var(--color-text-secondary)',
          }}>
            MORNING BRIEF
          </span>
          <button
            onClick={handleFetchNow}
            disabled={fetching}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.09em',
              padding: '3px 10px',
              borderRadius: 999,
              border: 'none',
              cursor: fetching ? 'wait' : 'pointer',
              color: '#000',
              background: fetching ? 'var(--color-text-tertiary)' : 'var(--color-amber)',
            }}
          >
            {fetching ? 'FETCHING...' : 'FETCH NOW'}
          </button>
          {fetchError && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-bear)' }}>
              {fetchError}
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          {new Date(data.generated_at).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
        {data.sources.map(s => (
          <Panel
            key={s.source}
            title={s.source}
            subtitle={`${s.articles.length} ARTICLES`}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ height: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 18px' }}>
              {s.articles.length === 0 ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                  No articles fetched.
                </span>
              ) : (
                s.articles.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--color-text-tertiary)',
                      flexShrink: 0,
                      letterSpacing: '0.04em',
                    }}>
                      {formatTime(a.published)}
                    </span>
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        lineHeight: 1.45,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-amber)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
                    >
                      {a.title}
                    </a>
                  </div>
                ))
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
