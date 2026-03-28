import React, { useState, useEffect } from 'react';

const AnalyticalOverview = ({ selectedDistrict }) => {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({
    fund: 0,
    beneficiaries: 0,
    anomalies: 0,
    grievances: 0,
    fundTrend: '+8.2%',
    beneficiariesAuth: '94% AUTH',
    anomaliesSeverity: '12 CRITICAL',
    grievancesAvg: '4.2D AVG'
  });

  useEffect(() => {
    // Simulate fetching and parsing CSV
    const csvData = `district,fund_utilization_cr,beneficiaries_m,ai_anomaly_flags,open_grievances
Almora,1200,0.08,45,120
Bageshwar,800,0.05,22,85
Chamoli,1100,0.07,38,110
Champawat,750,0.04,15,60
Dehradun,3500,0.25,150,450
Haridwar,3200,0.22,130,410
Nainital,1800,0.12,75,210
Pauri Garhwal,1400,0.10,55,150
Pithoragarh,1000,0.06,32,95
Rudraprayag,700,0.04,12,55
Tehri Garhwal,1500,0.11,65,180
Udham Singh Nagar,2800,0.18,95,320
Uttarkashi,950,0.06,28,80`;

    const lines = csvData.split('\n').slice(1);
    const parsed = lines.map(line => {
      const [district, fund, beneficiaries, anomalies, grievances] = line.split(',');
      return {
        district,
        fund: parseFloat(fund),
        beneficiaries: parseFloat(beneficiaries),
        anomalies: parseInt(anomalies),
        grievances: parseInt(grievances)
      };
    });
    setData(parsed);
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    let filtered = data;
    if (selectedDistrict && selectedDistrict !== 'Uttarakhand') {
      filtered = data.filter(d => d.district.toLowerCase() === selectedDistrict.toLowerCase());
    }

    const totals = filtered.reduce((acc, curr) => ({
      fund: acc.fund + curr.fund,
      beneficiaries: acc.beneficiaries + curr.beneficiaries,
      anomalies: acc.anomalies + curr.anomalies,
      grievances: acc.grievances + curr.grievances
    }), { fund: 0, beneficiaries: 0, anomalies: 0, grievances: 0 });

    setMetrics(prev => ({
      ...prev,
      fund: totals.fund,
      beneficiaries: totals.beneficiaries.toFixed(2),
      anomalies: totals.anomalies,
      grievances: totals.grievances
    }));
  }, [selectedDistrict, data]);

  return (
    <div className="mb-10 space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">
            Overwatch — <span className="text-primary">{selectedDistrict}</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
              Live Deployment State — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <button className="bg-[#00113a] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-3 hover:bg-primary transition-all shadow-lg shadow-primary/20 group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">insights</span>
          Advanced Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fund Utilization */}
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-8 relative">
            <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-black tracking-tight">
              {metrics.fundTrend}
            </div>
          </div>
          <div className="space-y-1 relative">
            <p className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em]">Fund Utilization</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-black text-on-surface">₹{metrics.fund.toLocaleString()}</span>
              <span className="text-sm font-bold text-on-surface-variant opacity-60">Cr</span>
            </div>
          </div>
        </div>

        {/* Verified Beneficiaries */}
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-8 relative">
            <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black tracking-tight">
              {metrics.beneficiariesAuth}
            </div>
          </div>
          <div className="space-y-1 relative">
            <p className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em]">Verified Beneficiaries</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-black text-on-surface">{metrics.beneficiaries}</span>
              <span className="text-sm font-bold text-on-surface-variant opacity-60">M</span>
            </div>
          </div>
        </div>

        {/* AI Anomaly Flags */}
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-8 relative">
            <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-error group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black tracking-tight">
              {metrics.anomaliesSeverity}
            </div>
          </div>
          <div className="space-y-1 relative">
            <p className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em]">AI Anomaly Flags</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-black text-error">{metrics.anomalies}</span>
            </div>
          </div>
        </div>

        {/* Open Grievances */}
        <div className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-8 relative">
            <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-2xl">forum</span>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-black tracking-tight">
              {metrics.grievancesAvg}
            </div>
          </div>
          <div className="space-y-1 relative">
            <p className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em]">Open Grievances</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-black text-on-surface">{metrics.grievances}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticalOverview;
