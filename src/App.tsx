import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppShell } from './components/AppShell'
import { Markets } from './pages/Markets'
import { Macro } from './pages/Macro'
import { Upstream } from './pages/Upstream'
import { Midstream } from './pages/Midstream'
import { Downstream } from './pages/Downstream'
import { Reports } from './pages/Reports'
import { Positions } from './pages/Positions'
import { News } from './pages/News'
import { PredictionMarkets } from './pages/PredictionMarkets'
import { Showcase } from './pages/Showcase'
import { isTabEnabled } from './lib/featureFlags'

function TabRoute({ envKey, element }: { envKey: string; element: ReactElement }) {
  return isTabEnabled(envKey) ? element : <Navigate to="/news" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/news" replace />} />
          <Route path="markets"           element={<TabRoute envKey="VITE_TAB_MARKETS"            element={<Markets />} />} />
          <Route path="macro"             element={<TabRoute envKey="VITE_TAB_MACRO"              element={<Macro />} />} />
          <Route path="upstream"          element={<TabRoute envKey="VITE_TAB_UPSTREAM"           element={<Upstream />} />} />
          <Route path="midstream"         element={<TabRoute envKey="VITE_TAB_MIDSTREAM"          element={<Midstream />} />} />
          <Route path="downstream"        element={<TabRoute envKey="VITE_TAB_DOWNSTREAM"         element={<Downstream />} />} />
          <Route path="reports"           element={<TabRoute envKey="VITE_TAB_REPORTS"            element={<Reports />} />} />
          <Route path="positions"         element={<TabRoute envKey="VITE_TAB_POSITIONS"          element={<Positions />} />} />
          <Route path="news"              element={<TabRoute envKey="VITE_TAB_NEWS"               element={<News />} />} />
          <Route path="prediction-markets" element={<TabRoute envKey="VITE_TAB_PREDICTION_MARKETS" element={<PredictionMarkets />} />} />
          <Route path="components"        element={<TabRoute envKey="VITE_TAB_COMPONENTS"         element={<Showcase />} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
