export default function GrievanceFeed({ verifications = [] }) {
  const stars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="bg-surface-card border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Farmer Verifications</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {verifications.length === 0 ? (
          <p className="text-xs text-slate-500">No verifications yet</p>
        ) : (
          verifications.map((v, i) => (
            <div
              key={v._id || i}
              className="p-3 rounded-lg bg-surface-elevated border border-slate-700/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {v.farmer_id ? `Farmer ${v.farmer_id.slice(-4)}` : 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {v.block_id?.charAt(0).toUpperCase() + v.block_id?.slice(1)} • {v.channel?.toUpperCase()}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    v.benefit_received
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {v.benefit_received ? 'RECEIVED' : 'DISPUTED'}
                </span>
              </div>

              {v.quality_rating > 0 && (
                <p className="text-amber-400 text-xs mt-1.5">{stars(v.quality_rating)}</p>
              )}

              {v.issue_description && (
                <p className="text-xs text-slate-400 mt-1.5 italic">"{v.issue_description}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
