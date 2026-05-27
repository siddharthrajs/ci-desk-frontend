import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    FJWidgets?: {
      createWidget: (options: Record<string, unknown>) => void
    }
  }
}

const CONTAINER_ID = 'financialjuice-news-widget-container'
const SCRIPT_ID = 'FJ-Widgets'
const SCRIPT_SRC = 'https://feed.financialjuice.com/widgets/widgets.js'

function buildOptions() {
  return {
    container: CONTAINER_ID,
    mode: 'Dark',
    width: '100%',
    height: '100%',
    backColor: '1e222d',
    fontColor: 'b2b5be',
    widgetType: 'NEWS',
  }
}

export function FinancialJuiceWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const render = () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
      window.FJWidgets?.createWidget(buildOptions())
    }

    if (window.FJWidgets) {
      render()
      return
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.type = 'text/javascript'
      script.id = SCRIPT_ID
      script.src = `${SCRIPT_SRC}?r=${Math.floor(Math.random() * 10000)}`
      document.head.appendChild(script)
    }
    script.addEventListener('load', render)
    return () => script?.removeEventListener('load', render)
  }, [])

  return (
    <div
      ref={containerRef}
      id={CONTAINER_ID}
      style={{
        width: '100%',
        height: 'calc(100dvh - 334px)',
        border: '1px solid var(--color-border)',
        background: '#1e222d',
        overflow: 'hidden',
      }}
    />
  )
}
