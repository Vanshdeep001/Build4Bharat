import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { AnomalyProvider } from "../context/AnomalyContext";

const navLinkBase =
  "flex items-center gap-3 px-4 py-3 mx-2 transition-all rounded-lg";

function BDOSideNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#00113a] dark:bg-[#00081a] shadow-[8px_0_24px_-4px_rgba(26,28,28,0.06)] flex flex-col py-6 gap-2">
      <div className="px-6 mb-8 invisible">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">
              account_balance
            </span>
          </div>
          <div>
            <h1 className="font-headline font-black text-[#ffffff] text-lg uppercase tracking-widest leading-none">
              PMDDKY
            </h1>
            <p className="text-[0.65rem] text-[#758dd5] uppercase tracking-tighter">
              BDO Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <NavLink
          to="/bdo/overview"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body font-medium text-[0.875rem]">
            Overview
          </span>
        </NavLink>

        <NavLink
          to="/bdo/today"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">today</span>
          <span className="font-body font-medium text-[0.875rem]">
            Today's Operations
          </span>
        </NavLink>

        <NavLink
          to="/bdo/agents"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">diversity_3</span>
          <span className="font-body font-medium text-[0.875rem]">
            Field Agents
          </span>
        </NavLink>

        <NavLink
          to="/bdo/visits"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">route</span>
          <span className="font-body font-medium text-[0.875rem]">
            Visit Tracking
          </span>
        </NavLink>

        <NavLink
          to="/bdo/grievances"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">warning</span>
          <span className="font-body font-medium text-[0.875rem]">
            System Anomalies
          </span>
        </NavLink>
      </nav>

      <div className="px-4 mt-auto mb-4">
        <button className="w-full bg-primary-fixed-dim text-primary py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-sm">description</span>
          Export Block Report
        </button>
      </div>

      <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
        <a
          className="flex items-center gap-3 text-[#758dd5] hover:text-white px-4 py-3 mx-2 transition-all cursor-pointer"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body font-medium text-[0.875rem]">
            Sign Out
          </span>
        </a>
      </div>
    </aside>
  );
}

export function BDOLayout() {
  const [selectedBlock, setSelectedBlock] = useState("dehradun");

  return (
    <div className="min-h-screen bg-surface">
      <BDOSideNav />
      <main className="ml-64 min-h-screen">
        <Navbar
          selectedDistrict={selectedBlock}
          onDistrictChange={setSelectedBlock}
          hideSearch={true}
        />
        <AnomalyProvider selectedBlock={selectedBlock}>
          <div className="px-8 py-6 max-w-[1600px] mx-auto">
            <Outlet context={{ selectedBlock, setSelectedBlock }} />
          </div>
        </AnomalyProvider>
      </main>
    </div>
  );
}
