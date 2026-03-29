import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    if (role === 'dm') {
      navigate('/dm');
    } else if (role === 'bdo') {
      navigate('/bdo');
    }
  };

  return (
    <div className="min-h-screen bg-[#00113a] dark:bg-[#00081a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#00174a]/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/5">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#002366] rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
          </div>
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-widest">PMDDKY</h1>
          <p className="text-[#758dd5] font-body text-sm uppercase tracking-widest mt-2 font-semibold">Governance Operations</p>
          <div className="h-0.5 w-12 bg-white/20 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm">Select Your Operational Role</p>
          </div>
          
          <button
            onClick={() => handleLogin('dm')}
            className="w-full relative group overflow-hidden bg-[#002366] hover:bg-[#0a3182] text-white p-4 rounded-xl transition-all duration-300 border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">admin_panel_settings</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">District Magistrate</h3>
                <p className="text-xs text-white/60">Sovereign Archive Access</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors group-hover:translate-x-1">arrow_forward</span>
          </button>

          <button
            onClick={() => handleLogin('bdo')}
            className="w-full relative group overflow-hidden bg-[#1e293b] hover:bg-[#334155] text-white p-4 rounded-xl transition-all duration-300 border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">diversity_3</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">B.D.O</h3>
                <p className="text-xs text-white/60">Block Operations Panel</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-white/30">
          <p>Secure Government Network • Session Monitored</p>
        </div>

      </div>
    </div>
  );
}
