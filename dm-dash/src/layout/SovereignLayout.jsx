import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const navLinkBase =
  'flex items-center gap-3 px-4 py-3 mx-2 transition-all rounded-lg'

function SideNav() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#00113a] dark:bg-[#00081a] shadow-[8px_0_24px_-4px_rgba(26,28,28,0.06)] flex flex-col py-6 gap-2">
      <div className="px-6 mb-8 invisible">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">account_balance</span>
          </div>
          <div>
            <h1 className="font-headline font-black text-[#ffffff] text-lg uppercase tracking-widest leading-none">
              PMDDKY
            </h1>
            <p className="text-[0.65rem] text-[#758dd5] uppercase tracking-tighter">
              Sovereign Archive
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body font-medium text-[0.875rem]">Live Overview</span>
        </NavLink>

        <NavLink
          to="/block-status"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">location_city</span>
          <span className="font-body font-medium text-[0.875rem]">Block Status</span>
        </NavLink>

        <NavLink
          to="/scheme-convergence"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">insights</span>
          <span className="font-body font-medium text-[0.875rem]">
            Scheme Convergence
          </span>
        </NavLink>

        <NavLink
          to="/grievances"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">forum</span>
          <span className="font-body font-medium text-[0.875rem]">Grievances</span>
        </NavLink>

        <NavLink
          to="/ai-anomalies"
          className={({ isActive }) =>
            isActive
              ? `${navLinkBase} bg-[#002366] text-white translate-x-1 duration-200`
              : `${navLinkBase} text-[#758dd5] hover:text-white hover:bg-[#002366]/50`
          }
        >
          <span className="material-symbols-outlined">report_problem</span>
          <span className="font-body font-medium text-[0.875rem]">AI Anomalies</span>
        </NavLink>
      </nav>

      <div className="px-4 mt-auto mb-4">
        <button className="w-full bg-primary-fixed-dim text-primary py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-sm">description</span>
          Generate Report
        </button>
      </div>

      <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
        <a
          className="flex items-center gap-3 text-[#758dd5] hover:text-white px-4 py-3 mx-2 transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body font-medium text-[0.875rem]">Support</span>
        </a>
        <a
          className="flex items-center gap-3 text-[#758dd5] hover:text-white px-4 py-3 mx-2 transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body font-medium text-[0.875rem]">Sign Out</span>
        </a>
      </div>
    </aside>
  )
}

export function SovereignLayout() {
  const [selectedDistrict, setSelectedDistrict] = useState('Uttarakhand')

  return (
    <div className="min-h-screen bg-surface">
      <SideNav />
      <main className="ml-64 min-h-screen">
        <Navbar 
          selectedDistrict={selectedDistrict} 
          onDistrictChange={setSelectedDistrict} 
        />
        <div className="px-8 py-6 max-w-[1600px] mx-auto">
          <Outlet context={{ selectedDistrict, setSelectedDistrict }} />
        </div>
      </main>
    </div>
  )
}

