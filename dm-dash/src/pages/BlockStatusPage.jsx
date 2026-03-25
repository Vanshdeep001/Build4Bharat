export function BlockStatusPage() {
  return (
    <main className="p-8">
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
              administrative blocks.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm flex items-center gap-3 border border-outline-variant/10">
            <div className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
                location_on
              </span>
              <select className="bg-transparent border-none text-xs font-semibold focus:ring-0 text-on-surface min-w-[140px]">
                <option>All Districts</option>
                <option>North Lakhimpur</option>
                <option>Sivasagar</option>
                <option>Majuli</option>
                <option>Dibrugarh</option>
              </select>
            </div>
            <div className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
                calendar_today
              </span>
              <span className="text-xs font-semibold text-on-surface">FY 2023-24</span>
            </div>
            <button className="bg-primary text-white p-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">search</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Blocks', value: '214', isError: false },
            { label: 'Avg Utilization', value: '74.2%', isError: false },
            { label: 'Critical Flags', value: '18', isError: true },
            { label: 'Total Farmers', value: '1.2M', isError: false },
          ].map(({ label, value, isError }) => (
            <div
              key={label}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5"
            >
              <p className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                {label}
              </p>
              <p
                className={[
                  'text-3xl font-headline font-black',
                  isError ? 'text-error' : 'text-primary',
                ].join(' ')}
              >
                {value}
              </p>
              <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={[
                    'h-full',
                    isError ? 'bg-error w-[8%]' : 'bg-primary w-full',
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
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-all">
                Export CSV
              </button>
              <button className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-all">
                Full Report
              </button>
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
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className={[
                        'px-6 py-4 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest',
                        h === 'Anomaly Flags' ? 'text-center' : '',
                        h === 'Actions' ? 'text-right' : '',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  ['North Lakhimpur', 'Narayanpur', '92%', '14,203', '0', 'ON TRACK'],
                  ['Sivasagar', 'Demow', '34%', '8,442', '12', 'CRITICAL'],
                  ['Majuli', 'Kamalabari', '68%', '5,110', '2', 'ON TRACK'],
                  ['Dibrugarh', 'Barbaruah', '45%', '11,882', '7', 'WARNING'],
                  ['Jorhat', 'Titabar', '88%', '19,330', '1', 'ON TRACK'],
                ].map(([district, block, util, farmers, flags, status]) => (
                  <tr
                    key={`${district}-${block}`}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="px-6 py-5 font-headline font-semibold text-sm text-primary">
                      {district}
                    </td>
                    <td className="px-6 py-5 font-body text-sm text-on-surface-variant">
                      {block}
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
                      {farmers}
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
                        {flags}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={[
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold',
                          status === 'CRITICAL'
                            ? 'bg-error-container text-error'
                            : status === 'WARNING'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                              : 'bg-on-primary-container/10 text-on-primary-container',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'w-1.5 h-1.5 rounded-full',
                            status === 'CRITICAL'
                              ? 'bg-error'
                              : status === 'WARNING'
                                ? 'bg-on-tertiary-fixed-variant'
                                : 'bg-on-primary-container',
                          ].join(' ')}
                        ></span>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 bg-primary/10 text-primary-fixed-variant text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
                          INSPECT
                        </button>
                        <button className="px-3 py-1.5 bg-error-container/40 text-error text-[10px] font-bold rounded-lg hover:bg-error hover:text-white transition-all">
                          FREEZE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-surface-container-low flex justify-between items-center text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">
            <span>Showing 5 of 214 Blocks</span>
            <div className="flex gap-4">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>{' '}
                Previous
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                Next <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg text-primary mb-6">
              Regional Drift Analysis
            </h4>
            <div className="aspect-video bg-surface-container-low rounded-xl flex items-center justify-center relative overflow-hidden">
              <img
                alt="Data visualization heatmap"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQnYjgUQFoKZpLcSvuMY1K3AGJQ6HRlJENpr2xMJRL_XH3osLrxlgal2dnv3SGx-NMdFmNHQ6191F15wwNl9-3Yjm13yAYlEriyoLq4aShQao9Ba-6DBRK1oB31YEFSyBnVqhcdwHCKy9Z4EC0dnHml_3y_UaExBrwlr47eV5T2XmSNon0V333wAiaGZM5rxaECNvIN9-iy_XoHVSvyWVHQgdFiiC1f1ZPHu67lBJ1wMLMDX_lfSTHSGzUJlDTUZNAx9KD1AOqf50"
              />
              <div className="relative z-10 text-center px-8">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">
                  insights
                </span>
                <p className="text-sm font-bold text-primary">Inter-District Disparity Map</p>
                <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-widest">
                  Click to expand geographic details
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg text-primary mb-6">
              Recent Freeze Actions
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-error-container/10 border-l-4 border-error">
                <span className="material-symbols-outlined text-error mt-1">block</span>
                <div>
                  <p className="text-sm font-bold text-primary">Bihpuria Block, Lakhimpur</p>
                  <p className="text-xs text-on-surface-variant">
                    Funds frozen due to consistent audit failures.
                  </p>
                  <p className="text-[10px] text-error font-bold mt-1 uppercase">
                    Action by: Administrator S. Roy • 2h ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border-l-4 border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">
                  visibility
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">Nazira Block, Sivasagar</p>
                  <p className="text-xs text-on-surface-variant">
                    Inspection scheduled for 21/04/24.
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase">
                    Flagged by: AI Anomaly System • 5h ago
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-outline-variant/20 rounded-xl text-xs font-bold text-primary hover:bg-surface-container-low transition-all">
              View Audit History
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

