import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../utils/OfflineSyncContext';

// ── Seed Data: Farmers assigned to tasks ────────────────────
const SEED_FARMERS = {
  seed_distribution: [
    { id: 'f-sd-1', name: 'Rajesh Rawat', village: 'Raithal', status: 'in_progress' },
    { id: 'f-sd-2', name: 'Suresh Bisht', village: 'Dyara', status: 'not_completed' },
    { id: 'f-sd-3', name: 'Mahesh Negi', village: 'Barsu', status: 'completed' },
    { id: 'f-sd-4', name: 'Ramesh Panwar', village: 'Gangotri', status: 'in_progress' },
    { id: 'f-sd-5', name: 'Dinesh Chauhan', village: 'Raithal', status: 'not_completed' },
    { id: 'f-sd-6', name: 'Geeta Dobhal', village: 'Dyara', status: 'completed' },
    { id: 'f-sd-7', name: 'Kavita Semwal', village: 'Barsu', status: 'in_progress' },
  ],
  canal_inspection: [
    { id: 'f-ci-1', name: 'Mohan Dobhal', village: 'Harsil', status: 'in_progress' },
    { id: 'f-ci-2', name: 'Sohan Semwal', village: 'Sukhi', status: 'completed' },
    { id: 'f-ci-3', name: 'Rohan Bhandari', village: 'Jhala', status: 'not_completed' },
    { id: 'f-ci-4', name: 'Kiran Joshi', village: 'Dharali', status: 'in_progress' },
    { id: 'f-ci-5', name: 'Prem Painuli', village: 'Harsil', status: 'completed' },
    { id: 'f-ci-6', name: 'Deepak Bhatt', village: 'Sukhi', status: 'not_completed' },
  ],
};

const statusLabel = {
  in_progress: { text: 'In Progress', color: 'bg-warning-light text-warning' },
  completed: { text: 'Completed', color: 'bg-success-light text-success' },
  not_completed: { text: 'Not Done', color: 'bg-danger-light text-danger' },
};

export default function FieldAgentDashboard() {
  const { user } = useAuth();
  const { isOnline, offlineQueue, syncData, syncing } = useOfflineSync();
  const [activeTab, setActiveTab] = useState('seed_distribution');

  const pendingSyncs = offlineQueue.length;
  const activeFarmers = SEED_FARMERS[activeTab] || [];
  const seedCount = SEED_FARMERS.seed_distribution.length;
  const canalCount = SEED_FARMERS.canal_inspection.length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-surface">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="pb-4 border-b border-border">
          <p className="label-text mb-1">Agent ID: {user?.phone}</p>
          <h1 className="text-2xl font-bold text-ink">
            Namaste, <span className="text-primary">{user?.name?.split(' ')[0] || 'Agent'}</span>
          </h1>
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

        {/* New Field Entry Button */}
        <Link
          to="/submit"
          className="btn-primary w-full flex items-center justify-between py-4 rounded-lg text-base"
        >
          <span className="font-bold uppercase tracking-wide">+ New Field Entry</span>
          <span className="text-lg">→</span>
        </Link>

        {/* Two Task Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Seed Distribution Card */}
          <button
            onClick={() => setActiveTab('seed_distribution')}
            className={`card text-left ${
              activeTab === 'seed_distribution'
                ? 'border-2 border-success bg-success-light'
                : ''
            }`}
          >
            <div className="text-2xl mb-2">🌾</div>
            <h3 className="text-sm font-bold text-ink">Seed Distribution</h3>
            <p className="text-xs text-ink-secondary mt-1">Dunda Zone A</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-success">{seedCount}</span>
              <span className="text-xs text-ink-muted">Farmers</span>
            </div>
          </button>

          {/* Canal Inspection Card */}
          <button
            onClick={() => setActiveTab('canal_inspection')}
            className={`card text-left ${
              activeTab === 'canal_inspection'
                ? 'border-2 border-primary bg-blue-50'
                : ''
            }`}
          >
            <div className="text-2xl mb-2">🚿</div>
            <h3 className="text-sm font-bold text-ink">Canal Inspection</h3>
            <p className="text-xs text-ink-secondary mt-1">Bhatwari Sector 3</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{canalCount}</span>
              <span className="text-xs text-ink-muted">Farmers</span>
            </div>
          </button>
        </div>

        {/* Farmer List */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
              {activeTab === 'seed_distribution' ? '🌾 Seed Distribution' : '🚿 Canal Inspection'} — Assigned Farmers
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
                <span className={`status-pill ${statusLabel[farmer.status].color}`}>
                  {statusLabel[farmer.status].text}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
