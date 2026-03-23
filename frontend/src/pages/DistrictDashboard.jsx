import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../utils/socket';
import api from '../utils/api';
import KPICard from '../components/KPICard';
import BlockMap from '../components/BlockMap';
import AnomalyAlert from '../components/AnomalyAlert';
import FundFlowChart from '../components/FundFlowChart';
import GrievanceFeed from '../components/GrievanceFeed';

export default function DistrictDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showIVR, setShowIVR] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const districtId = user?.district_id;

  useEffect(() => {
    if (!districtId) return;
    loadData();

    const socket = connectSocket(districtId);

    socket.on('new_anomaly', (data) => {
      addToast(`🚨 Anomaly in ${data.block_name}: ${data.type} (Score: ${data.score})`, 'red');
      loadData();
    });

    socket.on('new_verification', (data) => {
      addToast(`📋 New verification from ${data.block_id}`, 'blue');
    });

    socket.on('kpi_alert', (data) => {
      addToast(`⚠️ KPI at risk: ${data.kpi_name} — projected ${data.projected_pct}%`, 'amber');
    });

    return () => disconnectSocket();
  }, [districtId]);

  const loadData = async () => {
    try {
      const [dashRes, anomRes] = await Promise.all([
        api.get(`/dashboard/district/${districtId}`),
        api.get(`/anomalies/district/${districtId}`),
      ]);
      setDashboard(dashRes.data);
      setAnomalies(anomRes.data || []);

      try {
        const verRes = await api.get(`/verifications/district/${districtId}`);
        setVerifications(verRes.data || []);
      } catch { setVerifications([]); }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, color) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleAnomalyAction = async (id, status, note) => {
    try {
      await api.patch(`/anomalies/${id}/status`, { status, note });
      loadData();
      addToast(`Anomaly ${status}`, 'green');
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleIVR = async (benefitReceived) => {
    try {
      await api.post('/verifications', {
        district_id: districtId,
        block_id: 'dunda',
        channel: 'ivr',
        benefit_received: benefitReceived,
        quality_rating: benefitReceived ? 4 : 1,
        issue_description: benefitReceived ? null : 'Benefit not received (IVR response)',
      });
      setShowIVR(false);
      addToast('IVR verification recorded', 'green');
      loadData();
    } catch (err) {
      console.error('IVR error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-creme pt-24 flex items-center justify-center font-mono text-xs font-bold animate-pulse text-brand-ink">
        LOADING DASHBOARD...
      </div>
    );
  }

  const d = dashboard;

  return (
    <div className="min-h-screen bg-brand-creme pt-44 pb-16 px-4 md:px-8">
      {/* Toast Engine */}
      <div className="fixed bottom-8 right-8 z-[200] space-y-4">
        {toasts.map(t => (
          <div key={t.id} className="bg-brand-ink text-white p-5 rounded-2xl border-4 border-black shadow-[8px_8px_0px_rgba(45,92,247,0.4)] max-w-sm animate-in slide-in-from-bottom-8 duration-500">
            <p className="font-display font-bold text-xs">{t.message}</p>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-8 border-brand-ink">
          <div>
            <p className="text-label text-brand-ink mb-4">District Report</p>
            <h1 className="text-display text-5xl md:text-7xl font-black uppercase leading-none text-brand-ink">
              {districtId?.split('-')[0]} <span className="text-accent-cobalt">Overview.</span>
            </h1>
          </div>
          <button
            onClick={() => setShowIVR(true)}
            className="btn-capsule w-fit"
          >
            START PHONE SURVEY
          </button>
        </div>

        {/* Global KPIs - Bento Box Stretched */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bento-tile p-8">
             <p className="text-label mb-6">Total Work Done</p>
             <p className="text-5xl font-display font-black leading-none text-brand-ink">{d?.total_submissions || 0}</p>
          </div>
          <div className="bento-tile p-8">
             <p className="text-label mb-6">Problems Found</p>
             <p className={`text-5xl font-display font-black leading-none ${d?.open_anomalies > 0 ? 'text-accent-terracotta' : 'text-emerald-500'}`}>
                {d?.open_anomalies || 0}
             </p>
          </div>
          <div className="bento-tile p-8">
             <p className="text-label mb-6">Money Spent</p>
             <p className="text-5xl font-display font-black leading-none text-brand-ink">{d?.fund_utilisation_pct || 0}%</p>
          </div>
          <div className="bento-tile p-8">
             <p className="text-label mb-6">Completion</p>
             <p className="text-5xl font-display font-black leading-none text-brand-ink">{d?.avg_physical_progress_pct || 0}%</p>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Visual Matrix (Map) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">District Map</h2>
            <div className="organic-panel p-2 overflow-hidden border-4 border-brand-ink min-h-[500px] relative">
               <BlockMap
                blockSummary={d?.block_summary || []}
                districtId={districtId}
                onBlockClick={setSelectedBlock}
               />
               <div className="absolute bottom-8 right-8 flex gap-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-brand-ink">
                  <div className="flex items-center gap-2 font-mono text-[9px] font-black"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> NOMINAL</div>
                  <div className="flex items-center gap-2 font-mono text-[9px] font-black"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> WARNING</div>
                  <div className="flex items-center gap-2 font-mono text-[9px] font-black"><span className="w-3 h-3 bg-rose-500 rounded-full"></span> CRITICAL</div>
               </div>
            </div>
          </div>

          {/* Anomaly Stream */}
          <div className="space-y-6">
             <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">Problems Found</h2>
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {anomalies.length === 0 ? (
                  <div className="organic-panel p-8 text-center italic font-mono text-[10px] text-brand-ink/40">No issues detected.</div>
                ) : (
                  anomalies.map(a => (
                    <div key={a._id} className="relative transition-all hover:translate-x-1 group">
                       <AnomalyAlert anomaly={a} onAction={handleAnomalyAction} />
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Data Architecture (Table & Charts) */}
        <div className="grid lg:grid-cols-2 gap-12 pt-8">
           <GrievanceFeed verifications={verifications} />
           <div className="space-y-6">
              <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">Fund Distribution</h2>
              <div className="organic-panel p-8">
                 <FundFlowChart fundByScheme={d?.fund_by_scheme || []} />
              </div>
           </div>
        </div>

        {/* Advanced Risk Evaluation */}
        <div className="bento-tile p-8 md:p-12">
          <h2 className="text-display text-4xl font-black uppercase mb-12 tracking-tighter text-brand-ink">Performance Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-brand-ink text-left">
                  <th className="py-6 text-label text-brand-ink">Work Name</th>
                  <th className="py-6 text-label text-right text-brand-ink">Goal</th>
                  <th className="py-6 text-label text-right text-brand-ink">Today</th>
                  <th className="py-6 text-label text-right text-brand-ink">Estimated</th>
                  <th className="py-6 text-label text-right text-brand-ink">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-ink/5">
                {(d?.kpi_at_risk || []).map((kpi, i) => (
                  <tr key={i} className={`group ${kpi.at_risk ? 'bg-rose-500/5' : ''}`}>
                    <td className="py-8 font-display font-bold text-lg text-brand-ink">{kpi.kpi_name}</td>
                    <td className="py-8 text-right font-mono font-bold text-brand-ink">{kpi.target}</td>
                    <td className="py-8 text-right font-mono font-bold text-brand-ink">{kpi.current_value}</td>
                    <td className="py-8 text-right font-mono font-bold text-accent-cobalt">{kpi.projected}</td>
                    <td className="py-8 text-right">
                      <span className={`pill-shape px-4 py-1 text-[10px] font-black uppercase tracking-widest ${
                        kpi.at_risk ? 'bg-accent-terracotta text-white' : 'bg-brand-clay text-brand-ink'
                      }`}>
                        {kpi.at_risk ? `NEEDS ATTENTION` : 'ON TRACK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Simulator Interface (Modal) */}
      {showIVR && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-brand-ink/80 backdrop-blur-xl animate-in fade-in duration-700"></div>
           <div className="relative organic-panel max-w-sm w-full p-8 space-y-8 bg-white border-4 border-black shadow-[12px_12px_0px_rgba(45,92,247,0.4)]">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-brand-ink">Phone Survey<br/>Test</h2>
                    <p className="font-mono text-[9px] text-accent-cobalt font-bold uppercase mt-2">Automated Survey</p>
                 </div>
                 <button onClick={() => setShowIVR(false)} className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold hover:bg-black hover:text-white transition">✖</button>
              </div>

              <div className="bg-brand-clay p-6 rounded-3xl border-2 border-black/5 space-y-4">
                 <div className="w-16 h-16 mx-auto rounded-full bg-black flex items-center justify-center text-white text-3xl animate-bounce">📱</div>
                 <p className="text-center font-medium leading-relaxed italic text-sm text-brand-ink">"Namaskar. PMDDKY ke tahat aapko beej vitaran ka laabh mila? Dabayein 1 haan ke liye, 2 nahi ke liye."</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => handleIVR(true)} className="btn-capsule py-8 text-4xl hover:bg-emerald-500">1</button>
                 <button onClick={() => handleIVR(false)} className="btn-capsule py-8 text-4xl hover:bg-rose-500">2</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
