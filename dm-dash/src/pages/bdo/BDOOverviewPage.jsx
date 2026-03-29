import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBDOOverview, explainAnomaly } from '../../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { io } from 'socket.io-client';
import { useAnomalies } from '../../context/AnomalyContext';
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HoverAnomalyMarker = ({ anomaly, color, icon }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHover = async () => {
    if (aiInsight || loading) return;
    setLoading(true);
    try {
      const resp = await explainAnomaly(anomaly.type, anomaly.agent, anomaly.details);
      setAiInsight(resp?.explanation || 'AI analysis unavailable.');
    } catch (e) {
      setAiInsight('Unable to fetch AI risk assessment.');
    }
    setLoading(false);
  };

  return (
    <Marker 
      position={anomaly.coordinates} 
      icon={icon}
      eventHandlers={{ mouseover: handleHover }}
    >
      <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
        <div className="w-72 p-1 font-body whitespace-normal">
          <div className="text-xs font-black uppercase tracking-widest border-b pb-1 mb-2 flex items-center gap-1.5" style={{ color: color, borderColor: `${color}40` }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            {anomaly.type}
          </div>
          <div className="font-bold text-[#00113a] mb-1">{anomaly.agent}</div>
          <div className="text-gray-600 text-xs italic mb-2">{anomaly.details}</div>
          
          <div className="bg-surface border border-outline-variant/20 rounded-lg p-2 mt-2">
            {loading ? (
               <div className="text-xs font-semibold text-primary animate-pulse flex items-center gap-1">
                 <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Analyzing Risk...
               </div>
            ) : aiInsight ? (
               <div className="text-[11px] leading-relaxed text-[#00113a]">
                 <strong className="flex items-center gap-1 text-primary mb-1 text-[10px] uppercase font-bold"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> AI Insight</strong>
                 {aiInsight}
               </div>
            ) : (
               <div className="text-[10px] text-gray-400 italic">Hover to stream AI risk analysis</div>
            )}
          </div>
        </div>
      </LeafletTooltip>
    </Marker>
  );
};

export function BDOOverviewPage() {
  const { selectedBlock } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { anomalies } = useAnomalies();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBDOOverview(selectedBlock).then(res => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => mounted = false;
  }, [selectedBlock]);

  useEffect(() => {
    const socket = io('http://localhost:8000');
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        socket.emit('join_district', { district_id: user.district_id });
      } catch(e) {}
    }

    socket.on('new_visit_completed', (payload) => {
      if (payload.block_id === selectedBlock) {
        setData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            metrics: {
              ...prev.metrics,
              completed: prev.metrics.completed + 1,
              pending: Math.max(0, prev.metrics.pending - 1)
            },
            today: {
              ...prev.today,
              completed: prev.today.completed + 1,
              pending: Math.max(0, prev.today.pending - 1)
            }
          };
        });
      }
    });

    return () => socket.disconnect();
  }, [selectedBlock]);

  if (loading) {
    return <div className="text-white flex items-center justify-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-[#758dd5]">sync</span></div>;
  }

  if (!data) {
    return <div className="text-red-400">Failed to load overview data.</div>;
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, yellow, red

  // Sort anomalies: low -> medium -> high so high renders LAST (on top)
  const severityOrder = { low: 0, medium: 1, high: 2 };
  const sortedAnomalies = [...anomalies]
    .filter(a => a.coordinates)
    .sort((a, b) => (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0));

  return (
    <div className="space-y-6">
      <header className="mb-10 space-y-1">
        <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">
          Block Operations Overview
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
            Real-time tracking feed — {selectedBlock}
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Scheduled Visits", value: data.metrics.totalScheduled, icon: "event_note", bgHover: "group-hover:bg-primary" },
          { label: "Completed Visits", value: data.metrics.completed, icon: "check_circle", bgHover: "group-hover:bg-green-600" },
          { label: "Pending Visits", value: data.metrics.pending, icon: "hourglass_empty", bgHover: "group-hover:bg-amber-500" },
          { label: "Missed Visits", value: data.metrics.missed, icon: "cancel", bgHover: "group-hover:bg-error" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-surface border border-outline-variant/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-start justify-between mb-8 relative">
              <div className={`w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant ${metric.bgHover} group-hover:text-white transition-all`}>
                <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
              </div>
            </div>
            <div className="space-y-1 relative">
              <p className="text-[0.65rem] font-black text-on-surface-variant/40 uppercase tracking-[0.15em]">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-headline font-black text-on-surface">{metric.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Work Summary */}
        <div className="bg-surface border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">today</span>
            Today's Quick Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <span className="text-on-surface-variant font-bold text-sm">Active Agents Today</span>
              <span className="text-on-surface font-black text-lg">{data.today.activeAgents}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <span className="text-on-surface-variant font-bold text-sm">Tasks Scheduled Today</span>
              <span className="text-on-surface font-black text-lg">{data.today.scheduled}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <span className="text-on-surface-variant font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Completed Today</span>
              <span className="text-on-surface font-black text-lg">{data.today.completed}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <span className="text-on-surface-variant font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Pending Today</span>
              <span className="text-on-surface font-black text-lg">{data.today.pending}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-surface border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight mb-6">Completion Percentage</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#00113a', borderColor: '#ffffff20', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-sm">
         <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">public</span>
              Live Geolocation Tracking
            </div>
            {anomalies.filter(a => a.coordinates && a.severity === 'high').length > 0 && (
              <span className="text-[10px] bg-error/10 text-error px-3 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse border border-error/20">
                {anomalies.filter(a => a.coordinates && a.severity === 'high').length} Critical Alerts
              </span>
            )}
         </h2>
         <div className="h-[400px] w-full rounded-3xl border border-outline-variant/10 shadow-inner overflow-hidden relative z-0">
           {typeof window !== 'undefined' && (
             <MapContainer center={[30.3165, 78.0322]} zoom={13} style={{ height: '100%', width: '100%' }}>
               <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                 attribution='&copy; CARTO'
               />
               {sortedAnomalies.map((anomaly, index) => {
                  let color = '#3b82f6';
                  if (anomaly.severity === 'high') color = '#ef4444';
                  else if (anomaly.severity === 'medium') color = '#f59e0b';

                  // Larger jitter so markers at same coords are visually separated
                  const latJit = anomaly.severity === 'high' ? 0.001 : (anomaly.severity === 'medium' ? -0.001 : 0.0015);
                  const lngJit = anomaly.severity === 'high' ? 0.0005 : (index % 2 === 0 ? -0.001 : 0.001);
                  const offsetCoords = [anomaly.coordinates[0] + latJit, anomaly.coordinates[1] + lngJit];

                  const sz = anomaly.severity === 'high' ? 20 : 14;
                  const icon = L.divIcon({
                    className: 'custom-leaflet-marker',
                    html: `<div style="background:${color};width:${sz}px;height:${sz}px;border-radius:50%;border:3px solid white;box-shadow:0 0 14px ${color};"></div>`,
                    iconSize: [sz, sz],
                    iconAnchor: [sz/2, sz/2]
                  });

                  return <HoverAnomalyMarker key={anomaly.id} anomaly={{...anomaly, coordinates: offsetCoords}} color={color} icon={icon} />;
               })}
             </MapContainer>
           )}
         </div>
      </div>
    </div>
  );
}
