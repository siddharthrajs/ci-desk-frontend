import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Markets } from './pages/Markets'
import { Upstream } from './pages/Upstream'
import { Midstream } from './pages/Midstream'
import { Downstream } from './pages/Downstream'
import { Showcase } from './pages/Showcase'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/markets" replace />} />
          <Route path="markets"    element={<Markets />} />
          <Route path="upstream"   element={<Upstream />} />
          <Route path="midstream"  element={<Midstream />} />
          <Route path="downstream" element={<Downstream />} />
          <Route path="components" element={<Showcase />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
