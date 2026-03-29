import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const districtCoords = {
  Almora: [29.5892, 79.6467],
  Bageshwar: [29.8377, 79.7694],
  Chamoli: [30.5222, 79.4627],
  Champawat: [29.3364, 80.0963],
  Dehradun: [30.3165, 78.0322],
  Haridwar: [29.9457, 78.1642],
  Nainital: [29.3919, 79.4542],
  "Pauri Garhwal": [29.8683, 78.8383],
  Pithoragarh: [29.5822, 80.2182],
  Rudraprayag: [30.2845, 78.9818],
  "Tehri Garhwal": [30.38, 78.48],
  "Udham Singh Nagar": [28.98, 79.4],
  Uttarkashi: [30.7268, 78.4354],
};

// Recenter map when district changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

import { fetchOverview, fetchAdvanceAnalytics } from '../api';

const UttarakhandMap = ({ selectedDistrict, onDistrictSelect }) => {
  const [districtData, setDistrictData] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [stateMetrics, setStateMetrics] = useState(null);

  useEffect(() => {
    let active = true;

    const loadMapData = async () => {
      // Load district-level data
      const res = await fetchOverview();
      if (!active || !res || !res.districts) return;

      const rawData = res.districts.filter(d => !!districtCoords[d.district_name]);

      const maxAR = Math.max(...rawData.map(d => d.open_anomalies), 1);
      const maxGR = Math.max(...rawData.map(d => d.total_disputes), 1);

      const processed = rawData.map(d => {
        const normAR = (d.open_anomalies / maxAR) * 100;
        const normGR = (d.total_disputes / maxGR) * 100;
        const riskScore = 0.6 * normAR + 0.4 * normGR;
        const finalScore = Math.max(0, 100 - riskScore);

        let status = "On-Track";
        let color = "#22c55e"; 
        if (finalScore < 50) {
          status = "Critical";
          color = "#ef4444"; 
        } else if (finalScore < 80) {
          status = "At Risk";
          color = "#eab308"; 
        }

        return { 
          name: d.district_name, 
          fund: d.total_fund_utilised / 10000000, 
          ar: d.open_anomalies, 
          gr: d.total_disputes, 
          score: finalScore.toFixed(0), 
          status, 
          color 
        };
      });

      setDistrictData(processed);

      const totalFunds = processed.reduce((sum, d) => sum + d.fund, 0);
      const fundWeightedSum = processed.reduce((sum, d) => sum + (parseFloat(d.score) * d.fund), 0);
      const fundWeightedAvg = totalFunds > 0 ? fundWeightedSum / totalFunds : 100;

      const criticalCount = processed.filter(d => d.status === "Critical").length;
      const criticalRatio = criticalCount / Math.max(rawData.length, 1);

      const stateScoreValue = (0.7 * fundWeightedAvg) + (0.3 * (1 - criticalRatio) * 100);
      
      let stateStatus = "On-Track";
      let stateColor = "text-green-500";
      let stateBg = "bg-green-500/10";
      if (stateScoreValue < 50) {
        stateStatus = "Critical";
        stateColor = "text-error";
        stateBg = "bg-error/10";
      } else if (stateScoreValue < 80) {
        stateStatus = "At Risk";
        stateColor = "text-amber-500";
        stateBg = "bg-amber-500/10";
      }

      setStateMetrics({
        score: stateScoreValue.toFixed(1),
        status: stateStatus,
        color: stateColor,
        bgColor: stateBg,
        criticalCount,
        fundWeightedAvg: fundWeightedAvg.toFixed(1)
      });

      // Load block-level data for map markers
      const analytics = await fetchAdvanceAnalytics();
      if (active && analytics && analytics.block_map_data) {
        setBlockData(analytics.block_map_data);
      }
    };

    loadMapData();
    return () => { active = false; };
  }, []);

  const center =
    selectedDistrict && districtCoords[selectedDistrict]
      ? districtCoords[selectedDistrict]
      : [30.0668, 79.0193]; // Uttarakhand center
  const zoom = selectedDistrict && selectedDistrict !== "Uttarakhand" ? 9 : 8;

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-outline-variant/20 shadow-2xl relative group">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <ChangeView center={center} zoom={zoom} />

        {/* Esri World Imagery (Satellite) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {/* Block-level markers (smaller, more specific) */}
        {blockData.map((b) => {
          const isCritical = b.status === "Critical";
          const isAtRisk = b.status === "At Risk";
          
          return (
            <CircleMarker
              key={b.id}
              center={[b.lat, b.lng]}
              pathOptions={{
                fillColor: b.color,
                color: b.color,
                fillOpacity: isCritical ? 0.8 : 0.5,
                weight: isCritical ? 3 : 1.5,
                opacity: 0.7,
              }}
              radius={isCritical ? 10 : isAtRisk ? 8 : 6}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[220px] bg-surface rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline font-black text-primary text-lg leading-none">
                        {b.name}
                      </h3>
                      <p className="text-[10px] text-on-surface-variant font-bold mt-0.5">{b.district}</p>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'animate-ping' : 'animate-pulse'}`}
                      style={{ backgroundColor: b.color }}
                    ></div>
                  </div>

                  <div className="mt-3 space-y-2 border-y border-outline-variant/10 py-3 mb-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                      <span>Risk Score: </span>
                      <span className="text-sm font-black text-primary">{b.score}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                      <span>Anomalies</span>
                      <span className={`text-xs font-black ${b.anomaly_count > 0 ? 'text-error' : 'text-green-500'}`}>
                        {b.anomaly_count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                      <span>Dispute Rate</span>
                      <span className={`text-xs font-black ${b.dispute_rate > 15 ? 'text-error' : 'text-green-500'}`}>
                        {b.dispute_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                      <span>Status</span>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${b.color}20`,
                          color: b.color,
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {isCritical && (
                    <div className="p-2 bg-error/10 border border-error/20 rounded-lg mb-2 text-[10px] text-error font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">warning</span>
                      Severe anomaly — DM attention required
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* District-level markers (larger, overview) */}
        {districtData.map((d) => (
          <CircleMarker
            key={d.name}
            center={districtCoords[d.name]}
            pathOptions={{
              fillColor: d.color,
              color: d.color,
              fillOpacity: 0.3,
              weight: selectedDistrict === d.name ? 10 : 2,
              opacity: selectedDistrict === d.name ? 0.8 : 0.3,
            }}
            radius={selectedDistrict === d.name ? 22 : 16}
            eventHandlers={{
              click: () => {
                onDistrictSelect(d.name);
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[200px] bg-surface rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline font-black text-primary text-xl leading-none">
                    {d.name}
                  </h3>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: d.color }}
                  ></div>
                </div>

                <div className="mt-4 space-y-3 border-y border-outline-variant/10 py-4 mb-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    <span>Performance Score: </span>
                    <span className="text-sm font-black text-primary">
                      {d.score}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    <span>Risk Level</span>
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${d.color}20`,
                        color: d.color,
                      }}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDistrictSelect(d.name);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full bg-primary text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      visibility
                    </span>
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 z-[10] bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 shadow-lg pointer-events-none">
        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">
          Risk Assessment
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span className="text-xs font-bold text-on-surface">
              80-100: On-Track
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
            <span className="text-xs font-bold text-on-surface">
              50-79: At Risk
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span className="text-xs font-bold text-on-surface">
              0-49: Critical
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/10 space-y-1">
          <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Marker Size</p>
          <p className="text-[9px] text-on-surface-variant/60">Large ring = District</p>
          <p className="text-[9px] text-on-surface-variant/60">Small dot = Block</p>
        </div>
      </div>

      {/* Earth View Badge */}
      <div className="absolute bottom-6 left-6 z-[400] bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
          Earth Observation — Live Feed
        </span>
      </div>
    </div>
  );
};

export default UttarakhandMap;
