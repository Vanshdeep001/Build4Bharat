import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOverview, fetchDistrictDashboard } from '../api';

const AnalyticalOverview = ({ selectedDistrict }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    fund: 0,
    beneficiaries: 0,
    anomalies: 0,
    grievances: 0,
    fundTrend: 'LIVE',
    beneficiariesAuth: 'LIVE',
    anomaliesSeverity: 'CRITICAL OPS',
    grievancesAvg: 'REAL-TIME'
  });

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadData = async () => {
      try {
        if (!selectedDistrict || selectedDistrict === 'Uttarakhand') {
          const res = await fetchOverview();
          if (!active) return;
          if (res && res.state_totals) {
            setMetrics(prev => ({
              ...prev,
              fund: res.state_totals.total_fund_utilised / 10000000, // converted to Cr if expected in large numbers
              beneficiaries: res.state_totals.total_farmers / 100000, // converted to Lakhs as 'M' fallback
              anomalies: res.state_totals.open_anomalies,
              grievances: res.state_totals.total_disputes,
              fundTrend: `${res.state_totals.fund_utilisation_pct}% UTIL`,
              beneficiariesAuth: `${res.state_totals.total_submissions} SCANS`,
              anomaliesSeverity: `${res.state_totals.open_anomalies} FLAGS`,
              grievancesAvg: `${res.state_totals.dispute_rate_pct}% DISPUTE`
            }));
          }
        } else {
          const districtId = selectedDistrict.toLowerCase().replace(/\s+/g, '_');
          const res = await fetchDistrictDashboard(districtId);
          if (!active) return;
          if (res && !res.error) {
            setMetrics(prev => ({
              ...prev,
              fund: res.total_fund_utilised / 10000000,
              beneficiaries: res.total_farmers / 100000,
              anomalies: res.open_anomalies,
              grievances: res.total_disputes,
              fundTrend: `${res.fund_utilisation_pct}% UTIL`,
              beneficiariesAuth: `${res.total_submissions} SCANS`,
              anomaliesSeverity: `${res.open_anomalies} FLAGS`,
              grievancesAvg: `${res.dispute_rate_pct}% DISPUTE`
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch analytical overview", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [selectedDistrict]);

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

        <button 
          onClick={() => navigate('/advance-analytics')}
          className="bg-[#00113a] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-3 hover:bg-primary transition-all shadow-lg shadow-primary/20 group"
        >
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
              {loading ? (
                <span className="text-3xl font-headline font-black text-on-surface opacity-50">...</span>
              ) : (
                <>
                  <span className="text-3xl font-headline font-black text-on-surface">₹{metrics.fund.toFixed(2)}</span>
                  <span className="text-sm font-bold text-on-surface-variant opacity-60">Cr</span>
                </>
              )}
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
              {loading ? (
                <span className="text-3xl font-headline font-black text-on-surface opacity-50">...</span>
              ) : (
                <>
                  <span className="text-3xl font-headline font-black text-on-surface">{(metrics.beneficiaries * 10).toFixed(2)}</span>
                  <span className="text-sm font-bold text-on-surface-variant opacity-60">Lakhs</span>
                </>
              )}
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
              {loading ? (
                 <span className="text-3xl font-headline font-black text-error opacity-50">...</span>
              ) : (
                 <span className="text-3xl font-headline font-black text-error">{metrics.anomalies}</span>
              )}
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
              {loading ? (
                <span className="text-3xl font-headline font-black text-on-surface opacity-50">...</span>
              ) : (
                <span className="text-3xl font-headline font-black text-on-surface">{metrics.grievances}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticalOverview;
