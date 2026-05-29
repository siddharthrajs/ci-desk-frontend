import { Outlet } from 'react-router-dom'
import { TickerStrip } from './TickerStrip'
import { Navbar } from './Navbar'
import { StatusBar } from './StatusBar'
import { MarketsProvider } from '../contexts/MarketsContext'
import {
  useMidstreamData,
  useCrackSpreads,
  useRefineryUtilization,
  useProductDemand,
  useUsCrudeProduction,
  useUsRigCount,
  useUsProductionByRegion,
  useUsApiGravity,
  useUsCrudeImports,
  useUsNaturalGas,
  useUsReserves,
  useCotPositions,
  useMarketNews,
  useEconomicCalendar,
  useOilQuotes,
  useWpsrTables,
} from '../hooks/useApiData'

function DataPrefetcher() {
  useMidstreamData()
  useCrackSpreads()
  useRefineryUtilization()
  useProductDemand()
  useUsCrudeProduction()
  useUsRigCount()
  useUsProductionByRegion()
  useUsApiGravity()
  useUsCrudeImports()
  useUsNaturalGas()
  useUsReserves()
  useCotPositions()
  useMarketNews()
  useEconomicCalendar()
  useOilQuotes()
  useWpsrTables()
  return null
}

export function AppShell() {
  return (
    <MarketsProvider>
      <DataPrefetcher />
      <TickerStrip />
      <Navbar />

      {/* Main scrollable content */}
      <main style={{
        marginTop: 84,      /* ticker 36 + navbar 48 */
        marginBottom: 28,   /* status bar */
        minHeight: 'calc(100dvh - 112px)',
        overflowY: 'auto',
      }}>
        <div style={{
          maxWidth: 1500,
          margin: '0 auto',
          padding: '24px 20px',
        }}>
          <Outlet />
        </div>
      </main>

      <StatusBar />
    </MarketsProvider>
  )
}
