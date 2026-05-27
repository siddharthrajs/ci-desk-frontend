import { Outlet } from 'react-router-dom'
import { TickerStrip } from './TickerStrip'
import { Navbar } from './Navbar'
import { StatusBar } from './StatusBar'
import { MarketsProvider } from '../contexts/MarketsContext'

export function AppShell() {
  return (
    <MarketsProvider>
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
