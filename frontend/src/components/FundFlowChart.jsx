import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FundFlowChart({ fundByScheme = [] }) {
  const data = {
    labels: fundByScheme.map(s => s.scheme_name || 'Unknown'),
    datasets: [
      {
        label: 'Released (₹)',
        data: fundByScheme.map(s => s.released || 0),
        backgroundColor: 'rgba(51, 120, 255, 0.6)',
        borderColor: 'rgba(51, 120, 255, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Utilised (₹)',
        data: fundByScheme.map(s => s.utilised || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${(ctx.raw / 100000).toFixed(1)}L`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
          callback: (v) => `₹${(v / 100000).toFixed(0)}L`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="bg-surface-card border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Fund Flow by Scheme</h3>
      <div className="h-[250px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
