export default function AnomalyAlert({ anomaly, onAction }) {
  const typeColors = {
    fund_ahead_of_progress: { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
    high_dispute_rate: { bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400' },
    cost_outlier: { bg: 'bg-primary-500/10', text: 'text-primary-400', badge: 'bg-primary-500/20 text-primary-400' },
    inactivity_gap: { bg: 'bg-slate-500/10', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-400' },
    location_mismatch: { bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400' },
  };

  const c = typeColors[anomaly.anomaly_type] || typeColors.inactivity_gap;
  const blockName = anomaly.block_id?.charAt(0).toUpperCase() + anomaly.block_id?.slice(1);

  return (
    <div className={`${c.bg} border border-slate-700/50 rounded-xl p-4 transition-all hover:border-slate-600/50`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{blockName}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
            {anomaly.anomaly_type?.replace(/_/g, ' ')}
          </span>
        </div>
        <span className={`text-xs font-bold ${anomaly.status === 'open' ? 'text-rose-400' : 'text-emerald-400'}`}>
          {anomaly.status?.toUpperCase()}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Anomaly Score</span>
          <span className={`text-xs font-bold ${c.text}`}>{anomaly.anomaly_score}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all"
            style={{ width: `${anomaly.anomaly_score}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{anomaly.explanation}</p>

      {/* Actions */}
      {anomaly.status === 'open' && onAction && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction(anomaly._id || anomaly.id, 'reviewed', 'Funds frozen')}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition font-medium"
          >
            Freeze Funds
          </button>
          <button
            onClick={() => onAction(anomaly._id || anomaly.id, 'reviewed', 'Inspection scheduled')}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition font-medium"
          >
            Schedule Inspection
          </button>
          <button
            onClick={() => onAction(anomaly._id || anomaly.id, 'resolved', 'Marked resolved')}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition font-medium"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}
