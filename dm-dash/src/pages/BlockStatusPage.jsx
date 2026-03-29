import React, { useState, useEffect } from 'react';
import { fetchBlocks, fetchAnomalies, freezeBlock, unfreezeBlock } from '../api';

export function BlockStatusPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState('All Districts');
  const [toastMsg, setToastMsg] = useState('');
  const [freezingBlock, setFreezingBlock] = useState(null); // block being frozen/unfrozen

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [blockData, anomalyData] = await Promise.all([
        fetchBlocks(),
        fetchAnomalies()
      ]);

      if (blockData) setBlocks(blockData);
      
      if (anomalyData) {
        const topActions = anomalyData
          .filter(a => a.severity === 'high')
          .slice(0, 4)
          .map(a => ({
            block: `${a.block_name || a.block_id}, ${a.district_name || a.district_id}`,
            description: a.description || a.explanation?.substring(0, 120) || 'Anomaly flagged by AI pipeline',
            actor: `AI Anomaly System • Score: ${a.anomaly_score || '—'}`,
            isError: true,
            score: a.anomaly_score
          }));
        setRecentActions(topActions);
      }
    } catch (err) {
      console.error('Failed to load block data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFreezeToggle = async (block) => {
    const isFrozen = block.frozen_status === 'frozen';
    const action = isFrozen ? 'unfreeze' : 'freeze';
    
    if (!confirm(`Are you sure you want to ${action} ${block.block_name} (${block.district_name})?\n\n${
      isFrozen 
        ? 'This will resume all fund disbursements and allow BDO to assign agents and farmers.' 
        : 'This will STOP all fund disbursements and PREVENT BDO from assigning new agents or farmers.'
    }`)) {
      return;
    }

    setFreezingBlock(block.block_id);
    
    const res = isFrozen 
      ? await unfreezeBlock(block.block_id)
      : await freezeBlock(block.block_id, `DM action: ${block.anomaly_count} anomalies detected in ${block.block_name}`);
    
    setFreezingBlock(null);
    
    if (res && res.success) {
      showToast(`✅ ${block.block_name} has been ${isFrozen ? 'UNFROZEN — operations resumed' : 'FROZEN — all operations suspended'}`);
      loadData(); // Reload
    } else {
      showToast(`❌ Failed to ${action} block. Try again.`);
    }
  };

  // Derive unique district names from data
  const districtNames = [...new Set(blocks.map(b => b.district_name))];

  // Filter blocks
  const filteredBlocks = filterDistrict === 'All Districts'
    ? blocks
    : blocks.filter(b => b.district_name === filterDistrict);

  // Summary KPIs
  const totalBlocks = blocks.length;
  const avgUtilization = blocks.length > 0
    ? (blocks.reduce((sum, b) => sum + (b.fund_utilisation_pct || 0), 0) / blocks.length).toFixed(1)
    : 0;
  const criticalFlags = blocks.filter(b => b.status === 'CRITICAL').length;
  const frozenBlocks = blocks.filter(b => b.frozen_status === 'frozen').length;
  const totalFarmers = blocks.reduce((sum, b) => sum + (b.farmer_count || 0), 0);

  const formatFarmers = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <main className="p-8 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-surface-container-highest text-on-surface font-bold px-6 py-4 rounded-xl shadow-2xl border border-outline-variant/20 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          {toastMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container bg-primary-fixed/30 px-3 py-1 rounded-full">
              Monitoring Matrix
            </span>
            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
              Block Status Dashboard
            </h2>
            <p className="text-on-surface-variant font-body text-sm max-w-md">
              Real-time surveillance of fund utilization and farmer welfare across
              administrative blocks. Freeze/Unfreeze operations directly from here.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm flex items-center gap-3 border border-outline-variant/10">
            <div className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
                location_on
              </span>
              <select 
                className="bg-transparent border-none text-xs font-semibold focus:ring-0 text-on-surface min-w-[140px]"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              >
                <option>All Districts</option>
                {districtNames.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
                calendar_today
              </span>
              <span className="text-xs font-semibold text-on-surface">FY 2025-26</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Total Blocks', value: loading ? '...' : totalBlocks.toString(), isError: false, icon: 'grid_view' },
            { label: 'Avg Utilization', value: loading ? '...' : `${avgUtilization}%`, isError: false, icon: 'account_balance' },
            { label: 'Critical Flags', value: loading ? '...' : criticalFlags.toString(), isError: criticalFlags > 0, icon: 'warning' },
            { label: 'Frozen Blocks', value: loading ? '...' : frozenBlocks.toString(), isError: frozenBlocks > 0, icon: 'ac_unit', isFrozen: true },
            { label: 'Total Farmers', value: loading ? '...' : formatFarmers(totalFarmers), isError: false, icon: 'groups' },
          ].map(({ label, value, isError, icon, isFrozen }) => (
            <div
              key={label}
              className={`bg-surface-container-lowest p-6 rounded-xl border ${isFrozen && frozenBlocks > 0 ? 'border-blue-500/30 bg-blue-500/5' : 'border-outline-variant/5'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-sm ${isError ? 'text-error' : isFrozen ? 'text-blue-500' : 'text-on-surface-variant/50'}`}>
                  {icon}
                </span>
                <p className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">
                  {label}
                </p>
              </div>
              <p
                className={[
                  'text-3xl font-headline font-black',
                  isError ? 'text-error' : isFrozen && frozenBlocks > 0 ? 'text-blue-500' : 'text-primary',
                ].join(' ')}
              >
                {value}
              </p>
              <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={[
                    'h-full',
                    isError ? 'bg-error w-[8%]' : isFrozen ? 'bg-blue-500 w-full' : 'bg-primary w-full',
                  ].join(' ')}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-primary">
              Block Performance Register
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Frozen</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> On Track</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high">
                  {[
                    'District',
                    'Block',
                    'Fund Util. %',
                    'Farmer Count',
                    'Anomaly Flags',
                    'Status',
                    'DM Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className={[
                        'px-6 py-4 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest',
                        h === 'Anomaly Flags' ? 'text-center' : '',
                        h === 'DM Action' ? 'text-center' : '',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-bold opacity-50 animate-pulse">
                      Loading block data from database...
                    </td>
                  </tr>
                ) : filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-bold opacity-50">
                      No blocks found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block) => {
                    const util = `${block.fund_utilisation_pct || 0}%`;
                    const status = block.status || 'ON TRACK';
                    const isFrozen = block.frozen_status === 'frozen';
                    const isBeingProcessed = freezingBlock === block.block_id;

                    return (
                      <tr
                        key={`${block.district_id}-${block.block_id}`}
                        className={`hover:bg-surface-container-low transition-colors group ${isFrozen ? 'bg-blue-500/5' : ''}`}
                      >
                        <td className="px-6 py-5 font-headline font-semibold text-sm text-primary">
                          {block.district_name}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-body text-sm text-on-surface-variant">{block.block_name}</span>
                            {isFrozen && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[10px]">ac_unit</span>
                                Frozen
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                'text-sm font-bold',
                                status === 'CRITICAL' ? 'text-error' : 'text-primary',
                              ].join(' ')}
                            >
                              {util}
                            </span>
                            <div className="w-16 h-1.5 bg-surface-container-highest rounded-full">
                              <div
                                className={[
                                  'h-full rounded-full',
                                  status === 'CRITICAL'
                                    ? 'bg-error'
                                    : status === 'WARNING'
                                      ? 'bg-on-secondary-container'
                                      : 'bg-primary',
                                ].join(' ')}
                                style={{ width: util }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-body text-sm text-on-surface">
                          {(block.farmer_count || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={[
                              'inline-block px-2 py-0.5 rounded text-[10px] font-bold',
                              status === 'CRITICAL'
                                ? 'bg-error-container text-on-error-container'
                                : status === 'WARNING'
                                  ? 'bg-tertiary-container/20 text-on-tertiary-fixed-variant'
                                  : 'bg-surface-container-highest text-on-surface-variant',
                            ].join(' ')}
                          >
                            {block.anomaly_count || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={[
                              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold',
                              isFrozen
                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                : status === 'CRITICAL'
                                  ? 'bg-error-container text-error'
                                  : status === 'WARNING'
                                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                    : 'bg-on-primary-container/10 text-on-primary-container',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'w-1.5 h-1.5 rounded-full',
                                isFrozen
                                  ? 'bg-blue-500'
                                  : status === 'CRITICAL'
                                    ? 'bg-error'
                                    : status === 'WARNING'
                                      ? 'bg-on-tertiary-fixed-variant'
                                      : 'bg-on-primary-container',
                              ].join(' ')}
                            ></span>
                            {isFrozen ? 'FROZEN' : status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleFreezeToggle(block)}
                            disabled={isBeingProcessed}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              isBeingProcessed
                                ? 'opacity-50 cursor-not-allowed bg-surface-container border-outline-variant/10'
                                : isFrozen
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 hover:shadow-md'
                                  : 'bg-error/10 text-error border-error/20 hover:bg-error/20 hover:shadow-md'
                            }`}
                          >
                            {isBeingProcessed ? (
                              <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px]">
                                {isFrozen ? 'play_circle' : 'block'}
                              </span>
                            )}
                            {isFrozen ? 'Unfreeze' : 'Freeze'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-surface-container-low flex justify-between items-center text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">
            <span>Showing {filteredBlocks.length} of {totalBlocks} Blocks</span>
            {frozenBlocks > 0 && (
              <span className="text-blue-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                {frozenBlocks} block(s) frozen by DM order
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg text-primary mb-6">
              Regional Drift Analysis
            </h4>
            <div className="aspect-video bg-surface-container-low rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="relative z-10 text-center px-8">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">
                  insights
                </span>
                <p className="text-sm font-bold text-primary">Inter-District Disparity Map</p>
                <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-widest">
                  Dehradun block shows highest anomaly density — 2 severe AI flags
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline font-bold text-lg text-primary">
                Recent AI Flags
              </h4>
              <span className="text-[10px] text-error font-black uppercase tracking-widest bg-error/10 px-2 py-1 rounded-full">
                {recentActions.length} Critical
              </span>
            </div>
            <div className="space-y-4">
              {recentActions.length === 0 && !loading ? (
                <p className="text-sm text-on-surface-variant opacity-60 text-center py-4">No critical actions recorded recently.</p>
              ) : (
                recentActions.map((action, idx) => (
                  <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${action.isError ? 'bg-error-container/10 border-error' : 'bg-surface-container-low border-outline-variant'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`material-symbols-outlined ${action.isError ? 'text-error' : 'text-on-surface-variant'} mt-1`}>
                        {action.isError ? 'error' : 'visibility'}
                      </span>
                      {action.score && (
                        <span className="text-[9px] font-black text-error bg-error/10 px-1.5 py-0.5 rounded">{action.score}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{action.block}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                        {action.description}
                      </p>
                      <p className={`text-[10px] ${action.isError ? 'text-error' : 'text-on-surface-variant'} font-bold mt-1 uppercase`}>
                        Flagged by: {action.actor}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
