import React, { useState, useEffect } from 'react';
import { fetchBlocks, fetchAnomalies, freezeBlock, unfreezeBlock } from '../api';

export function AdministrativeActionsPage() {
  const [blocks, setBlocks] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState([]);
  const [processingBlock, setProcessingBlock] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [blockRes, anomalyRes] = await Promise.all([
        fetchBlocks(),
        fetchAnomalies()
      ]);
      if (blockRes) setBlocks(blockRes);
      if (anomalyRes) setAnomalies(anomalyRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFreeze = async (block) => {
    const isFrozen = block.frozen_status === 'frozen';
    const action = isFrozen ? 'UNFREEZE' : 'FREEZE';

    if (!confirm(`⚠️ DM Administrative Action\n\n${action} "${block.block_name}" (${block.district_name})?\n\n${
      isFrozen
        ? '✅ This will RESUME all operations:\n• BDO can assign new field agents\n• BDO can assign farmers to agents\n• Fund disbursements will resume'
        : '🚫 This will STOP all operations:\n• BDO CANNOT assign new field agents\n• BDO CANNOT assign farmers\n• Fund disbursements will be HALTED\n• All pending assignments will be locked'
    }`)) return;

    setProcessingBlock(block.block_id);
    
    const reason = isFrozen ? '' : `DM Order: ${block.anomaly_count || 0} anomalies flagged in ${block.block_name}. Block frozen pending investigation.`;
    
    const res = isFrozen
      ? await unfreezeBlock(block.block_id)
      : await freezeBlock(block.block_id, reason);

    setProcessingBlock(null);

    if (res && res.success) {
      const logEntry = {
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action: isFrozen ? 'UNFROZEN' : 'FROZEN',
        block: `${block.block_name} (${block.district_name})`,
        actor: 'District Magistrate',
      };
      setActionLog(prev => [logEntry, ...prev]);
      showToast(`${isFrozen ? '✅' : '🔒'} ${block.block_name} has been ${isFrozen ? 'UNFROZEN — operations resumed' : 'FROZEN — all operations suspended'}`);
      await loadData();
    } else {
      showToast('❌ Action failed. Please try again.');
    }
  };

  const frozenBlocks = blocks.filter(b => b.frozen_status === 'frozen');
  const criticalBlocks = blocks.filter(b => b.status === 'CRITICAL');
  const warningBlocks = blocks.filter(b => b.status === 'WARNING');
  const activeBlocks = blocks.filter(b => b.frozen_status !== 'frozen');

  // Get anomalies for the selected block
  const blockAnomalies = selectedBlock
    ? anomalies.filter(a => a.block_id === selectedBlock.block_id)
    : [];

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-surface-container-highest text-on-surface font-bold px-6 py-4 rounded-xl shadow-2xl border border-outline-variant/20 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-xl">{toastMsg.startsWith('❌') ? '❌' : '✅'}</span>
          <span className="text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-end justify-between">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-error bg-error/10 px-3 py-1 rounded-full">
            Sovereign Authority
          </span>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">
            Administrative Actions
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
              Block Operations Control — Freeze/Unfreeze Fund Disbursements
            </p>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: blocks.length, icon: 'grid_view', color: 'primary' },
          { label: 'Frozen Blocks', value: frozenBlocks.length, icon: 'ac_unit', color: frozenBlocks.length > 0 ? 'blue-500' : 'primary' },
          { label: 'Critical Flags', value: criticalBlocks.length, icon: 'error', color: criticalBlocks.length > 0 ? 'error' : 'primary' },
          { label: 'Active Alerts', value: anomalies.filter(a => a.status === 'open').length, icon: 'warning', color: 'amber-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-sm text-${color}`}>{icon}</span>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</p>
            </div>
            <p className={`text-3xl font-headline font-black text-${color}`}>
              {loading ? '...' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Frozen Blocks Alert */}
      {frozenBlocks.length > 0 && (
        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-blue-500 text-2xl">ac_unit</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-blue-600 uppercase tracking-wider">Active Freezes</h3>
              <p className="text-sm text-blue-600/80 mt-1">
                {frozenBlocks.length} block(s) currently frozen. BDOs in these blocks <strong>cannot assign new agents or farmers</strong>.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {frozenBlocks.map(b => (
                  <span key={b.block_id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full text-xs font-black">
                    <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                    {b.block_name} ({b.district_name})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Block Action List */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg text-on-surface">Block Operations Control</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Frozen</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                <p className="text-sm text-on-surface-variant font-bold mt-3 uppercase tracking-widest">Loading block data...</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {blocks.map(block => {
                  const isFrozen = block.frozen_status === 'frozen';
                  const isCritical = block.status === 'CRITICAL';
                  const isProcessing = processingBlock === block.block_id;
                  const isSelected = selectedBlock?.block_id === block.block_id;

                  return (
                    <div
                      key={`${block.district_id}-${block.block_id}`}
                      className={`p-5 flex items-center gap-5 transition-all cursor-pointer hover:bg-surface-container-low/50 ${
                        isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                      } ${isFrozen ? 'bg-blue-500/5' : ''}`}
                      onClick={() => setSelectedBlock(block)}
                    >
                      {/* Status Indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isFrozen ? 'bg-blue-500/20' : isCritical ? 'bg-error/10' : 'bg-green-500/10'
                      }`}>
                        <span className={`material-symbols-outlined text-xl ${
                          isFrozen ? 'text-blue-500' : isCritical ? 'text-error' : 'text-green-500'
                        }`}>
                          {isFrozen ? 'ac_unit' : isCritical ? 'warning' : 'check_circle'}
                        </span>
                      </div>

                      {/* Block Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-on-surface text-sm">{block.block_name}</h4>
                          {isFrozen && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded">
                              FROZEN
                            </span>
                          )}
                          {isCritical && !isFrozen && (
                            <span className="px-2 py-0.5 bg-error text-white text-[8px] font-black uppercase tracking-widest rounded">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant/60 font-bold">
                          {block.district_name} • {block.anomaly_count || 0} anomalies • {(block.farmer_count || 0).toLocaleString()} farmers
                        </p>
                        {isFrozen && block.frozen_reason && (
                          <p className="text-[10px] text-blue-500/70 mt-1 truncate">{block.frozen_reason}</p>
                        )}
                      </div>

                      {/* Fund Utilization Bar */}
                      <div className="w-24 flex-shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-on-surface-variant/40 uppercase">Fund</span>
                          <span className={`text-xs font-black ${
                            isCritical ? 'text-error' : 'text-on-surface'
                          }`}>{block.fund_utilisation_pct || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFrozen ? 'bg-blue-500' : isCritical ? 'bg-error' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(block.fund_utilisation_pct || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFreeze(block);
                        }}
                        disabled={isProcessing}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                          isProcessing
                            ? 'opacity-50 cursor-not-allowed bg-surface-container border-outline-variant/10'
                            : isFrozen
                              ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 hover:shadow-lg'
                              : 'bg-error/10 text-error border-error/20 hover:bg-error/20 hover:shadow-lg hover:shadow-error/10'
                        }`}
                      >
                        {isProcessing ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">
                            {isFrozen ? 'play_circle' : 'block'}
                          </span>
                        )}
                        {isFrozen ? 'Unfreeze' : 'Freeze Funds'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar — Block Detail + Action Log */}
        <div className="space-y-6">
          {/* Selected Block Detail */}
          {selectedBlock ? (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedBlock.frozen_status === 'frozen' ? 'bg-blue-500/20' : 'bg-primary/10'
                }`}>
                  <span className={`material-symbols-outlined ${
                    selectedBlock.frozen_status === 'frozen' ? 'text-blue-500' : 'text-primary'
                  }`}>
                    {selectedBlock.frozen_status === 'frozen' ? 'ac_unit' : 'location_city'}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-on-surface">{selectedBlock.block_name}</h3>
                  <p className="text-xs text-on-surface-variant/60 font-bold">{selectedBlock.district_name}</p>
                </div>
              </div>

              <div className="space-y-3 border-y border-outline-variant/10 py-4 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/50 font-bold">Status</span>
                  <span className={`font-black px-2 py-0.5 rounded ${
                    selectedBlock.frozen_status === 'frozen'
                      ? 'bg-blue-500/10 text-blue-500'
                      : selectedBlock.status === 'CRITICAL'
                        ? 'bg-error/10 text-error'
                        : 'bg-green-500/10 text-green-500'
                  }`}>
                    {selectedBlock.frozen_status === 'frozen' ? 'FROZEN' : selectedBlock.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/50 font-bold">Fund Utilization</span>
                  <span className="font-black text-on-surface">{selectedBlock.fund_utilisation_pct || 0}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/50 font-bold">Farmers</span>
                  <span className="font-black text-on-surface">{(selectedBlock.farmer_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/50 font-bold">Anomaly Count</span>
                  <span className={`font-black ${
                    (selectedBlock.anomaly_count || 0) >= 2 ? 'text-error' : 'text-on-surface'
                  }`}>{selectedBlock.anomaly_count || 0}</span>
                </div>
              </div>

              {/* Block Anomalies */}
              {blockAnomalies.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">
                    AI Anomaly Flags ({blockAnomalies.length})
                  </h4>
                  <div className="space-y-2">
                    {blockAnomalies.map((a, idx) => (
                      <div key={idx} className="p-3 bg-error/5 border border-error/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            a.severity === 'high' ? 'bg-error text-white' : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {a.anomaly_score || '—'}
                          </span>
                          <span className="text-[10px] font-black text-error uppercase tracking-widest">
                            {(a.anomaly_type || '').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">
                          {a.description || a.explanation?.substring(0, 100)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Freeze Impact */}
              {selectedBlock.frozen_status === 'frozen' && (
                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <h4 className="text-xs font-black text-blue-600 mb-2">Active Restrictions</h4>
                  <ul className="space-y-1.5 text-xs text-blue-600/80">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[12px]">block</span>
                      BDO cannot assign new field agents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[12px]">block</span>
                      BDO cannot assign farmers to agents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[12px]">block</span>
                      Fund disbursements are halted
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      Pending assignments are locked
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">touch_app</span>
              <p className="text-sm text-on-surface-variant/50 font-bold mt-3">
                Select a block to view details and anomalies
              </p>
            </div>
          )}

          {/* Action Log */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">
              Session Action Log
            </h3>
            {actionLog.length === 0 ? (
              <p className="text-xs text-on-surface-variant/40 italic text-center py-4">
                No actions taken in this session yet.
              </p>
            ) : (
              <div className="space-y-3">
                {actionLog.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      entry.action === 'FROZEN' ? 'bg-error/10' : 'bg-green-500/10'
                    }`}>
                      <span className={`material-symbols-outlined text-[12px] ${
                        entry.action === 'FROZEN' ? 'text-error' : 'text-green-500'
                      }`}>
                        {entry.action === 'FROZEN' ? 'lock' : 'lock_open'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-on-surface truncate">
                        {entry.block} — {entry.action}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/50 font-bold">
                        {entry.time} • {entry.actor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
