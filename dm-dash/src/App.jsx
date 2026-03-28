import { Navigate, Route, Routes } from 'react-router-dom'
import { SovereignLayout } from './layout/SovereignLayout'
import { AiAnomaliesPage } from './pages/AiAnomaliesPage'
import { BlockStatusPage } from './pages/BlockStatusPage'
import { GrievancesPage } from './pages/GrievancesPage'
import { LiveOverviewPage } from './pages/LiveOverviewPage'
import { SchemeConvergencePage } from './pages/SchemeConvergencePage'
import { AdvanceAnalyticsPage } from './pages/AdvanceAnalyticsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SovereignLayout />}>
        <Route index element={<LiveOverviewPage />} />
        <Route path="/block-status" element={<BlockStatusPage />} />
        <Route path="/scheme-convergence" element={<SchemeConvergencePage />} />
        <Route path="/advance-analytics" element={<AdvanceAnalyticsPage />} />
        <Route path="/grievances" element={<GrievancesPage />} />
        <Route path="/ai-anomalies" element={<AiAnomaliesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
