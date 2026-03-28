import React from 'react';

const AISummaryEntries = [
  {
    id: 1,
    source: 'BDO Synthesis',
    block: 'Joshimath',
    content: '100% saturation of Soil Health Cards achieved. AI identifies high potential for a new organic apple cluster development based on local soil data.',
    type: 'Success',
    icon: 'verified_user',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 2,
    source: 'Farmer Direct Feed',
    block: 'Pauri Garhwal',
    content: '45+ farmers reported late monsoon arrival. AI recommends shifting to drought-resistant millet varieties for the upcoming Kharif season.',
    type: 'Recommendation',
    icon: 'psychology',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    id: 3,
    source: 'Field Worker Observation',
    block: 'Almora',
    content: 'Physical verification of 12 primary health centers completed. 85% compliance with PMDDKY structural standards noted. Retrofitting needed for 2 units.',
    type: 'Audit',
    icon: 'engineering',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 4,
    source: 'Cross-Sector Insight',
    block: 'Nainital',
    content: 'Satellite imagery and BDO reports suggest record yield for Apple clusters. AI has pre-optimized cold chain logistics for upcoming harvest.',
    type: 'Optimization',
    icon: 'auto_graph',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

const AIDailySummary = () => {
  return (
    <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full"></div>
          <div>
            <h3 className="font-headline text-2xl font-black text-on-surface tracking-tight">
              Daily Intelligence Synthesis
            </h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              CROSS-DEPARTMENTAL AI ANALYSIS — LIVE FEED
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Generative Summary</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
        {AISummaryEntries.map((entry) => (
          <div key={entry.id} className="p-8 hover:bg-surface-container/30 transition-all group relative cursor-pointer">
            <div className="flex gap-6">
              <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${entry.bgColor} ${entry.color} transition-transform group-hover:scale-110 shadow-sm`}>
                <span className="material-symbols-outlined text-3xl">{entry.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{entry.source}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{entry.block}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${entry.bgColor} ${entry.color}`}>
                    {entry.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-on-surface leading-relaxed group-hover:text-on-surface transition-colors">
                  {entry.content}
                </p>
              </div>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary/40 text-sm">open_in_new</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-8 py-4 bg-surface-container/10 border-t border-outline-variant/10 flex justify-center">
        <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
          <span>View Full Intelligence Report</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};

export default AIDailySummary;
