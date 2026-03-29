import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineSyncProvider } from './utils/OfflineSyncContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Pages
import Login from './pages/Login';
import FieldAgentDashboard from './pages/FieldAgentDashboard';
import SubmissionForm from './pages/SubmissionForm';

export default function App() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const closeUpdatePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <OfflineSyncProvider>
          <div className="min-h-screen bg-surface text-ink">
            {/* PWA Update Prompt */}
            {(offlineReady || needRefresh) && (
              <div className="fixed bottom-4 right-4 z-50 bg-ink text-white p-4 rounded-lg shadow-lg border border-border">
                <div className="mb-2 text-sm">
                  {offlineReady
                    ? <span>App ready to work offline</span>
                    : <span>New content available, click reload to update.</span>}
                </div>
                <div className="flex gap-2">
                  {needRefresh && (
                    <button
                      className="bg-primary px-3 py-1.5 rounded text-xs font-bold"
                      onClick={() => updateServiceWorker(true)}
                    >
                      Reload
                    </button>
                  )}
                  <button
                    className="bg-ink-secondary px-3 py-1.5 rounded text-xs font-bold"
                    onClick={closeUpdatePrompt}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - Field Agent */}
              <Route
                path="/field"
                element={
                  <ProtectedRoute allowedRoles={['field_agent']}>
                    <Navbar />
                    <FieldAgentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit"
                element={
                  <ProtectedRoute allowedRoles={['field_agent']}>
                    <Navbar />
                    <SubmissionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit/:farmerId"
                element={
                  <ProtectedRoute allowedRoles={['field_agent']}>
                    <Navbar />
                    <SubmissionForm />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </OfflineSyncProvider>
      </AuthProvider>
    </Router>
  );
}
