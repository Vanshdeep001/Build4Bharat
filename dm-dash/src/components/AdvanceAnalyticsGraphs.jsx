import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { fetchAdvanceAnalytics } from '../api';

// --- Reusable Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/20 p-3 rounded-xl shadow-xl flex flex-col gap-1">
        {label && <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-sm font-bold text-on-surface">
              {entry.name}: <span className="text-primary">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Sub-components ---

const FundUtilizationChart = ({ chartData }) => {
  const data = chartData ? [
    { name: 'Utilized', value: chartData.utilized, color: '#3b82f6' }, // blue-500
    { name: 'Idle', value: chartData.idle, color: '#f59e0b' },         // amber-500
    { name: 'Pending Allocation', value: chartData.pending, color: '#94a3b8' } // slate-400
  ] : [];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-on-surface ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnomalyBarChart = ({ chartData }) => {
  const data = chartData || [];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.4 }} />
          <Legend 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-on-surface ml-1 capitalize">{value} Delivery</span>}
          />
          <Bar dataKey="officer" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Officer Reported" />
          <Bar dataKey="farmer" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Farmer Confirmed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const BeneficiaryScatter = ({ chartData }) => {
  const data = chartData || [];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis type="number" dataKey="x" name="Funds (L)" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="number" dataKey="y" name="Beneficiaries" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Scatter name="Blocks" data={data.filter(d => !d.outlier)} fill="#3b82f6" opacity={0.6} />
          <Scatter name="Suspicious Outliers" data={data.filter(d => d.outlier)} fill="#ef4444" opacity={0.9} />
          <Legend iconType="circle" formatter={(value) => <span className="text-xs font-bold text-on-surface ml-1">{value}</span>} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const GrievanceDonut = ({ chartData }) => {
  const data = chartData || [];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom Legend to side optionally, but Recharts Legend is fine. Using custom for better layout */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span className="text-[10px] font-bold text-on-surface">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const KPIPredictions = ({ chartData }) => {
  const kpis = chartData || [];

  return (
    <div className="flex flex-col gap-4 w-full max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
      {kpis.map((kpi, index) => (
        <div key={index} className="space-y-1 group">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{kpi.name}</span>
            <span className="text-[10px] font-black text-primary">{kpi.progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full ${kpi.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${kpi.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};


// --- Main Component ---

const AdvanceAnalyticsGraphs = ({ selectedDistrict }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    fetchAdvanceAnalytics().then(res => {
      if (active && res) setData(res);
    }).catch(console.error);

    return () => { active = false; };
  }, []);

  if (!data) return <div className="p-8 text-center text-on-surface-variant font-bold opacity-50 animate-pulse">Loading Advanced Intelligence...</div>;

  // Filter verification/scatter data if a district is selected
  let currentVerification = data.verification_gap || [];
  let currentScatter = data.beneficiary_scatter || [];
  
  if (selectedDistrict && selectedDistrict !== 'Uttarakhand') {
    currentScatter = currentScatter.filter(d => d.district === selectedDistrict);
  }

  return (
    <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm mt-10">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-black text-on-surface tracking-tight">
              Micro-Analytical Graphs
            </h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              {selectedDistrict && selectedDistrict !== 'Uttarakhand' ? `Data Context: ${selectedDistrict} Highlights` : 'Statewide Aggregation'}
            </p>
          </div>
        </div>
        <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-lg transition-all ring-1 ring-primary/20 flex items-center gap-2">
          <span>Export Dataset</span>
          <span className="material-symbols-outlined text-sm">download</span>
        </button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Card 1: Fund & Utilization */}
          <div className="bg-surface border border-outline-variant/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
              <h4 className="font-headline font-bold text-on-surface">Fund & Utilization</h4>
            </div>
            <FundUtilizationChart chartData={data.fund_utilization} />
          </div>

          {/* Card 2: Grievance Breakdown */}
          <div className="bg-surface border border-outline-variant/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-xl">report</span>
              <h4 className="font-headline font-bold text-on-surface">Grievance Categories</h4>
            </div>
            <GrievanceDonut chartData={data.grievance_categories} />
          </div>

          {/* Card 3: Beneficiary Coverage */}
          <div className="bg-surface border border-outline-variant/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-xl">groups</span>
                <h4 className="font-headline font-bold text-on-surface">Coverage vs Utilization</h4>
              </div>
              <span className="text-[8px] font-black bg-error/10 text-error px-2 py-0.5 rounded-full uppercase tracking-widest">Outlier Detection</span>
            </div>
            <BeneficiaryScatter chartData={currentScatter} />
          </div>

          {/* Card 4: Anomaly Intelligence (Spans 2 cols on XL) */}
          <div className="bg-surface border border-outline-variant/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow xl:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-xl">verified</span>
                <h4 className="font-headline font-bold text-on-surface">Anomaly Intelligence: Verification Gap</h4>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 text-right">Officer vs Farmer</p>
            </div>
            <AnomalyBarChart chartData={currentVerification} />
          </div>

          {/* Card 5: KPI Predictions */}
          <div className="bg-surface border border-outline-variant/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-teal-500 text-xl">speed</span>
              <h4 className="font-headline font-bold text-on-surface">KPI Predictions</h4>
            </div>
            <KPIPredictions chartData={data.kpi_progress} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdvanceAnalyticsGraphs;
