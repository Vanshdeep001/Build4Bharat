import { useOutletContext } from 'react-router-dom';
import AnalyticalOverview from '../components/AnalyticalOverview';
import DistrictBlockMap from '../components/DistrictBlockMap';
import AdvanceAnalyticsGraphs from '../components/AdvanceAnalyticsGraphs';


export function AdvanceAnalyticsPage() {
  const { selectedDistrict, setSelectedDistrict } = useOutletContext();

  return (
    <div className="p-0 space-y-10 animate-in fade-in duration-700">
      <AnalyticalOverview selectedDistrict={selectedDistrict} />

      {/* District Block Map Section */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <div>
              <h3 className="font-headline text-2xl font-black text-on-surface tracking-tight">
                Block-Level Granular Analytics
              </h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                {selectedDistrict !== 'Uttarakhand' ? `Selected District: ${selectedDistrict}` : 'Select a district first'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <span className="material-symbols-outlined text-primary text-sm">zoom_in</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Block View</span>
          </div>
        </div>

        <div className="p-8">
          <DistrictBlockMap selectedDistrict={selectedDistrict} />
        </div>
      </section>

      {/* Advanced Micro-Graphs Section */}
      <AdvanceAnalyticsGraphs selectedDistrict={selectedDistrict} />
    </div>
  );
}
