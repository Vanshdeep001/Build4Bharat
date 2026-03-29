import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../utils/OfflineSyncContext';
import api from '../utils/api';

const ACTIVITY_LABELS = {
  seed_distribution: { label: 'Seed Distribution', icon: '🌾' },
  irrigation_work: { label: 'Irrigation Work', icon: '🚿' },
  kcc_loan_camp: { label: 'KCC Loan Camp', icon: '🏦' },
  soil_health_card: { label: 'Soil Health Card', icon: '🧪' },
  storage_facility: { label: 'Storage Facility', icon: '🏗️' },
  training: { label: 'Training', icon: '📚' },
  canal_inspection: { label: 'Canal Inspection', icon: '🚿' },
};

const statusLabel = {
  in_progress: { text: 'In Progress', color: 'bg-warning-light text-warning' },
  completed: { text: 'Completed', color: 'bg-success-light text-success' },
  not_completed: { text: 'Not Done', color: 'bg-danger-light text-danger' },
};

export default function FieldAgentDashboard() {
  const { user } = useAuth();
  const { isOnline, offlineQueue, syncData, syncing } = useOfflineSync();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions/agent/dashboard');
      setDashboardData(res.data);
      // Set first tab as active
      const taskKeys = Object.keys(res.data.tasks || {});
      if (taskKeys.length > 0 && !activeTab) {
        setActiveTab(taskKeys[0]);
      }
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const pendingSyncs = offlineQueue.length;
  const tasks = dashboardData?.tasks || {};
  const taskKeys = Object.keys(tasks);
  const activeFarmers = activeTab ? (tasks[activeTab]?.farmers || []) : [];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink-secondary font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-surface">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="pb-4 border-b border-border">
          <p className="label-text mb-1">Agent ID: {user?.phone}</p>
          <h1 className="text-2xl font-bold text-ink">
            Namaste, <span className="text-primary">{user?.name?.split(' ')[0] || 'Agent'}</span>
          </h1>
          {dashboardData && (
            <p className="text-xs text-ink-muted mt-1">
              {dashboardData.total_farmers} farmers in block • {dashboardData.agent?.completed_tasks || 0} tasks completed
            </p>
          )}
        </div>

        {/* System Alerts */}
        {!isOnline && (
          <div className="bg-danger text-white p-3 rounded-lg text-xs font-bold flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              OFFLINE MODE — {pendingSyncs} items saved locally
            </div>
          </div>
        )}

        {isOnline && pendingSyncs > 0 && (
          <div className="bg-primary text-white p-3 rounded-lg text-xs font-bold flex justify-between items-center">
            <span>🔄 {pendingSyncs} unsent reports detected</span>
            <button
              onClick={syncData}
              disabled={syncing}
              className="bg-white text-primary px-3 py-1 rounded font-bold text-xs"
            >
              {syncing ? 'SYNCING...' : 'SYNC NOW'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-danger-light border-l-4 border-danger p-3 text-danger text-sm font-semibold">
            {error}
            <button onClick={fetchDashboard} className="ml-2 underline">Retry</button>
          </div>
        )}

        {/* New Field Entry Button */}
        <Link
          to="/submit"
          className="btn-primary w-full flex items-center justify-between py-4 rounded-lg text-base"
        >
          <span className="font-bold uppercase tracking-wide">+ New Field Entry</span>
          <span className="text-lg">→</span>
        </Link>

        {/* Task Cards */}
        {taskKeys.length > 0 && (
          <div className={`grid gap-3 ${taskKeys.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {taskKeys.map((taskKey) => {
              const task = tasks[taskKey];
              const meta = ACTIVITY_LABELS[taskKey] || { label: taskKey.replace(/_/g, ' '), icon: '📋' };
              return (
                <button
                  key={taskKey}
                  onClick={() => setActiveTab(taskKey)}
                  className={`card text-left ${
                    activeTab === taskKey
                      ? 'border-2 border-success bg-success-light'
                      : ''
                  }`}
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <h3 className="text-sm font-bold text-ink capitalize">{meta.label}</h3>
                  <p className="text-xs text-ink-secondary mt-1">
                    {task.completed}/{task.total} completed
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold text-success">{task.total}</span>
                    <span className="text-xs text-ink-muted">Farmers</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Farmer List */}
        {activeTab && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
                {(ACTIVITY_LABELS[activeTab]?.icon || '📋')}{' '}
                {(ACTIVITY_LABELS[activeTab]?.label || activeTab.replace(/_/g, ' '))} — Assigned Farmers
              </h2>
              <span className="status-pill bg-surface text-ink-secondary border border-border">
                {activeFarmers.length}
              </span>
            </div>

            <div className="divide-y divide-border">
              {activeFarmers.map((farmer) => (
                <Link
                  key={farmer.id}
                  to={`/submit/${farmer.id}?name=${encodeURIComponent(farmer.name)}&village=${encodeURIComponent(farmer.village)}&task=${activeTab}&status=${farmer.status}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {farmer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{farmer.name}</p>
                      <p className="text-xs text-ink-muted">{farmer.village}</p>
                    </div>
                  </div>
                  <span className={`status-pill ${(statusLabel[farmer.status] || statusLabel.not_completed).color}`}>
                    {(statusLabel[farmer.status] || statusLabel.not_completed).text}
                  </span>
                </Link>
              ))}
              {activeFarmers.length === 0 && (
                <div className="px-5 py-8 text-center text-ink-muted text-sm">
                  No farmers assigned yet.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
