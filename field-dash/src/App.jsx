import { Navigate, Route, Routes } from 'react-router-dom'
import FieldDashOfficerProfileDesktop from './pages/FieldDashOfficerProfileDesktop'
import FieldDashDataSyncDesktop from './pages/FieldDashDataSyncDesktop'
import FieldDashFieldTasksDesktop from './pages/FieldDashFieldTasksDesktop'
import FieldDashFarmerRegistryDesktop from './pages/FieldDashFarmerRegistryDesktop'
import FieldDashSubmitFieldReportDesktop from './pages/FieldDashSubmitFieldReportDesktop'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/field-dash/officer-profile" replace />}
      />

      <Route
        path="/field-dash"
        element={<Navigate to="/field-dash/officer-profile" replace />}
      />
      <Route
        path="/field-dash/officer-profile"
        element={<FieldDashOfficerProfileDesktop />}
      />
      <Route
        path="/field-dash/data-sync"
        element={<FieldDashDataSyncDesktop />}
      />
      <Route
        path="/field-dash/field-tasks"
        element={<FieldDashFieldTasksDesktop />}
      />
      <Route
        path="/field-dash/farmer-registry"
        element={<FieldDashFarmerRegistryDesktop />}
      />
      <Route
        path="/field-dash/submit-field-report"
        element={<FieldDashSubmitFieldReportDesktop />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

