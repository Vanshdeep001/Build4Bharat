export function SchemeConvergencePage() {
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <section className="space-y-2">
        <span className="font-label font-semibold text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          Centralized Intelligence
        </span>
        <div className="flex justify-between items-end">
          <h2 className="font-headline font-black text-4xl text-primary tracking-tight">
            Scheme Convergence Matrix
          </h2>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs font-semibold text-on-surface-variant">
                Active Schemes: 36
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-on-primary-container"></span>
              <span className="text-xs font-semibold text-on-surface-variant">
                Convergence Level: 74%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl space-y-4 hover:shadow-xl transition-shadow border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-fixed rounded-lg">
                <span className="material-symbols-outlined text-primary">agriculture</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg leading-none">PM-KISAN</h3>
                <p className="text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
                  Min. of Agriculture
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[0.65rem] font-bold px-2 py-1 rounded bg-green-50 text-green-700">
              <span
                className="material-symbols-outlined text-[10px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sync
              </span>
              PFMS SYNCED
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-black text-3xl tracking-tighter">
              ₹4,280 Cr
            </span>
            <span className="text-xs text-on-surface-variant">Utilized (82%)</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[82%]"></div>
          </div>
          <div className="flex justify-between items-center text-[0.6875rem] font-semibold text-on-surface-variant">
            <span>Converged with: 6 Schemes</span>
            <span className="text-primary-fixed-variant">View Details →</span>
          </div>
        </div>

        {[
          ['construction', 'MGNREGA', 'MoRD', '₹8,122 Cr', 'bg-green-50 text-green-700', 'SYNCED'],
          ['home', 'PMAY-G', 'MoRD', '₹2,940 Cr', 'bg-error-container text-error', 'PFMS LAG'],
          ['groups', 'Antyodaya', 'MoRD', '₹1,150 Cr', 'bg-green-50 text-green-700', 'SYNCED'],
          ['water_drop', 'JJM', 'Jal Shakti', '₹5,400 Cr', 'bg-green-50 text-green-700', 'SYNCED'],
          ['payments', 'NRLM', 'Rural Livelihood', '₹3,890 Cr', 'bg-green-50 text-green-700', 'SYNCED'],
          ['edit_road', 'PMGSY', 'Rural Roads', '₹6,210 Cr', 'bg-green-50 text-green-700', 'SYNCED'],
        ].map(([icon, name, org, amount, badgeClass, badgeText]) => (
          <div
            key={name}
            className="bg-surface-container-lowest p-6 rounded-xl space-y-4 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary-fixed rounded-lg">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
              <div className={`flex items-center gap-1 text-[0.65rem] font-bold px-2 py-1 rounded ${badgeClass}`}>
                <span
                  className="material-symbols-outlined text-[10px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {badgeText === 'PFMS LAG' ? 'sync_problem' : 'sync'}
                </span>
                {badgeText}
              </div>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base leading-none">{name}</h3>
              <p className="text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
                {org}
              </p>
            </div>
            <div className="font-headline font-black text-2xl tracking-tighter">{amount}</div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[80%]"></div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <span className="text-error font-bold text-[0.65rem] uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              Critical Detection
            </span>
            <h3 className="font-headline font-bold text-2xl tracking-tight leading-tight">
              Siloed Schemes Analysis
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The following schemes have zero reported cross-utilization data. Recommended
              for immediate District Dhan Dhaanya Samiti review to ensure convergent planning.
            </p>
          </div>
          <div className="bg-tertiary-container/10 border-l-2 border-tertiary-container p-4 rounded-r-lg">
            <p className="text-xs font-semibold text-on-tertiary-fixed-variant italic leading-tight">
              "Siloed funding leads to duplicate infrastructure. Convergence optimizes per-capita
              spending." - Samiti Guidelines
            </p>
          </div>
          <button className="flex items-center gap-2 text-primary font-bold text-sm group">
            Run Samiti AI Simulation
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="lg:col-span-2 bg-surface-container-low rounded-2xl overflow-hidden p-1">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant/15">
              <tr>
                {['Scheme Identity', 'PFMS Status', 'Fund Leakage Risk', 'Samiti Action'].map(
                  (h) => (
                    <th
                      key={h}
                      className={[
                        'px-6 py-4 font-label font-bold text-[0.6875rem] uppercase tracking-wider text-on-surface-variant',
                        h === 'PFMS Status' ? 'text-center' : '',
                        h === 'Fund Leakage Risk' ? 'text-right' : '',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                ['PM-FME', 'Food Micro Enterprises', 'sync_disabled', 'High (24%)', 'text-error', 'bg-error'],
                ['PM-VAN DHAN', 'Tribal Products', 'sync_problem', 'Medium (12%)', 'text-on-tertiary-fixed-variant', 'bg-error'],
                ['RKVY-RAFTAAR', 'Agri-Infrastructure', 'sync', 'Low (4%)', 'text-on-surface-variant', 'bg-on-secondary-container'],
              ].map(([name, desc, icon, risk, riskClass, dotClass]) => (
                <tr key={name} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
                      <div>
                        <div className="font-bold text-sm">{name}</div>
                        <div className="text-[0.65rem] text-on-surface-variant">{desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={[
                        'material-symbols-outlined text-lg',
                        icon === 'sync' ? 'text-green-600' : 'text-error',
                      ].join(' ')}
                      style={icon === 'sync' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {icon}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-headline font-bold ${riskClass}`}>{risk}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-white px-3 py-1 rounded border border-outline-variant/30 text-[0.65rem] font-bold text-primary shadow-sm hover:shadow-md transition-all">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-primary p-8 rounded-3xl relative overflow-hidden min-h-[400px] flex flex-col justify-between">
        <div className="absolute inset-0 opacity-10">
          <img
            alt="Abstract digital data visualization with blue and orange nodes connecting in a complex network"
            className="w-full h-full object-cover grayscale brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGF0h8xiKMrtOBXCUJ_IL5XqpbE-kzWORz5AilnbshzvwQPXkm_kzhlM8ReeGHYEIxZZP0H-Z1UQN1D6nLFYWzExbesmM4Pd5Xb2uwvYll60pTvgBf3Z21o5q4wrMf1pE6apEJ090iU-qkGOsPU5P8yL7INIxKWT3bZ7jMDwBhyIBAmuU-le9SDRxLwu21WNOIlCWJIJDPLhflI9LyGmLwf4XFkLGFCU03P5SWLxRxJN_E3i27Mo9jkaDnV6SW_adRQ9CrcQrVv0A"
          />
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-2xl text-white">
              Convergence Density Map
            </h3>
            <p className="text-on-primary-container text-sm">National District Aggregation</p>
          </div>
          <div className="backdrop-blur-[12px] bg-white/80 p-4 rounded-xl space-y-2 w-48 border border-white/20">
            <div className="flex justify-between text-[0.65rem] font-bold text-primary">
              <span>High Convergence</span>
              <span>84%</span>
            </div>
            <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[84%]"></div>
            </div>
            <p className="text-[0.6rem] text-on-surface-variant">
              612 Districts reporting above threshold.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ['₹24,800 Cr', 'Total Converged Corpus'],
            ['18.2 M', 'Unique Beneficiaries'],
            ['32%', 'CapEx Efficiency Gain'],
            ['2,410', 'Multipurpose Assets'],
          ].map(([value, label]) => (
            <div key={label} className="space-y-1">
              <div className="text-4xl font-headline font-black text-white tracking-tighter">
                {value}
              </div>
              <div className="text-[0.6875rem] text-[#758dd5] font-bold uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 px-12 py-8 border-t border-outline-variant/10 flex justify-between items-center text-[0.6875rem] text-on-surface-variant font-medium">
        <p>© 2024 PMDDKY Sovereign Archive • Department of Rural Development • MeitY</p>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors" href="#">
            Data Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            PFMS API Status
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Contact Administrator
          </a>
        </div>
      </footer>
    </div>
  )
}

