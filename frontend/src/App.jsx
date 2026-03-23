import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineSyncProvider } from './utils/OfflineSyncContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';
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
    <Router>
      <AuthProvider>
        <OfflineSyncProvider>
          <div className="min-h-screen bg-surface text-slate-200">
            {/* PWA Prompts */}
            {(offlineReady || needRefresh) && (
              <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="mb-2 text-sm text-slate-200">
                  {offlineReady
                    ? <span>App ready to work offline</span>
                    : <span>New content available, click on reload button to update.</span>}
                </div>
                <div className="flex gap-2">
                  {needRefresh && <button className="bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-lg text-xs font-bold" onClick={() => updateServiceWorker(true)}>Reload</button>}
                  <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold" onClick={closeUpdatePrompt}>Close</button>
                </div>
              </div>
            )}

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - Field Agent Only */}
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

              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </OfflineSyncProvider>
      </AuthProvider>
    </Router>
  );
}
