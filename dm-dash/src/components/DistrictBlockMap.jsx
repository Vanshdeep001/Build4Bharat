import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchAdvanceAnalytics } from "../api";

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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}




const DistrictBlockMap = ({ selectedDistrict }) => {
  const [blockData, setBlockData] = useState([]);
  const [activeBlock, setActiveBlock] = useState(null);

  const center =
    selectedDistrict && districtCoords[selectedDistrict]
      ? districtCoords[selectedDistrict]
      : [30.0668, 79.0193]; // Default to Uttarakhand center

  // Zoom level 10 gives a good block-level view for a district
  const zoom = selectedDistrict && selectedDistrict !== "Uttarakhand" ? 10 : 8;

  useEffect(() => {
    let active = true;
    fetchAdvanceAnalytics().then((res) => {
      if (!active || !res || !res.block_map_data) return;
      let data = res.block_map_data;
      if (selectedDistrict && selectedDistrict !== "Uttarakhand") {
        data = data.filter((d) => d.district === selectedDistrict);
      }
      setBlockData(data);
    }).catch(console.error);

    return () => {
      active = false;
    };
  }, [selectedDistrict]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-outline-variant/20 shadow-2xl relative group">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {blockData.map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            pathOptions={{
              fillColor: d.color,
              color: d.color,
              fillOpacity: 0.6,
              weight: activeBlock === d.id ? 10 : 2,
              opacity: activeBlock === d.id ? 0.8 : 0.4,
            }}
            radius={activeBlock === d.id ? 15 : 10}
            eventHandlers={{
              click: () => setActiveBlock(d.id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[200px] bg-surface rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline font-black text-primary text-lg leading-none">
                    {d.name}
                  </h3>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: d.color }}
                  ></div>
                </div>

                <div className="mt-4 space-y-3 border-y border-outline-variant/10 py-4 mb-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    <span>Block Score: </span>
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
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 z-[20] bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 shadow-lg pointer-events-none">
        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">
          Block Assessment
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span className="text-xs font-bold text-on-surface">80-100: On-Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
            <span className="text-xs font-bold text-on-surface">50-79: At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span className="text-xs font-bold text-on-surface">0-49: Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictBlockMap;
