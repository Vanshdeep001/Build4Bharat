import { Navigate, Route, Routes } from "react-router-dom";
import { SovereignLayout } from "./layout/SovereignLayout";
import { BDOLayout } from "./layout/BDOLayout";
import { AiAnomaliesPage } from "./pages/AiAnomaliesPage";
import { BlockStatusPage } from "./pages/BlockStatusPage";
import { GrievancesPage } from "./pages/GrievancesPage";
import { LiveOverviewPage } from "./pages/LiveOverviewPage";
import { SchemeConvergencePage } from "./pages/SchemeConvergencePage";
import { AdvanceAnalyticsPage } from "./pages/AdvanceAnalyticsPage";
import { AdministrativeActionsPage } from "./pages/AdministrativeActionsPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

// BDO Pages
import { BDOOverviewPage } from "./pages/bdo/BDOOverviewPage";
import { BDOAgentsPage } from "./pages/bdo/BDOAgentsPage";
import { BDOVisitsPage } from "./pages/bdo/BDOVisitsPage";
import { BDOGrievancesPage } from "./pages/bdo/BDOGrievancesPage";
import { BDOTodayPage } from "./pages/bdo/BDOTodayPage";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* DM Routes */}
      <Route path="/dm" element={
        <ProtectedRoute allowedRole="dm">
          <SovereignLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LiveOverviewPage />} />
        <Route path="block-status" element={<BlockStatusPage />} />
        <Route path="scheme-convergence" element={<SchemeConvergencePage />} />
        <Route path="advance-analytics" element={<AdvanceAnalyticsPage />} />
        <Route path="admin-actions" element={<AdministrativeActionsPage />} />
        <Route path="ai-anomalies" element={<AiAnomaliesPage />} />
      </Route>

      {/* BDO Routes */}
      <Route path="/bdo" element={
        <ProtectedRoute allowedRole="bdo">
          <BDOLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<BDOOverviewPage />} />
        <Route path="agents" element={<BDOAgentsPage />} />
        <Route path="visits" element={<BDOVisitsPage />} />
        <Route path="grievances" element={<BDOGrievancesPage />} />
        <Route path="today" element={<BDOTodayPage />} />
      </Route>

      {/* Root portal - The separator between DM and BDO Dashboard */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
