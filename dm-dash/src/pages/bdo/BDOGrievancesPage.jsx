import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBDOGrievances, explainAnomaly } from '../../api';
import { useAnomalies } from '../../context/AnomalyContext';

function AnomalyCard({ anomaly }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    const res = await explainAnomaly(anomaly.type, anomaly.agent, anomaly.details);
    if (res) setExplanation(res.explanation);
    setLoading(false);
  };

  return (
    <div className={`p-8 border rounded-[2rem] bg-surface relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl ${
      anomaly.severity === 'high' ? 'border-error/20 shadow-[0_4px_20px_rgba(239,68,68,0.05)]' :
      anomaly.severity === 'medium' ? 'border-amber-500/20' : 'border-blue-500/20'
    }`}>
      <div className={`w-1.5 h-16 absolute left-0 top-6 rounded-r-full ${
        anomaly.severity === 'high' ? 'bg-error' :
        anomaly.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
      }`}></div>

      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-on-surface font-black tracking-wider text-xl mb-1">{anomaly.type}</h3>
            <p className="text-sm font-bold text-on-surface-variant/70">{anomaly.agent}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            anomaly.severity === 'high' ? 'bg-error/10 text-error border border-error/20 animate-pulse' :
            anomaly.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
          }`}>{anomaly.severity}</span>
        </div>
        <p className="text-on-surface text-sm leading-relaxed mb-6 font-medium italic">{anomaly.details}</p>
        
        {explanation ? (
          <div className="p-4 bg-surface-container-high/50 border border-outline-variant/10 rounded-xl mb-6 relative animate-in fade-in zoom-in duration-300">
             <span className="absolute -top-2 left-3 bg-surface text-primary text-[9px] font-black uppercase tracking-widest px-2 border border-outline-variant/10 rounded-full">AI Analysis</span>
             <p className="text-xs text-on-surface-variant font-medium leading-relaxed mt-1">{explanation}</p>
          </div>
        ) : (
          <button 
             onClick={handleExplain} 
             disabled={loading}
             className="mb-8 flex items-center gap-2 text-[10px] bg-primary/10 hover:bg-primary border border-primary/20 hover:border-primary text-primary hover:text-white px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest w-max"
          >
            <span className={`material-symbols-outlined text-[1rem] ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'psychology'}</span>
            {loading ? 'Analyzing...' : 'Explain Risk'}
          </button>
        )}
      </div>

      <div className="border-t border-outline-variant/10 pt-5 flex justify-between items-center mt-auto">
         <div className="text-[10px] text-on-surface-variant font-mono font-black">{anomaly.timestamp}</div>
         {anomaly.farmer !== 'Multiple Farmers' && (
           <div className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest bg-surface-container px-2 py-1 rounded">Farmer: {anomaly.farmer}</div>
         )}
      </div>
    </div>
  );
}

export function BDOGrievancesPage() {
  const { selectedBlock } = useOutletContext();
  const [grievances, setGrievances] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('anomalies'); // Since grievances was removed
  
  const { anomalies, config, setConfig, loading: loadingAnomalies } = useAnomalies();

  useEffect(() => {
    let mounted = true;
    setLoadingGrievances(true);
    fetchBDOGrievances(selectedBlock).then(res => {
      if (mounted) {
        setGrievances(res || []);
        setLoadingGrievances(false);
      }
    });
    return () => mounted = false;
  }, [selectedBlock]);

  const filteredGrievances = grievances.filter(g => filter === 'all' ? true : g.severity.toLowerCase() === filter);
  const filteredAnomalies = anomalies.filter(a => filter === 'all' ? true : a.severity.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-10 border-b border-outline-variant/10 pb-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Block Command Center</h1>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('anomalies')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all relative ${activeTab === 'anomalies' ? 'bg-[#002366] text-white shadow-xl shadow-primary/20' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-lg">warning</span>
              System Anomalies & Disputes
              {anomalies.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 bg-surface-container p-1.5 rounded-xl border border-outline-variant/10 shadow-sm">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2 ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
            >
              {f === 'high' && <span className="w-2 h-2 rounded-full bg-error"></span>}
              {f === 'medium' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
              {f === 'low' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
              {f}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'anomalies' && (
        <div className="bg-[#00113a] p-6 rounded-[2rem] border border-[#758dd5]/20 mb-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-lg">
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">settings_suggest</span>
              Anomaly Engine Rule Config
            </h3>
            <p className="text-xs text-[#758dd5]">Engine evaluates block activity in real-time. Adjust anomaly thresholds dynamically.</p>
          </div>
          <div className="flex gap-8 items-center bg-[#00081a] p-4 rounded-xl border border-[#758dd5]/10">
             <div className="flex flex-col gap-2 min-w-[150px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#758dd5] flex justify-between">
                 Duplicate Radius 
                 <span className="text-white bg-primary/20 px-1.5 rounded">{config.duplicateLocation.radius}m</span>
               </label>
               <input type="range" min="10" max="500" step="10" value={config.duplicateLocation.radius} onChange={e => setConfig({...config, duplicateLocation: {...config.duplicateLocation, radius: Number(e.target.value)}})} className="accent-primary" />
             </div>
             <div className="flex flex-col gap-2 min-w-[150px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#758dd5] flex justify-between">
                 Time Window 
                 <span className="text-white bg-primary/20 px-1.5 rounded">{config.duplicateLocation.timeWindowMin}m</span>
               </label>
               <input type="range" min="1" max="120" value={config.duplicateLocation.timeWindowMin} onChange={e => setConfig({...config, duplicateLocation: {...config.duplicateLocation, timeWindowMin: Number(e.target.value)}})} className="accent-primary" />
             </div>
             <div className="flex flex-col gap-2 pl-4 border-l border-[#758dd5]/20">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-10 h-5 rounded-full transition-colors relative ${config.missingImage.enabled ? 'bg-primary' : 'bg-[#758dd5]/20'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.missingImage.enabled ? 'left-6' : 'left-1'}`}></div>
                 </div>
                 <input type="checkbox" className="hidden" checked={config.missingImage.enabled} onChange={e => setConfig({...config, missingImage: {enabled: e.target.checked}})} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#758dd5] group-hover:text-white transition-colors">Missing<br/>Proof Rule</span>
               </label>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'grievances' && loadingGrievances && <div className="text-white flex items-center justify-center p-12"><span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span></div>}
      {activeTab === 'anomalies' && loadingAnomalies && <div className="text-white flex items-center justify-center p-12"><span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTab === 'anomalies' && !loadingAnomalies && filteredAnomalies.map(anomaly => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}

        {activeTab === 'anomalies' && !loadingAnomalies && filteredAnomalies.length === 0 && (
          <div className="col-span-full h-40 flex items-center justify-center text-primary font-black uppercase tracking-widest text-sm border border-primary/20 rounded-[2.5rem] bg-primary/5 border-dashed">
            <span className="material-symbols-outlined mr-2">verified_user</span>
            Zero system anomalies detected under current thresholds.
          </div>
        )}
      </div>
    </div>
  );
}
