import { useState } from 'react'
import { Panel } from '../ui/Panel'
import { postAiSummary } from '../../lib/api'
import type { AiSummaryResponse } from '../../types/api'

const DEFAULT_PROMPT =
  'You are an expert crude oil market analyst. Below are financial news headlines ' +
  'and summaries from the last 24 hours. Please provide a concise macro summary ' +
  '(3-5 paragraphs) of the most relevant developments for the crude oil market. ' +
  'Focus on supply/demand dynamics, geopolitical factors, economic indicators, ' +
  'and significant price drivers. Be analytical and specific.'

export function AiSummaryPanel() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AiSummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const customPrompt = prompt !== DEFAULT_PROMPT ? prompt : undefined
      const data = await postAiSummary(customPrompt)
      setResult(data)
    } catch {
      setError('Failed to generate summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Panel
      title="AI News Summary"
      subtitle="CRUDE OIL MACRO · POWERED BY GEMINI"
      headerRight={
        result ? (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
          }}>
            {result.item_count} ITEMS · {new Date(result.generated_at).toLocaleTimeString()}
          </span>
        ) : null
      }
    >
      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
        }}>
          PROMPT
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'var(--color-bg-surface, #13151e)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          lineHeight: 1.6,
          padding: '8px 10px',
          resize: 'vertical',
          outline: 'none',
          marginBottom: 12,
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.09em',
          padding: '6px 20px',
          border: 'none',
          borderRadius: 999,
          cursor: isLoading ? 'wait' : 'pointer',
          color: '#000',
          background: isLoading ? 'var(--color-text-tertiary)' : 'var(--color-amber)',
          marginBottom: 20,
          display: 'block',
        }}
      >
        {isLoading ? 'GENERATING...' : 'GENERATE'}
      </button>

      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-bear)',
          margin: '0 0 16px',
        }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-text-primary)',
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
        }}>
          {result.summary}
        </div>
      )}
    </Panel>
  )
}
