export function AiAnomaliesPage() {
  return (
    <section className="p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <span className="label-md uppercase tracking-[0.2em] text-on-primary-container font-bold mb-2 block">
          Detection Engine: Isolation Forest
        </span>
        <h2 className="text-5xl font-extrabold text-primary tracking-tight mb-4">
          Anomaly Archive
        </h2>
        <p className="text-on-surface-variant max-w-2xl text-lg">
          Cross-referencing satellite sowing reports with subsidy disbursement logs. Detecting
          deviations in institutional resource allocation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-error">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Critical Flags
          </p>
          <h3 className="text-3xl font-black text-primary">12</h3>
          <p className="text-[0.65rem] text-error font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>+4 Since last
            sync
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Total Scanned
          </p>
          <h3 className="text-3xl font-black text-primary">1.4M</h3>
          <p className="text-[0.65rem] text-on-primary-container font-bold mt-2">
            Entities monitored
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Mean Outlier Score
          </p>
          <h3 className="text-3xl font-black text-primary">0.82</h3>
          <p className="text-[0.65rem] text-on-primary-container font-bold mt-2">
            Isolation Index
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Recovery Potential
          </p>
          <h3 className="text-3xl font-black text-primary">₹4.2Cr</h3>
          <p className="text-[0.65rem] text-on-primary-container font-bold mt-2">
            Targeted audits
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface-container-lowest rounded-xl p-8 border border-error/20 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1 bg-error text-white text-[10px] font-bold tracking-[0.2em] uppercase">
            CRITICAL
          </div>
          <div className="w-full md:w-1/4">
            <div className="bg-surface-container-low rounded-lg aspect-square mb-4 overflow-hidden group cursor-pointer relative">
              <img
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                alt="Satellite imagery showing a dry brown agricultural plot with no visible green vegetation"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaSOSxafbNXxw3ppdT9kRonNPBIxUUqIAAuAFsrlgdPI9qtifGKNGWJX4rVJ87tSVMKpIEh5Xzhw4HrT313vZk_EZWyy1qbMsKmrJScRwKe0vrQ6qPR988FGFObI9hxFdwp-_Dms3yyXIleTAz8WESpbxi6AITWFfpWJD0_XUn-O_12JIX9qGTjB9nYHGDxZwfzSi1meQ_JQhHjkj4FBnbGmH_D3qSvHSZ3L1_MF0dfwEPf9Y_PAnTtkZVKNV1IZeoZwMdx7fEQlg"
              />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">
              Reference: SAT-990-22X
            </p>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-primary mb-1">
              Resource Divergence: Block-14, Raipur
            </h4>
            <div className="flex gap-2 mb-4">
              <span className="bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                Fertilizer Spike
              </span>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                Isolation Forest: 0.94
              </span>
            </div>
            <p className="text-on-surface text-lg leading-relaxed mb-6 font-medium">
              Unexpected spike in fertilizer purchase without corresponding sowing reports.
              Satellite telemetry confirms 84% of land remains fallow despite 240% increase in urea
              allocation.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low p-3 rounded-lg">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Allocated Subsidy
                </span>
                <p className="text-lg font-bold text-primary">₹84,500</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Observed Sowing
                </span>
                <p className="text-lg font-bold text-error">0.00 Ha</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-outline-variant/15">
              <button className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">send</span>Send Notice
              </button>
              <button className="bg-error hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">ac_unit</span>Freeze
              </button>
              <button className="bg-white border border-outline-variant/30 hover:bg-surface-container-low text-on-surface px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">done_all</span>Mark Reviewed
              </button>
              <a
                className="ml-auto flex items-center gap-2 text-on-primary-fixed-variant font-bold text-sm hover:underline"
                href="#"
              >
                <span className="material-symbols-outlined">attachment</span>
                Evidence Log (3)
              </a>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/4">
            <div className="bg-surface-container-low rounded-lg aspect-square mb-4 overflow-hidden group cursor-pointer relative">
              <img
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                alt="Aerial view of multiple green farm circles in a dry landscape"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI8fOYAZdAqNQlXtYRxJ29MkKR4ZOby5Zn0CNqlr4cKDNcZAwHCyKZTQURHEdqzA26JTr9_-RaE_PVDwBujE4UedSGv1EmioBX-5SyLmarNYIiGsvl1k5Qlz2-iKrHqyqyaO9voDOnJYAmksRdmSd2ZBZo58iKdDjPra1qSmcGwvR8zOpC70rb4I0HCnlmG4cV4eHQhyuQrkTlkOi7CgxfzcL-boYLUD5JJ425TiP13190xBFUkgNYeICuWvcKY5aiSlbH6AJIa6A"
              />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">
              Reference: DB-LOG-441-A
            </p>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-primary mb-1">
              Identity Ghosting: Cluster B, Vidarbha
            </h4>
            <div className="flex gap-2 mb-4">
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                Identity Anomaly
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                Isolation Forest: 0.78
              </span>
            </div>
            <p className="text-on-surface text-lg leading-relaxed mb-6 font-medium">
              Multiple subsidy registrations detected from the same geographic coordinates using
              distinct Aadhaar-linked devices within a 12-minute window. Likely systematic proxy
              filing.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low p-3 rounded-lg">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Linked UID Count
                </span>
                <p className="text-lg font-bold text-primary">14 Individuals</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Coordination Index
                </span>
                <p className="text-lg font-bold text-on-tertiary-fixed-variant">HIGH (0.88)</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-outline-variant/15">
              <button className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">send</span>Send Notice
              </button>
              <button className="bg-secondary hover:bg-primary-container text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">gavel</span>Flag for Audit
              </button>
              <button className="bg-white border border-outline-variant/30 hover:bg-surface-container-low text-on-surface px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">done_all</span>Mark Reviewed
              </button>
              <a
                className="ml-auto flex items-center gap-2 text-on-primary-fixed-variant font-bold text-sm hover:underline"
                href="#"
              >
                <span className="material-symbols-outlined">database</span>
                Transaction History
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 py-8 flex items-center justify-between border-t border-outline-variant/15">
        <div className="text-sm text-on-surface-variant">
          Showing <span className="font-bold text-primary">1-2</span> of 48 anomalies
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-white transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-outline-variant/30 text-primary hover:bg-surface-container-low transition-all">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-outline-variant/30 text-primary hover:bg-surface-container-low transition-all">
            3
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-white transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}

