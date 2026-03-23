import { useState, useEffect } from 'react';
import api from '../utils/api';
import BlockMap from '../components/BlockMap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StateDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('district_name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/dashboard/state');
      setData(res.data);
    } catch (err) {
      console.error('State dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sortedDistricts = (data?.districts || []).sort((a, b) => {
    const va = a[sortBy] || 0;
    const vb = b[sortBy] || 0;
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const chartData = {
    labels: sortedDistricts.map(d => d.district_name),
    datasets: [
      {
        label: 'Fund Utilisation %',
        data: sortedDistricts.map(d => d.fund_utilisation_pct),
        backgroundColor: '#2d5cf7',
        borderRadius: 20,
      },
      {
        label: 'Physical Progress %',
        data: sortedDistricts.map(d => d.avg_physical_progress_pct),
        backgroundColor: '#e27d60',
        borderRadius: 20,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-creme pt-24 flex items-center justify-center font-mono text-xs font-bold animate-pulse text-brand-ink">
        LOADING STATE DATA...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-creme pt-44 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="border-b-8 border-brand-ink pb-8">
           <p className="font-mono text-[10px] uppercase font-bold text-accent-cobalt tracking-widest mb-4">Dashboard / State Overview</p>
           <h1 className="text-display text-5xl md:text-8xl font-black uppercase leading-none text-brand-ink">
             State<br/><span className="text-accent-cobalt">Overview.</span>
           </h1>
           <p className="mt-4 font-mono text-xs font-bold text-brand-ink/60 uppercase">Geographic Hub: Uttarakhand Overview</p>
        </div>

        {/* Spatial Overview */}
        <div className="grid lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">State Map</h2>
              <div className="organic-panel p-2 border-4 border-brand-ink min-h-[450px]">
                 <BlockMap blockSummary={[]} />
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">Average Progress</h2>
              <div className="bento-tile p-8 aspect-square flex flex-col justify-between">
                 <p className="font-mono text-[10px] uppercase font-extrabold text-brand-ink/60">Avg Progress</p>
                 <div>
                    <p className="text-7xl font-display font-black leading-none">78%</p>
                    <div className="mt-4 w-full h-3 bg-brand-clay rounded-full overflow-hidden">
                       <div className="h-full bg-accent-cobalt w-[78%]"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* District Comparison Data Matrix */}
        <div className="bento-tile p-8 md:p-12 overflow-hidden">
          <h2 className="text-display text-4xl font-black uppercase mb-12 tracking-tighter text-brand-ink">District Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-brand-ink text-left">
                  <th onClick={() => handleSort('district_name')} className="py-6 text-label cursor-pointer hover:text-accent-cobalt transition text-brand-ink">District Name</th>
                  <th onClick={() => handleSort('total_submissions')} className="py-6 text-label text-right cursor-pointer hover:text-accent-cobalt transition text-brand-ink">Work Done</th>
                  <th onClick={() => handleSort('open_anomalies')} className="py-6 text-label text-right cursor-pointer hover:text-accent-cobalt transition text-brand-ink">Alerts</th>
                  <th onClick={() => handleSort('fund_utilisation_pct')} className="py-6 text-label text-right cursor-pointer hover:text-accent-cobalt transition text-brand-ink">Money Spent</th>
                  <th onClick={() => handleSort('avg_physical_progress_pct')} className="py-6 text-label text-right cursor-pointer hover:text-accent-cobalt transition text-brand-ink">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-ink/5">
                {sortedDistricts.map(d => (
                  <tr key={d.district_id} className="hover:bg-brand-clay/30 transition-colors">
                    <td className="py-8 font-display font-bold text-lg text-brand-ink">{d.district_name}</td>
                    <td className="py-8 text-right font-mono font-bold text-brand-ink">{d.total_submissions}</td>
                    <td className="py-8 text-right">
                      <span className={`pill-shape px-4 py-1 text-[10px] font-black ${d.open_anomalies > 0 ? 'bg-accent-terracotta text-white' : 'bg-brand-clay text-slate-400'}`}>
                        {d.open_anomalies} ACTIVE
                      </span>
                    </td>
                    <td className="py-8 text-right font-mono font-bold text-accent-cobalt">{d.fund_utilisation_pct}%</td>
                    <td className="py-8 text-right font-mono font-bold text-brand-ink">{d.avg_physical_progress_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Analytics Hub */}
        <div className="space-y-6">
           <h2 className="text-display text-3xl font-black uppercase tracking-tighter text-brand-ink">District Performance</h2>
           <div className="organic-panel p-8 md:p-12">
              <div className="h-[400px]">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top',
                        labels: { 
                          color: '#0a0a0a', 
                          font: { family: 'Plus Jakarta Sans', weight: '800', size: 10 },
                          usePointStyle: true,
                          padding: 20
                        } 
                      },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#0a0a0a', font: { family: 'Unbounded', size: 9 } } },
                      y: { grid: { color: '#0a0a0a10' }, border: { dash: [5, 5] }, ticks: { color: '#0a0a0a', font: { family: 'Plus Jakarta Sans', size: 10 } } },
                    },
                  }}
                />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
