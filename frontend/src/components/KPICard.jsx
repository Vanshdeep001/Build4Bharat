export default function KPICard({ title, value, subtitle, icon, color = 'blue', onClick }) {
  // Use brand theme colors instead of neon
  const colors = {
    blue: { bg: 'bg-accent-cobalt/5', border: 'border-accent-cobalt/20', text: 'text-accent-cobalt' },
    green: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-600' },
    red: { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-600' },
  };

  const c = colors[color] || colors.blue;

  return (
    <div
      onClick={onClick}
      className={`bento-tile p-6 transition-all hover:scale-[1.02] cursor-pointer ${c.bg} border-2 ${c.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-label text-brand-ink">{title}</p>
          <p className="text-4xl font-display font-black leading-none text-brand-ink">{value}</p>
          {subtitle && <p className="text-label text-brand-ink/60">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl grayscale opacity-60">{icon}</span>}
      </div>
    </div>
  );
}
