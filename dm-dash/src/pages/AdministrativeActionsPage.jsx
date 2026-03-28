import React, { useState } from 'react';

// --- Dummy Data ---
const initialFundsData = [
  { id: 1, district: "Dehradun", block: "Vikasnagar", allocated: 250, utilized: 210, status: "Active" },
  { id: 2, district: "Haridwar", block: "Roorkee", allocated: 180, utilized: 175, status: "Critical" },
  { id: 3, district: "Nainital", block: "Haldwani", allocated: 300, utilized: 120, status: "Active" },
  { id: 4, district: "Udham Singh Nagar", block: "Kashipur", allocated: 420, utilized: 410, status: "Frozen" },
  { id: 5, district: "Almora", block: "Ranikhet", allocated: 150, utilized: 45, status: "Active" }
];

const initialUsersData = [
  { id: 101, name: "Veer Vikram Singh", role: "District Magistrate", jurisdiction: "Dehradun", status: "Active" },
  { id: 102, name: "Rajesh Kumar", role: "Block Dev. Officer", jurisdiction: "Vikasnagar", status: "Active" },
  { id: 103, name: "Sneha Kapur", role: "Block Dev. Officer", jurisdiction: "Kashipur", status: "Suspended" },
  { id: 104, name: "Amit Singh", role: "District Magistrate", jurisdiction: "Nainital", status: "Active" },
  { id: 105, name: "Priya Devi", role: "Block Dev. Officer", jurisdiction: "Roorkee", status: "On Leave" }
];

