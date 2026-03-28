import { useOutletContext } from 'react-router-dom';
import AnalyticalOverview from '../components/AnalyticalOverview';
import UttarakhandMap from '../components/UttarakhandMap';
import AIDailySummary from '../components/AIDailySummary';

export function LiveOverviewPage() {
  const { selectedDistrict, setSelectedDistrict } = useOutletContext();

  return (
    <div className="p-0 space-y-10 animate-in fade-in duration-700">
      <AnalyticalOverview selectedDistrict={selectedDistrict} />

      {/* Uttarakhand Risk Map Section */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <div>
              <h3 className="font-headline text-2xl font-black text-on-surface tracking-tight">
                Regional Anomaly Risk Assessment
              </h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                Earth Observation — Live Feed Response
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Map View</span>
          </div>
        </div>

        <div className="p-8">
          <UttarakhandMap 
            selectedDistrict={selectedDistrict} 
            onDistrictSelect={setSelectedDistrict} 
          />
        </div>
      </section>

      {/* Daily Intelligence Summary Section */}
      <AIDailySummary />

      {/* Live AI Anomaly Feed Section */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 text-error rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-black text-on-surface">
                Adaptive AI Intelligence Feed
              </h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Real-time Anomaly Detection</p>
            </div>
          </div>
          <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-lg transition-all ring-1 ring-primary/20">
            Historical Audit Log
          </button>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {[
            {
              severity: 'Critical',
              district: 'Haridwar',
              reason: 'Statistical Outlier: Beneficiary fund withdrawal frequency exceeds 300% of seasonal norm.',
              time: '14:22:01 IST',
              icon: 'error'
            },
            {
              severity: 'Alert',
              district: 'Chamoli',
              reason: 'Geo-fencing Mismatch: Fertilizer distribution point logs outside of assigned block radius.',
              time: '13:58:12 IST',
              icon: 'warning'
            },
            {
              severity: 'Minor',
              district: 'Udham Singh Nagar',
              reason: 'Duplication Flag: Matching biometric hashes found in 3 separate subsidy application nodes.',
              time: '12:11:45 IST',
              icon: 'info'
            },
          ].map((log) => (
            <div
              key={`${log.severity}-${log.district}`}
              className="p-8 flex items-center gap-8 hover:bg-surface-container/30 transition-all group relative cursor-pointer"
            >
              <div
                className={[
                  'w-1.5 h-16 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all opacity-0 group-hover:opacity-100',
                  log.severity === 'Critical' ? 'bg-error' : log.severity === 'Alert' ? 'bg-orange-500' : 'bg-primary',
                ].join(' ')}
              ></div>
              
              <div
                className={[
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0 shadow-sm transition-transform group-hover:scale-110',
                  log.severity === 'Critical'
                    ? 'bg-error text-white'
                    : 'bg-orange-100 text-orange-600',
                ].join(' ')}
              >
                <span className="material-symbols-outlined">{log.icon}</span>
                <span className="text-[8px] font-black uppercase">{log.severity}</span>
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                <div className="md:col-span-1">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">
                    District
                  </p>
                  <p className="text-sm font-black text-primary">{log.district}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">
                    Isolation Intelligence
                  </p>
                  <p className="text-sm font-medium text-on-surface">{log.reason}</p>
                </div>
                <div className="md:col-span-1 text-right">
                  <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-tighter opacity-40 mb-1">
                    Log Timestamp
                  </p>
                  <p className="text-xs font-black text-on-surface tabular-nums">{log.time}</p>
                </div>
              </div>
              <button className="p-3 rounded-full hover:bg-primary/10 text-primary transition-all group-hover:translate-x-1 border border-transparent hover:border-primary/20">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
