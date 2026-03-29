import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBDOVisits } from '../../api';

export function BDOVisitsPage() {
  const { selectedBlock } = useOutletContext();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBDOVisits(selectedBlock).then(res => {
      if (mounted) {
        setVisits(res || []);
        setLoading(false);
      }
    });
    return () => mounted = false;
  }, [selectedBlock]);

  const filteredVisits = visits.filter(v => filter === 'all' ? true : v.status.toLowerCase() === filter);

  if (loading) return <div className="text-white flex items-center justify-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-[#758dd5]">sync</span></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Visit Tracking</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Monitor scheduled property verifications in {selectedBlock}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'missed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-colors border ${filter === f ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/20' : 'bg-surface-container border-outline-variant/5 text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest">Farmer/Beneficiary</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest">Assigned Agent</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest">Scheduled Date</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest">Village/Area</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-surface-container/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-on-surface font-black text-sm">{visit.farmerName}</div>
                    <div className="text-on-surface-variant/50 text-xs font-mono">{visit.farmerId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">person</span>
                       <span className="text-on-surface font-bold text-sm">{visit.agentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface font-black text-sm font-mono">{visit.date}</td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm font-bold flex items-center gap-1">
                     <span className="material-symbols-outlined text-[1rem]">location_on</span>
                     {visit.area}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      visit.status.toLowerCase() === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 
                      visit.status.toLowerCase() === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                      {visit.status.toLowerCase() === 'completed' && <span className="material-symbols-outlined text-[1rem]">check_circle</span>}
                      {visit.status.toLowerCase() === 'pending' && <span className="material-symbols-outlined text-[1rem]">hourglass_bottom</span>}
                      {visit.status.toLowerCase() === 'missed' && <span className="material-symbols-outlined text-[1rem]">warning</span>}
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant font-bold">No visits found matching filter criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
