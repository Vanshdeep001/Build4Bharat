import React, { useState } from 'react';

// Enhanced dummy data for districts
const districtData = {
  "Dehradun": {
    score: 88, status: "On-Track", color: "text-green-500", bg: "bg-green-500/10",
    allocated: 450, utilized: 410, utilizationRate: 91.1, beneficiaries: 125000,
    anomalies: 35, grievancesResolved: 94.5, activeBlocks: 6, totalBlocks: 6,
    topCrops: ["Wheat", "Sugarcane", "Maize"]
  },
  "Haridwar": {
    score: 76, status: "At Risk", color: "text-amber-500", bg: "bg-amber-500/10",
    allocated: 380, utilized: 290, utilizationRate: 76.3, beneficiaries: 145000,
    anomalies: 82, grievancesResolved: 82.1, activeBlocks: 5, totalBlocks: 6,
    topCrops: ["Wheat", "Sugarcane", "Rice"]
  },
  "Nainital": {
    score: 92, status: "On-Track", color: "text-green-500", bg: "bg-green-500/10",
    allocated: 320, utilized: 295, utilizationRate: 92.1, beneficiaries: 85000,
    anomalies: 12, grievancesResolved: 97.2, activeBlocks: 8, totalBlocks: 8,
    topCrops: ["Apples", "Wheat", "Soyabean"]
  },
  "Udham Singh Nagar": {
    score: 85, status: "On-Track", color: "text-green-500", bg: "bg-green-500/10",
    allocated: 520, utilized: 468, utilizationRate: 90.0, beneficiaries: 180000,
    anomalies: 45, grievancesResolved: 91.0, activeBlocks: 7, totalBlocks: 7,
    topCrops: ["Rice", "Wheat", "Sugarcane"]
  },
  "Pauri Garhwal": {
    score: 64, status: "At Risk", color: "text-amber-500", bg: "bg-amber-500/10",
    allocated: 210, utilized: 145, utilizationRate: 69.0, beneficiaries: 65000,
    anomalies: 110, grievancesResolved: 78.4, activeBlocks: 11, totalBlocks: 15,
    topCrops: ["Wheat", "Millet", "Mustard"]
  },
  "Almora": {
    score: 45, status: "Critical", color: "text-error", bg: "bg-error/10",
    allocated: 180, utilized: 80, utilizationRate: 44.4, beneficiaries: 50000,
    anomalies: 140, grievancesResolved: 62.0, activeBlocks: 6, totalBlocks: 11,
    topCrops: ["Wheat", "Soyabean", "Vegetables"]
  }
};

const districts = Object.keys(districtData);

const ComparisonCard = ({ title, value1, value2, formatter = (v) => v, reverseGood = false }) => {
  const v1 = parseFloat(value1) || 0;
  const v2 = parseFloat(value2) || 0;
  
  let color1 = "text-on-surface";
  let color2 = "text-on-surface";
  
  if (v1 !== v2) {
    if ((v1 > v2 && !reverseGood) || (v1 < v2 && reverseGood)) {
      color1 = "text-green-500";
      color2 = "text-on-surface-variant/60";
    } else {
      color1 = "text-on-surface-variant/60";
      color2 = "text-green-500";
    }
  }

  const display1 = formatter(value1);
  const display2 = formatter(value2);

  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-outline-variant/10 items-center group hover:bg-surface-container-low transition-colors px-4 rounded-xl">
      <div className={`text-center font-black ${color1} text-base sm:text-xl transition-all group-hover:scale-105`}>
        {display1}
      </div>
      <div className="text-center">
        <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">{title}</span>
      </div>
      <div className={`text-center font-black ${color2} text-base sm:text-xl transition-all group-hover:scale-105`}>
        {display2}
      </div>
    </div>
  );
};

