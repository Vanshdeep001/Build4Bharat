import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBDOTodaySummary } from '../../api';

export function BDOTodayPage() {
  const { selectedBlock } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBDOTodaySummary(selectedBlock).then(res => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => mounted = false;
  }, [selectedBlock]);

  if (loading) return <div className="text-white flex items-center justify-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-[#758dd5]">sync</span></div>;
  if (!data) return <div className="text-red-400">Failed to load today's data.</div>;

  return (
    <div className="space-y-6">
      <header className="mb-10 space-y-1">
        <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Today's Operations</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Current day active tracking for {selectedBlock}</p>
        </div>
      </header>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
           <h3 className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em] mb-2 relative">Total Tasks Assigned</h3>
           <div className="text-5xl font-headline font-black text-on-surface relative">{data.stats.assigned}</div>
           <div className="absolute -bottom-4 -right-4 text-primary/5 pointer-events-none group-hover:text-primary/10 transition-colors">
             <span className="material-symbols-outlined text-9xl">assignment</span>
           </div>
        </div>
        
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden col-span-1 md:col-span-2 flex items-center gap-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
           <div className="w-1/3 relative">
             <h3 className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em] mb-2">Completion Rate</h3>
             <div className="text-4xl font-headline font-black text-on-surface">{Math.round((data.stats.completed / data.stats.assigned) * 100) || 0}%</div>
           </div>
           <div className="w-2/3 space-y-4 relative">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                   <span className="text-green-600 dark:text-green-400">{data.stats.completed} Completed</span>
                   <span className="text-amber-600 dark:text-amber-400">{data.stats.pending} Pending</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden flex shadow-inner border border-outline-variant/10">
                   <div className="bg-green-500 h-full" style={{ width: `${(data.stats.completed / data.stats.assigned) * 100}%` }}></div>
                   <div className="bg-amber-500 h-full" style={{ width: `${(data.stats.pending / data.stats.assigned) * 100}%` }}></div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6 mt-10">
         <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight flex items-center gap-3">
           <span className="material-symbols-outlined text-primary">groups</span>
           Active Field Agents
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {data.activeAgents.map(agent => (
             <div key={agent.id} className="bg-surface-container/50 border border-outline-variant/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-surface-container-high transition-colors group cursor-pointer shadow-sm">
               <div className="relative">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                   {agent.name.charAt(0)}
                 </div>
                 {agent.status === 'active' ? (
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface bg-green-500"></div>
                 ) : (
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface bg-amber-500"></div>
                 )}
               </div>
               <div className="flex-1">
                 <div className="text-on-surface font-black text-sm tracking-widest">{agent.name}</div>
                 <div className="text-on-surface-variant font-bold text-xs font-mono opacity-80">{agent.area}</div>
               </div>
               <div className="text-right">
                 <div className="text-on-surface font-black">{agent.progress}%</div>
                 <div className="text-[0.6rem] text-on-surface-variant uppercase tracking-widest font-bold">{agent.tasksCompleted}/{agent.totalTasks} Done</div>
               </div>
             </div>
           ))}
         </div>
      </div>
      
      {/* Optional Map View placeholder */}
      <div className="mt-10 bg-surface-container-lowest border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-sm h-80 flex flex-col items-center justify-center relative overflow-hidden group">
         <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 group-hover:scale-110 transition-transform duration-500">map</span>
         <h3 className="text-xl font-headline font-black text-on-surface-variant/50 uppercase tracking-widest">Live GIS Map Initialization</h3>
         <p className="text-on-surface-variant/40 text-sm mt-2 font-mono font-bold">Connecting to PMDDKY Satellite Feed...</p>
         
         {/* Subtle scanline effect */}
         <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay dark:bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)]"></div>
      </div>

    </div>
  );
}
