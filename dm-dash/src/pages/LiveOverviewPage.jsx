export function LiveOverviewPage() {
  return (
    <div className="p-8 space-y-12">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            Fund Utilization
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline text-3xl font-extrabold text-primary">₹24,000</h2>
            <span className="font-label text-sm font-medium text-primary/70">Cr</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-primary-fixed-variant">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-medium">8.2% from prev. quarter</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            Verified Beneficiaries
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline text-3xl font-extrabold text-primary">1.42</h2>
            <span className="font-label text-sm font-medium text-primary/70">M</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-primary-fixed-variant">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-xs font-medium">94% Verification Rate</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            AI Anomaly Flags
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline text-3xl font-extrabold text-tertiary-container">
              124
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-1 text-on-tertiary-fixed-variant">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span className="text-xs font-medium">12 Critical incidents</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            Open Grievances
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline text-3xl font-extrabold text-primary">892</h2>
          </div>
          <div className="mt-4 flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="text-xs font-medium">Avg resolution: 4.2 days</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                Regional Anomalies Heatmap
              </h3>
              <p className="text-on-surface-variant text-sm mt-1 uppercase tracking-tight font-medium opacity-70">
                Uttarakhand Administrative Distribution
              </p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-lg">
              <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <span className="w-3 h-3 rounded-full bg-primary"></span> High
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <span className="w-3 h-3 rounded-full bg-primary-fixed-variant"></span>{' '}
                Med
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>{' '}
                Low
              </span>
            </div>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/5">
            <img
              className="w-full h-full object-cover"
              alt="clean minimal vector map of Uttarakhand districts with transparent overlay showing data density clusters in shades of navy blue"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1hu9f4Kjr3HKAX4YiZ0Wo1WyzbZRQ2E1rKiciCBHGfRK05zhxhnqi0ajuoUcz4veT-ZCbdN-Baqlr84UDxAwCQC4Y3EKYrSInXAcnbAF78vnx-xG5mJJmOBafOPh4hlcVhmhp2y4sTAT8clcHmSq-kmEsMExsRE3oU_x0tQPfglh6877coJxW7RyfiBQPdyBDBX02xiuGyUHrnzydP7XgJJ-3lhidnhgoeneE47PUM2vdlZ4gGH3Ws4WJVcQciziAfSv3uY2iiJ4"
            />
            <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-primary-container/30 rounded-full blur-2xl"></div>

            <div className="absolute top-20 left-40 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                Dehradun
              </p>
              <p className="text-xs font-bold text-primary">12 Flags</p>
            </div>
            <div className="absolute bottom-32 right-60 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                Nainital
              </p>
              <p className="text-xs font-bold text-primary">04 Flags</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-8">
            System Performance
          </h3>
          <div className="space-y-6">
            {[
              ['Cropping Intensity', '78%'],
              ['Irrigation Coverage', '62%'],
              ['Crop Yield Target', '91%'],
              ['Loan Disbursals', '45%'],
              ['Storage Usage', '88%'],
              ['Farmer Income Growth', '12.4%'],
            ].map(([label, value]) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: value }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-4 bg-primary-fixed rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed-variant">
                verified
              </span>
              <p className="text-xs font-semibold text-on-primary-fixed-variant leading-tight">
                System health is stable across all metrics. No critical bottlenecks
                detected.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-tertiary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Live AI Anomaly Feed
            </h3>
          </div>
          <button className="text-primary-fixed-variant text-xs font-bold uppercase hover:underline">
            View Historical Archive
          </button>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {[
            [
              'Critical',
              'Haridwar',
              'Statistical Outlier: Beneficiary fund withdrawal frequency exceeds 300% of seasonal norm.',
              '14:22:01 IST',
            ],
            [
              'Alert',
              'Chamoli',
              'Geo-fencing Mismatch: Fertilizer distribution point logs outside of assigned block radius.',
              '13:58:12 IST',
            ],
            [
              'Alert',
              'Udham Singh Nagar',
              'Duplication Flag: Matching biometric hashes found in 3 separate subsidy application nodes.',
              '12:11:45 IST',
            ],
          ].map(([severity, district, reason, time]) => (
            <div
              key={`${severity}-${district}`}
              className="p-6 flex items-center gap-6 hover:bg-surface-container-low transition-colors group"
            >
              <div
                className={[
                  'flex flex-col items-center justify-center w-12 h-12 rounded-lg text-white shrink-0',
                  severity === 'Critical'
                    ? 'bg-tertiary-container'
                    : 'bg-on-tertiary-container',
                ].join(' ')}
              >
                <span className="text-xs font-bold uppercase">{severity}</span>
              </div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <p className="text-xs font-bold text-on-surface-variant uppercase">
                    District
                  </p>
                  <p className="text-sm font-semibold text-primary">{district}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase">
                    Isolation Reason
                  </p>
                  <p className="text-sm text-on-surface">{reason}</p>
                </div>
                <div className="md:col-span-1 text-right">
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    TIMESTAMP
                  </p>
                  <p className="text-xs font-bold text-on-surface">{time}</p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-surface-container-highest transition-all text-primary">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

