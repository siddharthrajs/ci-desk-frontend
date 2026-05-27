import { createContext, useContext, type ReactNode } from 'react'
import { useMarketWebSocket } from '../hooks/useMarketWebSocket'

type MarketsValue = ReturnType<typeof useMarketWebSocket>

const MarketsContext = createContext<MarketsValue | null>(null)

export function MarketsProvider({ children }: { children: ReactNode }) {
  const value = useMarketWebSocket()
  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>
}

export function useMarkets(): MarketsValue {
  const ctx = useContext(MarketsContext)
  if (!ctx) throw new Error('useMarkets must be used within <MarketsProvider>')
  return ctx
}