export function AdministrativeActionsPage() {
  const [activeTab, setActiveTab] = useState('funds');
  
  // States for interaction simulation
  const [fundsData, setFundsData] = useState(initialFundsData);
  const [usersData, setUsersData] = useState(initialUsersData);
  const [toastMsg, setToastMsg] = useState('');

  // KPIs State
  const [kpiTargets, setKpiTargets] = useState({
    seedDistribution: 25000,
    soilHealthCards: 150000,
    irrigationSetup: 450,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Fund Actions
  const toggleFundStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Frozen' ? 'Active' : 'Frozen';
    setFundsData(fundsData.map(f => f.id === id ? { ...f, status: newStatus } : f));
    showToast(`Fund status updated to ${newStatus}`);
  };

  const reallocateFunds = (id) => showToast(`Initiated Reallocation Workflow for ID ${id}`);

  // User Actions
  const toggleUserStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsersData(usersData.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(`User status updated to ${newStatus}`);
  };

  const reassignUser = (name) => showToast(`Initiated Reassignment Workflow for ${name}`);

  // KPI Actions
  const saveKpis = () => showToast(`KPI Targets successfully saved for the upcoming quarter!`);

  return (
    <div className="p-0 space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-surface-container-highest text-on-surface font-bold px-6 py-4 rounded-xl shadow-2xl border border-outline-variant/20 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-error/10 text-error rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight leading-none mb-1">
              Administrative Actions
            </h1>
            <p className="text-sm font-medium text-on-surface-variant">
              Manage allocations, personnel deployments, and strategic targets
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-sm min-h-[600px] flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/10 bg-surface-container/20">
          <button 
            onClick={() => setActiveTab('funds')}
            className={`flex-1 py-5 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'funds' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <span className="material-symbols-outlined text-lg">account_balance</span>
            Fund Management
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-5 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'users' ? 'border-indigo-500 text-indigo-500 bg-indigo-500/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <span className="material-symbols-outlined text-lg">manage_accounts</span>
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('kpi')}
            className={`flex-1 py-5 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'kpi' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <span className="material-symbols-outlined text-lg">track_changes</span>
            Set KPI Targets
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-8 flex-1 bg-surface-container-lowest">
          
          {/* FUNDS TAB */}
          {activeTab === 'funds' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl font-bold text-on-surface">Financial Allocations (Cr)</h3>
                <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Allocation
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">District / Block</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Allocated</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Utilized (%)</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {fundsData.map(fund => {
                      const utilRate = ((fund.utilized / fund.allocated) * 100).toFixed(1);
                      return (
                        <tr key={fund.id} className="hover:bg-surface-container-lowest/50 group">
                          <td className="p-4">
                            <div className="font-bold text-on-surface">{fund.district}</div>
                            <div className="text-xs text-on-surface-variant">{fund.block}</div>
                          </td>
                          <td className="p-4 font-black">₹{fund.allocated}</td>
                          <td className="p-4 font-medium text-on-surface-variant hidden sm:table-cell">
                            ₹{fund.utilized} <span className="text-xs opacity-60">({utilRate}%)</span>
                            <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full rounded-full ${utilRate > 80 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${Math.min(utilRate, 100)}%` }}></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full ${fund.status === 'Active' ? 'bg-green-500/10 text-green-500' : fund.status === 'Frozen' ? 'bg-on-surface-variant/10 text-on-surface-variant' : 'bg-error/10 text-error'}`}>
                              {fund.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => reallocateFunds(fund.id)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors tooltip-trigger" title="Reallocate">
                              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                            </button>
                            <button onClick={() => toggleFundStatus(fund.id, fund.status)} className={`${fund.status === 'Frozen' ? 'text-green-500 hover:bg-green-500/10' : 'text-error hover:bg-error/10'} p-2 rounded-lg transition-colors tooltip-trigger`} title={fund.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}>
                              <span className="material-symbols-outlined text-[20px]">{fund.status === 'Frozen' ? 'ac_unit' : 'block'}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl font-bold text-on-surface">Personnel Directory</h3>
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Add User
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersData.map(user => (
                  <div key={user.id} className="bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Suspended' ? 'bg-error' : 'bg-amber-500'}`}></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center font-black text-on-surface text-xl mb-4">
                        {user.name.charAt(0)}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-full ${user.status === 'Active' ? 'text-green-500 bg-green-500/10' : user.status === 'Suspended' ? 'text-error bg-error/10' : 'text-amber-500 bg-amber-500/10'}`}>
                        {user.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-on-surface">{user.name}</h4>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1">{user.role}</p>
                    <p className="text-sm text-on-surface-variant font-medium flex items-center gap-1 mt-3">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {user.jurisdiction}
                    </p>

                    <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => reassignUser(user.name)} className="flex-1 bg-surface-container-low hover:bg-surface-container py-2 rounded-lg text-xs font-bold text-on-surface transition-colors">
                        Reassign
                      </button>
                      <button onClick={() => toggleUserStatus(user.id, user.status)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${user.status === 'Active' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}>
                        {user.status === 'Active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI TAB */}
          {activeTab === 'kpi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h3 className="font-headline text-2xl font-black text-on-surface">Target Adjustments (Q3)</h3>
                <p className="text-sm font-medium text-on-surface-variant mt-2">Set state-wide baseline goals to push to down-level administration.</p>
              </div>

              <div className="space-y-8 bg-surface border border-outline-variant/20 p-8 sm:p-10 rounded-[2rem] shadow-sm relative">
                
                {/* Metric 1 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500">grass</span>
                      Seed Distribution <span className="text-[10px] text-on-surface-variant lowercase normal-case">(metric tons)</span>
                    </label>
                    <span className="font-black text-xl text-green-500">{kpiTargets.seedDistribution.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="10000" max="50000" step="500" 
                    value={kpiTargets.seedDistribution}
                    onChange={(e) => setKpiTargets({...kpiTargets, seedDistribution: parseInt(e.target.value)})}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                    <span>10K</span>
                    <span>50K</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">assignment_turned_in</span>
                      Soil Health Cards <span className="text-[10px] text-on-surface-variant lowercase normal-case">(issuance goal)</span>
                    </label>
                    <span className="font-black text-xl text-amber-500">{kpiTargets.soilHealthCards.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="50000" max="500000" step="10000" 
                    value={kpiTargets.soilHealthCards}
                    onChange={(e) => setKpiTargets({...kpiTargets, soilHealthCards: parseInt(e.target.value)})}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                    <span>50K</span>
                    <span>500K</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">water_drop</span>
                      Irrigation Setup <span className="text-[10px] text-on-surface-variant lowercase normal-case">(hectares covered)</span>
                    </label>
                    <span className="font-black text-xl text-blue-500">{kpiTargets.irrigationSetup.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100" max="2000" step="50" 
                    value={kpiTargets.irrigationSetup}
                    onChange={(e) => setKpiTargets({...kpiTargets, irrigationSetup: parseInt(e.target.value)})}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                    <span>100</span>
                    <span>2000</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-outline-variant/20 flex justify-end">
                  <button onClick={saveKpis} className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_8px_24px_rgba(var(--md-sys-color-primary-rgb),0.4)] hover:shadow-[0_12px_32px_rgba(var(--md-sys-color-primary-rgb),0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-1">
                    <span className="material-symbols-outlined">save</span>
                    Publish Targets
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
