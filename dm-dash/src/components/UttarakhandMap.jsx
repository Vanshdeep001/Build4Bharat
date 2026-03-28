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

const UttarakhandMap = ({ selectedDistrict, onDistrictSelect }) => {
  const [districtData, setDistrictData] = useState([]);
  const [stateMetrics, setStateMetrics] = useState(null);


  useEffect(() => {
    // Current dummy data matching the CSV logic in AnalyticalOverview
    const rawData = [
      ["Almora", 1200, 0.08, 35, 120],
      ["Bageshwar", 800, 0.04, 15, 65],
      ["Chamoli", 1500, 0.07, 2, 20],
      ["Champawat", 750, 0.03, 72, 552],
      ["Dehradun", 3500, 0.25, 145, 420],
      ["Haridwar", 2800, 0.18, 10, 20],
      ["Nainital", 1800, 0.12, 75, 210],
      ["Pauri Garhwal", 1600, 0.11, 48, 145],
      ["Pithoragarh", 1400, 0.09, 38, 130],
      ["Rudraprayag", 900, 0.05, 22, 85],
      ["Tehri Garhwal", 1700, 0.1, 52, 160],
      ["Udham Singh Nagar", 2400, 0.16, 110, 340],
      ["Uttarkashi", 1350, 0.08, 32, 215],
    ];

    // Find maximums for normalization to ensure score stays 0-100
    const maxAR = Math.max(...rawData.map((d) => d[3]));
    const maxGR = Math.max(...rawData.map((d) => d[4]));

    const processed = rawData.map(([name, fund, ben, ar, gr]) => {
      // Normalizing to 0-100 for proper weighting
      const normAR = (ar / maxAR) * 100;
      const normGR = (gr / maxGR) * 100;

      // Risk Score Formula: (0.6 * AR) + (0.4 * GR)
      const riskScore = 0.6 * normAR + 0.4 * normGR;
      const finalScore = Math.max(0, 100 - riskScore);

      let status = "On-Track";
      let color = "#22c55e"; // Green
      if (finalScore < 50) {
        status = "Critical";
        color = "#ef4444"; // Red
      } else if (finalScore < 80) {
        status = "At Risk";
        color = "#eab308"; // Yellow
      }

      return { name, fund, ar, gr, score: finalScore.toFixed(0), status, color };
    });

    setDistrictData(processed);

    // Compute State Score
    const totalFunds = processed.reduce((sum, d) => sum + d.fund, 0);
    const fundWeightedSum = processed.reduce((sum, d) => sum + (parseFloat(d.score) * d.fund), 0);
    const fundWeightedAvg = fundWeightedSum / totalFunds;

    const criticalCount = processed.filter(d => d.status === "Critical").length;
    const criticalRatio = criticalCount / 13;

    // State Score Formula
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

        {/* District Markers */}
        {districtData.map((d) => (
          <CircleMarker
            key={d.name}
            center={districtCoords[d.name]}
            pathOptions={{
              fillColor: d.color,
              color: d.color,
              fillOpacity: 0.6,
              weight: selectedDistrict === d.name ? 10 : 2,
              opacity: selectedDistrict === d.name ? 0.8 : 0.4,
            }}
            radius={selectedDistrict === d.name ? 18 : 12}
            eventHandlers={{
              click: () => {
                onDistrictSelect(d.name);
                // Also scroll on marker click for better UX if the user doesn't use the popup button
                // window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <button className="w-full bg-surface-container-high text-on-surface-variant text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-outline-variant/20 transition-all border border-outline-variant/10 flex items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">
                      insights
                    </span>
                    Advanced Analytics
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* State Score Overlay */}
      {(!selectedDistrict || selectedDistrict === "Uttarakhand") && stateMetrics && (
        <div className="absolute top-4 left-4 z-[400] bg-surface/90 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/10 shadow-2xl max-w-sm animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-headline font-black text-on-surface text-xl">Uttarakhand State Score</h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Aggregate Performance Index</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${stateMetrics.bgColor} ${stateMetrics.color}`}>
              {stateMetrics.status}
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className={`text-6xl font-headline font-black ${stateMetrics.color}`}>{stateMetrics.score}</span>
            <span className="text-xl font-bold text-on-surface-variant/40">/100</span>
          </div>

          <div className="space-y-4 border-t border-outline-variant/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">Fund-Weighted Avg</span>
              <span className="text-sm font-black text-on-surface">{stateMetrics.fundWeightedAvg}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">Critical Districts Ratio</span>
              <span className="text-sm font-black text-on-surface">{stateMetrics.criticalCount} / 13</span>
            </div>
          </div>
        </div>
      )}

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
