import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBDOAgents, assignBDOAgent, assignFarmerToAgent, reassignFarmer, fetchBlockFrozenStatus } from '../../api';
import { io } from 'socket.io-client';

const ACTIVITY_LABELS = {
  seed_distribution: 'Seed Distribution',
  irrigation_work: 'Irrigation Work',
  kcc_loan_camp: 'KCC Loan Camp',
  soil_health_card: 'Soil Health Card',
  storage_facility: 'Storage Facility',
  training: 'Training',
  canal_inspection: 'Canal Inspection',
};

function FarmerCard({ farmer, isCompleted, onReassign }) {
  const [showPopover, setShowPopover] = useState(false);
  const cardRef = useRef(null);
  const popoverRef = useRef(null);
  const sub = farmer.submission;
  const isDisputed = sub?.beneficiary_confirmed === 'no';

  // Position popover so it doesn't overflow the viewport
  useEffect(() => {
    if (showPopover && cardRef.current && popoverRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const popover = popoverRef.current;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Reset position
      popover.style.top = '';
      popover.style.bottom = '';
      popover.style.left = '';
      popover.style.right = '';

      // Vertical: show below if space, else above
      if (cardRect.bottom + 320 > vh) {
        popover.style.bottom = '100%';
        popover.style.marginBottom = '8px';
      } else {
        popover.style.top = '100%';
        popover.style.marginTop = '8px';
      }

      // Horizontal: keep within viewport
      if (cardRect.left + 340 > vw) {
        popover.style.right = '0';
      } else {
        popover.style.left = '0';
      }
    }
  }, [showPopover]);

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <div className={`flex items-center gap-3 px-3 py-2.5 bg-surface-container-lowest rounded-xl border transition-all cursor-pointer ${
        showPopover ? (isDisputed ? 'border-error/40 shadow-lg shadow-error/10 scale-[1.02]' : 'border-primary/40 shadow-lg shadow-primary/10 scale-[1.02]') : (isDisputed ? 'border-error/30 hover:border-error/50' : 'border-outline-variant/5 hover:border-primary/20')
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${
          isDisputed ? 'bg-error text-white shadow-lg shadow-error/20' : (isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500')
        }`}>
          {farmer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-on-surface truncate">{farmer.name}</p>
          <p className="text-[10px] text-on-surface-variant/40 font-bold">
            {isDisputed ? <span className="text-error font-black">⚠ DISPUTED</span> : (farmer.village || (isCompleted ? '✓ Verified' : '⏳ Awaiting'))}
          </p>
        </div>
        {sub && (
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant/30">info</span>
        )}
      </div>

      {/* Hover Popover Card */}
      {showPopover && sub && (
        <div
          ref={popoverRef}
          className={`absolute z-50 w-[340px] bg-surface rounded-2xl border ${isDisputed ? 'border-error/30 shadow-error/10' : 'border-outline-variant/20 shadow-black/20'} shadow-2xl overflow-hidden`}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className={`px-4 py-3 ${isDisputed ? 'bg-error/10 border-error/20' : (isCompleted ? 'bg-green-500/10' : 'bg-amber-500/10')} border-b border-outline-variant/10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isDisputed ? 'bg-error text-white' : (isCompleted ? 'bg-green-500 text-white' : 'bg-amber-500 text-white')
                }`}>
                  {farmer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-black text-on-surface">{farmer.name}</p>
                  <p className="text-[10px] text-on-surface-variant/60 font-bold">{farmer.village}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isDisputed ? 'bg-error text-white shadow-lg shadow-error/20' : (isCompleted ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600')
              }`}>
                {isDisputed ? '⚠ DISPUTED' : (isCompleted ? '✓ COMPLETED' : '⏳ PENDING')}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="px-4 py-3 space-y-3">
            {/* Activity Type */}
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">category</span>
              <div>
                <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">Activity Type</p>
                <p className="text-xs font-bold text-on-surface">{ACTIVITY_LABELS[sub.activity_type] || sub.activity_type || '—'}</p>
              </div>
            </div>

            {/* Description */}
            {sub.work_description && sub.work_description !== 'None' && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">description</span>
                <div>
                  <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">Field Report</p>
                  <p className="text-xs text-on-surface leading-relaxed">{sub.work_description}</p>
                </div>
              </div>
            )}

            {/* Location Coordinates */}
            {(sub.project_gps || sub.photo_gps) && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">location_on</span>
                <div>
                  <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">GPS Coordinates</p>
                  {sub.project_gps && (
                    <p className="text-xs font-mono text-on-surface">
                      📍 {sub.project_gps.lat?.toFixed(6)}, {sub.project_gps.lng?.toFixed(6)}
                    </p>
                  )}
                  {sub.photo_gps && (
                    <p className="text-xs font-mono text-on-surface-variant/60">
                      📸 {sub.photo_gps.lat?.toFixed(6)}, {sub.photo_gps.lng?.toFixed(6)}
                    </p>
                  )}
                  {sub.location_match !== null && sub.location_match !== undefined && (
                    <p className={`text-[10px] font-bold mt-0.5 ${sub.location_match ? 'text-green-500' : 'text-error'}`}>
                      {sub.location_match ? '✓ Location verified' : '⚠ Location mismatch'}
                      {sub.location_distance_km != null && ` (${sub.location_distance_km.toFixed(2)} km)`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Completion */}
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check_circle</span>
              <div>
                <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">Completion</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-outline-variant/10 rounded-full overflow-hidden w-24">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${Math.min(sub.completion_percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-on-surface">{sub.completion_percentage || 0}%</span>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            {sub.created_at && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">schedule</span>
                <div>
                  <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">Submitted At</p>
                  <p className="text-xs font-bold text-on-surface">{sub.created_at}</p>
                </div>
              </div>
            )}

            {/* Disputed Alert */}
            {isDisputed && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl mb-2 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">warning</span>
                <div>
                  <p className="text-xs font-black text-error">Beneficiary Denied Receipt</p>
                  <p className="text-[10px] text-error/80 mt-0.5 leading-snug">
                    Farmer confirmed scanning QR code but explicitly selected 'No' when asked if they received benefits.
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {sub.notes && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">note</span>
                <div>
                  <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-wider">Notes</p>
                  <p className="text-xs text-on-surface">{sub.notes}</p>
                </div>
              </div>
            )}
            
            {/* Reassign Button */}
            {isDisputed && (
              <div className="pt-2">
                <button 
                  onClick={() => onReassign(farmer)}
                  className="w-full bg-error text-white font-black text-xs py-2 rounded-lg hover:bg-error/90 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-error/20"
                >
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  Reassign Field Agent
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-surface-container/30 border-t border-outline-variant/10 flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant/40 font-mono">{farmer.id?.slice(-8)}</span>
            {sub.photo_url && (
              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                Photo attached
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pending farmer without submission - simple popover */}
      {showPopover && !sub && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-[240px] bg-surface rounded-xl border border-outline-variant/20 shadow-xl shadow-black/10 overflow-hidden"
          style={{ top: '100%', marginTop: '8px', pointerEvents: 'none' }}
        >
          <div className="px-4 py-3 bg-amber-500/5 border-b border-outline-variant/10">
            <p className="text-sm font-black text-on-surface">{farmer.name}</p>
            <p className="text-[10px] text-on-surface-variant/50 font-bold">{farmer.village}</p>
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="text-xs text-on-surface-variant/60 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-amber-500">pending</span>
              No field visit submitted yet
            </p>
            <p className="text-[10px] text-on-surface-variant/40">Awaiting agent visit and report</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BDOAgentsPage() {
  const { selectedBlock } = useOutletContext();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'completionRate', direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', phone: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [selectedAgentForFarmer, setSelectedAgentForFarmer] = useState(null);
  const [newFarmer, setNewFarmer] = useState({ name: '', phone: '', village: '' });
  const [isSubmittingFarmer, setIsSubmittingFarmer] = useState(false);

  const [expandedRow, setExpandedRow] = useState(null);
  
  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignFarmerData, setReassignFarmerData] = useState(null);
  const [selectedNewAgentId, setSelectedNewAgentId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Frozen status
  const [blockFrozen, setBlockFrozen] = useState(false);
  const [frozenReason, setFrozenReason] = useState('');

  const handleExportCSV = () => {
    // Escape quotes in strings
    const escapeCSV = (str) => {
      if (!str) return '""';
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const headers = [
      'Agent Name', 
      'Phone Number', 
      'Village Region', 
      'Status', 
      'Total Farmers Assigned', 
      'Total Farmers Completed', 
      'Completion Rate (%)',
      'Assigned Farmers (Names)', 
      'Completed Farmers (Names)'
    ];
    
    const rows = sortedAgents.map(agent => {
      const assignedNames = agent.pendingFarmers ? agent.pendingFarmers.map(f => f.name).join('; ') : '';
      const completedNames = agent.completedFarmers ? agent.completedFarmers.map(f => f.name).join('; ') : '';
      
      return [
        escapeCSV(agent.name),
        escapeCSV(agent.phone),
        escapeCSV(agent.village),
        escapeCSV(agent.status),
        agent.assigned,
        agent.completed,
        agent.completionRate.toFixed(1),
        escapeCSV(assignedNames),
        escapeCSV(completedNames)
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PMDDKY_Agents_${selectedBlock}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadAgents = () => {
    setLoading(true);
    fetchBDOAgents(selectedBlock).then(res => {
      setAgents(res || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadAgents();
      // Check frozen status
      fetchBlockFrozenStatus(selectedBlock).then(res => {
        if (res) {
          setBlockFrozen(res.frozen || false);
          setFrozenReason(res.reason || '');
        }
      });
    }
    return () => mounted = false;
  }, [selectedBlock]);

  useEffect(() => {
    const socket = io('http://localhost:8000');
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        socket.emit('join_district', { district_id: user.district_id || 'dehradun' });
      } catch(e) {}
    }

    socket.on('new_visit_completed', (payload) => {
      if (payload.block_id === selectedBlock) {
        fetchBDOAgents(selectedBlock).then(res => {
          setAgents(res || []);
        });
      }
    });

    return () => socket.disconnect();
  }, [selectedBlock]);

  const toggleExpanded = (agentId, type) => {
    if (expandedRow?.agentId === agentId && expandedRow?.type === type) {
      setExpandedRow(null);
    } else {
      setExpandedRow({ agentId, type });
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await assignBDOAgent({ ...newAgent, block_id: selectedBlock, district_id: 'dehradun' });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewAgent({ name: '', phone: '', password: '' });
    loadAgents();
  };

  const handleAddFarmer = async (e) => {
    e.preventDefault();
    if (!selectedAgentForFarmer) return;
    setIsSubmittingFarmer(true);
    const res = await assignFarmerToAgent(selectedAgentForFarmer.id, newFarmer);
    setIsSubmittingFarmer(false);
    if (res) {
      setIsFarmerModalOpen(false);
      setNewFarmer({ name: '', phone: '', village: '' });
      loadAgents(); // Reload dashboard
    } else {
      alert('Failed to add farmer');
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignFarmerData || !selectedNewAgentId) return;
    setIsReassigning(true);
    const res = await reassignFarmer(reassignFarmerData.id, selectedNewAgentId);
    setIsReassigning(false);
    if (res) {
      setReassignModalOpen(false);
      setReassignFarmerData(null);
      setSelectedNewAgentId('');
      loadAgents();
    } else {
      alert('Failed to reassign farmer');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedAgents = [...agents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <div className="text-white flex items-center justify-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-[#758dd5]">sync</span></div>;

  return (
    <div className="space-y-6">
      {/* Frozen Block Warning Banner */}
      {blockFrozen && (
        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-blue-500 text-2xl">ac_unit</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-blue-600 uppercase tracking-wider">Block Operations Frozen</h3>
            <p className="text-sm text-blue-600/80 mt-1 leading-relaxed">
              The District Magistrate has frozen all operations for this block. You <strong>cannot assign new field agents or farmers</strong> until the block is unfrozen.
            </p>
            {frozenReason && (
              <p className="text-xs text-blue-500/60 mt-2 bg-blue-500/10 px-3 py-2 rounded-lg">
                <span className="font-black uppercase tracking-widest">Reason:</span> {frozenReason}
              </p>
            )}
          </div>
          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0">
            DM ORDER
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Field Agent Monitoring</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${blockFrozen ? 'bg-blue-500' : 'bg-primary'} animate-pulse`}></span>
            <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
              {blockFrozen ? `⛔ FROZEN — ${selectedBlock}` : `Performance and active assignments for ${selectedBlock}`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => !blockFrozen && setIsModalOpen(true)}
            disabled={blockFrozen}
            className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wider flex items-center gap-2 transition-all group ${
              blockFrozen 
                ? 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10' 
                : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
            }`}
            title={blockFrozen ? 'Block is frozen by DM — assignments disabled' : 'Assign a new field agent'}
          >
            <span className="material-symbols-outlined text-sm">{blockFrozen ? 'block' : 'person_add'}</span>
            {blockFrozen ? 'Assignments Disabled' : 'Assign New Agent'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold text-sm tracking-wider flex items-center gap-2 border border-outline-variant/10 transition-all group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-y-1 transition-transform">download</span>
            Export CSV
          </button>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-visible">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>Agent Details</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('assigned')}>Assigned</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('completed')}>Completed</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('pending')}>Pending</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('completionRate')}>Completion %</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest text-right">Last Active</th>
                <th className="px-6 py-4 text-on-surface-variant/70 font-body text-[10px] font-black uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sortedAgents.map((agent) => {
                const isCompletedExpanded = expandedRow?.agentId === agent.id && expandedRow?.type === 'completed';
                const isPendingExpanded = expandedRow?.agentId === agent.id && expandedRow?.type === 'pending';
                const isExpanded = isCompletedExpanded || isPendingExpanded;

                return (
                  <React.Fragment key={agent.id}>
                    <tr className={`hover:bg-surface-container/30 transition-colors group cursor-pointer ${isExpanded ? 'bg-surface-container/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-on-surface font-black text-sm">{agent.name}</div>
                            <div className="text-on-surface-variant/50 text-xs font-mono">{agent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface text-sm font-bold">{agent.assigned}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleExpanded(agent.id, 'completed')}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                            isCompletedExpanded
                            ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30 font-black'
                            : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 font-bold'
                          }`}
                        >
                          <span className="text-sm">{agent.completed}</span>
                          <span className={`material-symbols-outlined text-[14px] transition-transform ${isCompletedExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleExpanded(agent.id, 'pending')}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                            isPendingExpanded
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30 font-black'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 font-bold'
                          }`}
                        >
                          <span className="text-sm">{agent.pending}</span>
                          <span className={`material-symbols-outlined text-[14px] transition-transform ${isPendingExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-outline-variant/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${agent.completionRate < 50 ? 'bg-error' : agent.completionRate < 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(agent.completionRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-black tracking-wider ${agent.completionRate < 50 ? 'text-error' : 'text-on-surface'}`}>{agent.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-on-surface-variant/50 text-xs font-mono font-black">{agent.lastActive}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (blockFrozen) return;
                            setSelectedAgentForFarmer(agent);
                            setIsFarmerModalOpen(true);
                          }}
                          disabled={blockFrozen}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-1 border ${
                            blockFrozen
                              ? 'bg-surface-container text-on-surface-variant/30 border-outline-variant/10 cursor-not-allowed'
                              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border-primary/20 hover:border-primary'
                          }`}
                          title={blockFrozen ? 'Block frozen — cannot assign farmers' : 'Assign farmer to agent'}
                        >
                          <span className="material-symbols-outlined text-[14px]">{blockFrozen ? 'block' : 'person_add'}</span>
                          {blockFrozen ? 'Frozen' : 'Assign'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Farmer List */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-surface-container/40 border-t border-outline-variant/10">
                            <div className="flex items-center justify-between px-8 py-3 border-b border-outline-variant/10">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isCompletedExpanded ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/70">
                                  {isCompletedExpanded ? 'Completed Visits' : 'Pending Visits'} — {agent.name}
                                </p>
                                <span className="text-[10px] text-on-surface-variant/40 italic ml-2">
                                  {isCompletedExpanded ? 'Hover on a card for full details' : ''}
                                </span>
                              </div>
                              <span className="text-[11px] font-black text-on-surface-variant/40 bg-on-surface/5 px-2.5 py-1 rounded-full">
                                {isCompletedExpanded 
                                  ? (agent.completedFarmerDetails?.length || agent.completedFarmerNames?.length || 0)
                                  : (agent.pendingFarmerDetails?.length || agent.pendingFarmerNames?.length || 0)
                                } farmers
                              </span>
                            </div>
                            
                            <div className="px-8 py-4">
                              {(() => {
                                const details = isCompletedExpanded 
                                  ? agent.completedFarmerDetails 
                                  : agent.pendingFarmerDetails;
                                
                                // Fallback to name-only if details not available
                                if (!details || details.length === 0) {
                                  const names = isCompletedExpanded ? agent.completedFarmerNames : agent.pendingFarmerNames;
                                  if (!names || names.length === 0) {
                                    return <p className="text-sm text-on-surface-variant/40 italic py-2">No farmers in this category</p>;
                                  }
                                  return (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {names.map((name, i) => (
                                        <FarmerCard 
                                          key={i} 
                                          farmer={{ name, village: '', submission: null }} 
                                          isCompleted={isCompletedExpanded} 
                                        />
                                      ))}
                                    </div>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {details.map((farmer, i) => (
                                      <FarmerCard 
                                        key={farmer.id || i} 
                                        farmer={farmer} 
                                        isCompleted={isCompletedExpanded} 
                                        onReassign={(f) => {
                                          setReassignFarmerData(f);
                                          setReassignModalOpen(true);
                                        }}
                                      />
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sortedAgents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant/50 font-bold">No agents found for this block.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/10">
            <h2 className="text-2xl font-headline font-black text-on-surface mb-6">Assign New Field Agent</h2>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  placeholder="e.g. Ramesh Singh"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Phone Number</label>
                <input 
                  type="tel" required
                  value={newAgent.phone} onChange={e => setNewAgent({...newAgent, phone: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Temporary Password</label>
                <input 
                  type="password" required minLength={6}
                  value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Assign Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Farmer Modal */}
      {isFarmerModalOpen && selectedAgentForFarmer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-outline-variant/10">
            <button 
              onClick={() => setIsFarmerModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">close</span>
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
                {selectedAgentForFarmer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface">Assign Farmer</h2>
                <p className="text-xs font-bold text-on-surface-variant">Adding to {selectedAgentForFarmer.name}</p>
              </div>
            </div>

            <form onSubmit={handleAddFarmer} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Farmer Name</label>
                <input 
                  type="text" 
                  value={newFarmer.name}
                  onChange={e => setNewFarmer({...newFarmer, name: e.target.value})}
                  className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl text-sm font-bold border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  placeholder="e.g. Ramesh Singh"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={newFarmer.phone}
                  onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})}
                  className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl text-sm font-bold border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Village / Location</label>
                <input 
                  type="text" 
                  value={newFarmer.village}
                  onChange={e => setNewFarmer({...newFarmer, village: e.target.value})}
                  className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl text-sm font-bold border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  placeholder="e.g. Doiwala Khas"
                  required 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFarmerModalOpen(false)}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-black text-sm py-3.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingFarmer}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black text-sm py-3.5 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmittingFarmer ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Assign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Farmer Modal */}
      {reassignModalOpen && reassignFarmerData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-outline-variant/10">
            <button 
              onClick={() => setReassignModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">close</span>
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center font-black text-xl">
                <span className="material-symbols-outlined">swap_horiz</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-error">Reassign Task</h2>
                <p className="text-xs font-bold text-on-surface-variant truncate">
                  Disputed report for <span className="text-on-surface">{reassignFarmerData.name}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-6">
              <div className="bg-error/5 border border-error/10 p-4 rounded-xl">
                <p className="text-xs text-error/80 font-bold mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Why reassign?
                </p>
                <p className="text-xs text-on-surface leading-relaxed">
                  This farmer explicitly denied receiving the benefits claimed by the current agent. 
                  Reassigning this farmer will allow a different field agent to conduct an independent verification.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Select New Agent</label>
                <select 
                  value={selectedNewAgentId}
                  onChange={(e) => setSelectedNewAgentId(e.target.value)}
                  className="w-full bg-surface-container text-on-surface px-4 py-3.5 rounded-xl text-sm font-bold border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select an agent --</option>
                  {agents
                    // Prevent assigning back to the current agent
                    .filter(a => expandedRow && a.id !== expandedRow.agentId)
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Active: {a.pending} pending tasks)</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setReassignModalOpen(false)}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-black text-sm py-3.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isReassigning || !selectedNewAgentId}
                  className="flex-1 bg-error hover:bg-error/90 text-white font-black text-sm py-3.5 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-error/20 flex items-center justify-center gap-2"
                >
                  {isReassigning ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                  ) : (
                    <>
                      Confirm Reassignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
