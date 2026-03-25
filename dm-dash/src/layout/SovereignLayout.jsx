import { NavLink, Outlet } from 'react-router-dom'

const navLinkBase =
  'flex items-center gap-3 px-4 py-3 mx-2 transition-all rounded-lg'

function SideNav() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#00113a] dark:bg-[#00081a] shadow-[8px_0_24px_-4px_rgba(26,28,28,0.06)] flex flex-col py-6 gap-2">
      <div className="px-6 mb-8">
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

function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-[#f9f9f9] dark:bg-slate-950 flex justify-between items-center w-full px-8 py-4 border-b border-[#c5c6d2]/15">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-[#00113a] dark:text-[#dbe1ff] tracking-tighter">
          PMDDKY Sovereign
        </span>
        <nav className="hidden md:flex gap-6 font-headline font-semibold text-sm tracking-tight">
          <a
            className="text-[#444650] dark:text-slate-400 hover:text-[#00113a] dark:hover:text-white transition-colors"
            href="#"
          >
            Overview
          </a>
          <a
            className="text-[#444650] dark:text-slate-400 hover:text-[#00113a] dark:hover:text-white transition-colors"
            href="#"
          >
            Reports
          </a>
          <a
            className="text-[#444650] dark:text-slate-400 hover:text-[#00113a] dark:hover:text-white transition-colors"
            href="#"
          >
            Alerts
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <input
            className="bg-surface-container-low border-none rounded-full px-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search archive..."
            type="text"
          />
          <span className="material-symbols-outlined absolute right-3 top-1.5 text-sm text-on-surface-variant">
            search
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-[#f3f3f3] transition-all">
            <span className="material-symbols-outlined text-[#00113a]">
              notifications
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-[#f3f3f3] transition-all">
            <span className="material-symbols-outlined text-[#00113a]">
              filter_list
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-[#f3f3f3] transition-all">
            <span className="material-symbols-outlined text-[#00113a]">
              settings
            </span>
          </button>
          <button
            className="p-0.5 rounded-full hover:bg-[#f3f3f3] transition-all"
            type="button"
            aria-label="User profile"
          >
            <img
              className="w-9 h-9 rounded-full object-cover border border-outline-variant/30"
              alt="User profile avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCedhp8YayUuYryM2vA_5S13v0FyQpyKFkr-nwZ7DbPCSBubGbxKMWf0i-jsbXXKokCjfJOOYw_1bpqPfg-QAFVs6XA6RGgrRSsOaEkeZO_tYJGgXTPQj0NgIstB_mv9mGn_LkKQ9wjtkRqVNgJuf6m-Xk7s1x7MTrzbu1k05CbrAZjVT19H_HId9RlzB9R0jkRx6NjPzdm--8xBdU55WxRsGVL18fvFW1vG2R8d38qHc-K1V4hpxBlexo6YrKMeOPhVF-reQFy0F4"
            />
          </button>
        </div>
      </div>
    </header>
  )
}

export function SovereignLayout() {
  return (
    <div className="min-h-screen">
      <SideNav />
      <main className="ml-64 min-h-screen">
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}