export default function DistrictComparison() {
  const [dist1, setDist1] = useState("Dehradun");
  const [dist2, setDist2] = useState("Haridwar");

  const data1 = districtData[dist1];
  const data2 = districtData[dist2];

  return (
    <div className="p-0 space-y-8 animate-in fade-in duration-700 mt-10">
      {/* Header Section */}
      <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">compare_arrows</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight leading-none mb-1">
                District Comparison
              </h2>
              <p className="text-sm font-medium text-on-surface-variant">
                Side-by-side district macro analytics evaluation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Area */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm">
        
        {/* District Selectors Header */}
        <div className="grid grid-cols-2 divide-x divide-outline-variant/10 border-b border-outline-variant/10 bg-surface-container/30">
          <div className="p-6 sm:p-8 flex flex-col items-center gap-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">District Alpha</span>
            <select
              value={dist1}
              onChange={(e) => setDist1(e.target.value)}
              className="w-full max-w-[250px] bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer shadow-sm hover:border-primary/50 transition-colors"
            >
              {districts.map(s => (
                <option key={`d1-${s}`} value={s} disabled={s === dist2}>{s}</option>
              ))}
            </select>
          </div>
          
          <div className="p-6 sm:p-8 flex flex-col items-center gap-4">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">District Beta</span>
            <select
              value={dist2}
              onChange={(e) => setDist2(e.target.value)}
              className="w-full max-w-[250px] bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer shadow-sm hover:border-indigo-500/50 transition-colors"
            >
              {districts.map(s => (
                <option key={`d2-${s}`} value={s} disabled={s === dist1}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Level Score Cards */}
        <div className="grid grid-cols-2 divide-x divide-outline-variant/10 border-b border-outline-variant/10">
          <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-transparent to-surface-container-high/20">
            <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 ${data1.bg} ${data1.color}`}>
              {data1.status}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-7xl font-headline font-black ${data1.score > data2.score ? 'text-primary' : 'text-on-surface'}`}>{data1.score}</span>
              <span className="text-xl font-bold text-on-surface-variant/40">/100</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-2">District Performance Score</span>
          </div>

          <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-transparent to-surface-container-high/20">
             <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 ${data2.bg} ${data2.color}`}>
              {data2.status}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-7xl font-headline font-black ${data2.score > data1.score ? 'text-primary' : 'text-on-surface'}`}>{data2.score}</span>
              <span className="text-xl font-bold text-on-surface-variant/40">/100</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-2">District Performance Score</span>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="p-4 sm:p-8 space-y-2">
          
          <h3 className="text-sm font-bold text-on-surface mb-6 pl-4 border-l-4 border-primary mt-2">Financial KPIs</h3>
          
          <ComparisonCard 
            title="Total Funds Allocated (Cr)" 
            value1={data1.allocated} 
            value2={data2.allocated} 
            formatter={(v) => `₹${v.toLocaleString()}`} 
          />
          <ComparisonCard 
            title="Funds Utilized (Cr)" 
            value1={data1.utilized} 
            value2={data2.utilized} 
            formatter={(v) => `₹${v.toLocaleString()}`} 
          />
          <ComparisonCard 
            title="Fund Utilization Rate" 
            value1={data1.utilizationRate} 
            value2={data2.utilizationRate} 
            formatter={(v) => `${v}%`} 
          />

          <h3 className="text-sm font-bold text-on-surface mb-6 pl-4 border-l-4 border-amber-500 mt-10">Citizen & Intelligence Metrics</h3>

          <ComparisonCard 
            title="Active Beneficiaries" 
            value1={data1.beneficiaries} 
            value2={data2.beneficiaries} 
            formatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(1)}K`} 
          />
          <ComparisonCard 
            title="Reported Anomalies" 
            value1={data1.anomalies} 
            value2={data2.anomalies} 
            reverseGood={true}
            formatter={(v) => v.toLocaleString()} 
          />
          <ComparisonCard 
            title="Grievance Resolution Rate" 
            value1={data1.grievancesResolved} 
            value2={data2.grievancesResolved} 
            formatter={(v) => `${v}%`} 
          />

          <h3 className="text-sm font-bold text-on-surface mb-6 pl-4 border-l-4 border-error mt-10">Block-Level Risk Coverage</h3>

          <ComparisonCard 
            title="Total Blocks" 
            value1={data1.totalBlocks} 
            value2={data2.totalBlocks} 
          />
          <ComparisonCard 
            title="Blocks with Suspicious Activity" 
            value1={data1.totalBlocks - data1.activeBlocks} 
            value2={data2.totalBlocks - data2.activeBlocks} 
            reverseGood={true}
          />

          {/* Special formatting for text arrays */}
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-outline-variant/10 items-start px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {data1.topCrops.map(c => (
                <span key={`1-${c}`} className="text-[10px] font-bold bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{c}</span>
              ))}
            </div>
            <div className="text-center pt-1">
              <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">Major Output Crops</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {data2.topCrops.map(c => (
                <span key={`2-${c}`} className="text-[10px] font-bold bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{c}</span>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
