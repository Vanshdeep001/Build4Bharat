import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../utils/OfflineSyncContext';
import api from '../utils/api';

const activityLabels = {
  seed_distribution: 'Seed Distribution',
  irrigation_work: 'Irrigation Work',
  kcc_loan_camp: 'KCC Loan Camp',
  soil_health_card: 'Soil Health Card',
  storage_facility: 'Storage Facility',
  training: 'Training',
};

const ASSIGNED_PROJECTS = [
  { id: 'proj-1', name: 'Seed Distribution - Dunda Zone A', status: 'pending', deadline: 'Today, 4:00 PM', icon: '🌱' },
  { id: 'proj-2', name: 'Canal Insp - Bhatwari Sector 3', status: 'submitted', last_update: 'Yesterday', icon: '💧' }
];

export default function FieldAgentDashboard() {
  const { user } = useAuth();
  const { isOnline, offlineQueue, syncData, syncing } = useOfflineSync();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/submissions/agent');
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingSyncs = offlineQueue.length;

  return (
    <div className="min-h-screen pt-44 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-creme">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between border-b-4 border-brand-ink pb-6">
          <div>
            <p className="text-label text-brand-ink mb-2">Agent ID: {user?.phone}</p>
            <h1 className="text-4xl md:text-5xl font-display font-[800] leading-none text-brand-ink">
              Namaste, <span className="text-accent-cobalt">{user?.name?.split(' ')[0] || 'Agent'}</span>
            </h1>
          </div>
        </div>

        {/* System Alerts - Minimalist & Bold */}
        {!isOnline && (
          <div className="bg-rose-600 text-white p-4 font-mono text-[11px] font-bold flex justify-between items-center border-2 border-black shadow-[4px_4px_0px_black]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              OFFLINE MODE // {pendingSyncs} ITEMS SAVED
            </div>
          </div>
        )}
        
        {isOnline && pendingSyncs > 0 && (
          <div className="bg-accent-cobalt text-white p-4 font-mono text-[11px] font-bold flex justify-between items-center border-2 border-black shadow-[4px_4px_0px_black]">
            <div className="flex items-center gap-3">
              <span className="animate-spin">🔄</span>
              UNSENT REPORTS DETECTED
            </div>
            <button 
              onClick={syncData}
              disabled={syncing}
              className="bg-white text-black px-4 py-1 hover:bg-brand-clay transition"
            >
              {syncing ? 'SYNCING...' : 'FORCE UPLOAD'}
            </button>
          </div>
        )}

        {/* Primary Action Button - Capsule Shape */}
        <div className="pt-4">
          <Link
            to="/submit"
            className="btn-capsule w-full flex items-center justify-between group"
          >
            <span className="text-lg md:text-xl uppercase tracking-tighter">New Field Entry</span>
            <span className="text-2xl group-hover:rotate-45 transition-transform duration-500">↗</span>
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Widget */}
          <div className="bento-tile p-6 flex flex-col justify-between h-32 md:h-auto">
             <p className="text-label">Weekly Goal</p>
             <div>
                <p className="text-5xl font-display font-black leading-none text-brand-ink">12</p>
                <div className="mt-2 w-full h-1.5 bg-brand-clay rounded-full overflow-hidden">
                   <div className="h-full bg-accent-cobalt w-[65%]"></div>
                </div>
             </div>
          </div>

          {/* Tasks List - Center Stretched */}
          <div className="md:col-span-2 bento-tile p-6">
            <h2 className="font-display font-bold text-xl mb-6 uppercase tracking-tight flex items-center gap-2 text-brand-ink">
               Work Today <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <div className="space-y-4">
              {ASSIGNED_PROJECTS.map(proj => (
                <div key={proj.id} className="flex items-center justify-between group py-2 border-b border-brand-ink/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{proj.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold truncate max-w-[150px] md:max-w-xs text-brand-ink">{proj.name}</h3>
                      <p className="text-label text-brand-ink/60">{proj.deadline || proj.last_update}</p>
                    </div>
                  </div>
                  <span className={`pill-shape px-3 py-0.5 text-[9px] font-bold ${
                    proj.status === 'pending' ? 'bg-accent-terracotta text-white' : 'bg-brand-clay text-brand-ink'
                  }`}>
                    {proj.status === 'pending' ? 'GO' : 'DONE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Pulse (Log) */}
        <div className="space-y-6 pt-4">
          <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-brand-ink text-center md:text-left">My Work</h2>
          
          <div className="space-y-4">
            {offlineQueue.map((q) => (
              <div key={q.id} className="relative flex gap-6 items-start">
                <div className="w-1 bg-accent-terracotta/20 absolute left-6 top-8 bottom-[-16px]"></div>
                <div className="w-12 h-12 rounded-full border-4 border-brand-creme bg-accent-terracotta flex items-center justify-center text-white font-mono text-xs font-bold shrink-0 z-10">
                   WAIT
                </div>
                <div className="organic-panel p-5 flex-1 rounded-[24px]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm tracking-tight text-brand-ink">{activityLabels[q.data.activity_type] || 'Manual Entry'}</h3>
                    <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 rounded uppercase">Saved</span>
                  </div>
                  <p className="text-[10px] text-brand-ink font-bold italic">Sending when internet is back...</p>
                </div>
              </div>
            ))}

            {submissions.map((s) => (
              <div key={s._id} className="relative flex gap-6 items-start">
                <div className="w-1 bg-brand-ink/10 absolute left-6 top-8 bottom-[-16px] last:hidden"></div>
                <div className={`w-12 h-12 rounded-full border-4 border-brand-creme flex items-center justify-center text-white shrink-0 z-10 ${
                  s.is_anomaly ? 'bg-red-500' : 'bg-brand-ink'
                }`}>
                  {s.is_anomaly ? '✖' : '✔'}
                </div>
                <div className="organic-panel p-5 flex-1 rounded-[24px]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-sm tracking-tight text-brand-ink">{activityLabels[s.activity_type] || s.activity_type}</h3>
                    <span className="text-label">{s.village}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-4">
                      <div className="px-3 py-1 bg-brand-clay rounded-full text-label border border-brand-ink/10">
                        Done: {s.completion_percentage}%
                      </div>
                      {s.is_anomaly && (
                        <div className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-label underline font-black italic">
                          FLAGGED
                        </div>
                      )}
                    </div>
                    {s.materials_used && (typeof s.materials_used === 'string' ? s.materials_used : Object.keys(s.materials_used).length > 0) && (
                      <p className="text-[11px] font-black text-brand-ink/80 bg-brand-creme/50 p-2 rounded-lg border-l-4 border-accent-cobalt">
                        Used: {(() => {
                          if (typeof s.materials_used === 'string') return s.materials_used;
                          const keys = Object.keys(s.materials_used);
                          if (keys.length === 0) return null;
                          return keys.map(k => {
                            const val = s.materials_used[k];
                            const label = k.replace('_', ' ');
                            return `${val} ${label}`;
                          }).join(', ');
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
