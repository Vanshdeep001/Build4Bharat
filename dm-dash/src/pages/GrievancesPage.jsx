export function GrievancesPage() {
  return (
    <div className="p-8 space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/15 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2 block">
            Resolution Center
          </span>
          <h2 className="text-4xl font-black text-primary leading-none">Farmer Grievances</h2>
          <p className="text-on-surface-variant mt-2 max-w-md">
            Real-time intelligence feed monitoring complaints from rural agricultural hubs via
            multimodal channels.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 min-w-[160px]">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-headline">42</div>
              <div className="text-xs text-on-surface-variant">Active Now</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 min-w-[160px]">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-headline">09</div>
              <div className="text-xs text-on-surface-variant">Critical Conflict</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">stream</span>
              Incoming Feed
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                Sort: Newest First
              </span>
            </div>
          </div>

          {[
            [
              'Rameshwar Prasad',
              'Jalgaon Block',
              '14 mins ago',
              'Verified',
              'bg-[#dbe1ff] text-[#00174a]',
              '"The DBT transfer for the current season\'s seeds has not reflected in my bank account yet. My neighbor received it 3 days ago. Application ID: 982231."',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCBfODJwtwd6Str3zkIggI3vWYW1_Kjk8ubTmq5B-yofosl9j3Cidapzlo0_PEPRFAwaaKZGcCUV8rLO23ITK4jq-lgzmHPxURtCq8XXZE93dJSf2SkQxGm53LkWCSOUt0QGjOAWgNGiCpssmnQPMUG8JeReYCQ_trMx-f4zT4JL-gIk1fwurYOtqmM8sx-fqigiJyXqAz2c0NnK2ZG4pFWNNsYtQAcGRCMOR6fiC4nVwKSAmrwU4LxQkRBzCWyICtRPlDHRDhpDCA',
            ],
            [
              'Laxmi Bai',
              'Sumerpur Block',
              '1 hour ago',
              'Conflict',
              'bg-error-container text-on-error-container',
              '"Farmer reports crop loss in North plot due to pest infestation. Officer report #442 claims \'Normal Yield\' with no visible damage. Verification required."',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAKHQD-DoMHkqVxCA5kc5Smi-acYI4HXpgg9L1CcvA_UDTUi00cP1WmOBR2UvqZxlQKD9-QdyyU7Gkqf0G8ZXC1PDHZLLeheaTzz2yiHC0wphL7WC0-zcRJNNqfUVXvzBK_AUY816eyl1Vo2oYBI2V0pdc7dtGTkWzJJST8f9FQF15-Rm_uYRqRGYI-aZ-_81ly69jgN_fE8KUb9msWx2o4hkzklJs-KX68oqmyveWZS8fjiwvTNxxgjTLoNHKR4QJ3P8oAehoM4qY',
            ],
            [
              'Suresh Hegde',
              'Gokarna Hub',
              '3 hours ago',
              'Pending',
              'bg-surface-container-highest text-on-surface-variant',
              '"Need assistance with the new soil testing lab schedule. No updates received on registered mobile number."',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuD_lQ7iE6LEYMjWVLlLXW-HBB7ixDARqYEK9FOUefeONHm0eX46An2ldoZTbUqvKeYEkO5HflkydThH9nNNqoWM1jz8Afrhx7FAfFEWpwEBHK7mKVpXD2jIHg_DWbrill7C7qOVfnnr3mLkcQ0pDO2JhYqgG9NOrRWvnxPNOCpFOM6rUXQ_6S7ZdUTrBBPL0RozePbGr7Y1rKLligGOJfTSuY4gPCMx9kYuDDu85jU7sZK_t_GDkuq3xZvF97vVHS66ZwLk9_YheU8',
            ],
          ].map(([name, place, time, status, badgeClass, quote, avatar]) => (
            <div
              key={name}
              className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-surface-container-low group cursor-pointer border border-transparent hover:border-outline-variant/20"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    alt="Farmer Portrait"
                    className="w-12 h-12 rounded-full object-cover bg-slate-100"
                    src={avatar}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px]">
                      chat
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-primary">{name}</h4>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                        <span>{place}</span>
                        <span>•</span>
                        <span>{time}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${badgeClass}`}>
                      <span className="material-symbols-outlined text-xs">
                        {status === 'Verified' ? 'verified' : status === 'Conflict' ? 'warning' : 'hourglass_empty'}
                      </span>
                      {status}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-surface rounded-lg border-l-4 border-primary/20 italic text-on-surface-variant text-sm">
                    {quote}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-container transition-colors flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        Assign
                      </button>
                      <button className="px-4 py-2 bg-white border border-outline-variant/30 text-on-surface text-xs font-bold rounded-md hover:bg-surface-container-low transition-colors">
                        Verify
                      </button>
                    </div>
                    <button className="text-error font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Hot Zones</h3>
              <span className="material-symbols-outlined text-outline">map</span>
            </div>
            <div className="relative h-64 w-full bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/15">
              <img
                alt="Map View"
                className="w-full h-full object-cover opacity-60 grayscale contrast-125"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzw5FMPoEQxl6hwMWSjSNsNtKF8q9F09URXCMywyK2b_WZBujXYqFqHw0nlJ65y70tDdV666f0ATPsVh_ka_zRYO3NZerVwoHb61BD3t4pj5hT9r_hV5q4lsPwYh1v3atTuZ3WVeh4f2ml0-iJa63FiEUVrA6jBigxOukdaqqm4_GG8r0v3kZmtduHwn-WB-wHTrdu4UwgmD0Y2N5TNOEmsg8j6A_e1nCemAVFOO8WtQ_D_fX0Yz_MEjwHw1KPnvGptTYbMAlb1pk"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/40"></div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary">
                DISTRICT 12-B
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Sumerpur Block</span>
                <span className="font-bold text-error">Critical</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full">
                <div className="w-4/5 h-full bg-error rounded-full"></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Jalgaon Block</span>
                <span className="font-bold text-primary">Moderate</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full">
                <div className="w-2/5 h-full bg-primary rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white rounded-xl p-6 shadow-xl shadow-primary/10">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-white">fact_check</span>
              Field Cross-Verification
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-1 h-10 bg-primary-fixed-dim rounded-full"></div>
                <div>
                  <p className="text-[11px] font-medium text-white/60">FIELD OFFICER: ADITYA K.</p>
                  <p className="text-xs font-bold leading-tight mt-1">
                    Grievance #901 flagged for conflict. Discrepancy in irrigation logs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-10 bg-on-primary-container rounded-full"></div>
                <div>
                  <p className="text-[11px] font-medium text-white/60">AUTO-GEN: SYSTEM</p>
                  <p className="text-xs font-bold leading-tight mt-1">
                    DBT records match Rameshwar Prasad’s account details. Approval pending.
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
              Audit Full Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

