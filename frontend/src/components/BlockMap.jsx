import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Simplified GeoJSON for demo blocks in Uttarakhand
const BLOCKS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { block_id: "dunda", name: "Dunda", district_id: "uttarkashi" },
      geometry: {
        type: "Polygon",
        coordinates: [[[78.35, 30.70], [78.55, 30.70], [78.55, 30.82], [78.35, 30.82], [78.35, 30.70]]]
      }
    },
    {
      type: "Feature",
      properties: { block_id: "bhatwari", name: "Bhatwari", district_id: "uttarkashi" },
      geometry: {
        type: "Polygon",
        coordinates: [[[78.50, 30.75], [78.72, 30.75], [78.72, 30.88], [78.50, 30.88], [78.50, 30.75]]]
      }
    },
    {
      type: "Feature",
      properties: { block_id: "purola", name: "Purola", district_id: "uttarkashi" },
      geometry: {
        type: "Polygon",
        coordinates: [[[78.00, 30.82], [78.22, 30.82], [78.22, 30.95], [78.00, 30.95], [78.00, 30.82]]]
      }
    },
    {
      type: "Feature",
      properties: { block_id: "gopeshwar", name: "Gopeshwar", district_id: "chamoli" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.20, 30.34], [79.42, 30.34], [79.42, 30.48], [79.20, 30.48], [79.20, 30.34]]]
      }
    },
    {
      type: "Feature",
      properties: { block_id: "joshimath", name: "Joshimath", district_id: "chamoli" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.45, 30.48], [79.67, 30.48], [79.67, 30.62], [79.45, 30.62], [79.45, 30.48]]]
      }
    },
    {
      type: "Feature",
      properties: { block_id: "karnaprayag", name: "Karnaprayag", district_id: "chamoli" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.10, 30.18], [79.32, 30.18], [79.32, 30.32], [79.10, 30.32], [79.10, 30.18]]]
      }
    },
  ],
};

function getBlockColor(blockSummary, blockId) {
  const block = blockSummary?.find(b => b.block_id === blockId);
  if (!block) return { fill: '#3378ff', border: '#5590ff' };
  const count = block.anomaly_count || 0;
  if (count >= 3) return { fill: '#f43f5e', border: '#fb7185' };
  if (count >= 1) return { fill: '#f59e0b', border: '#fbbf24' };
  return { fill: '#10b981', border: '#34d399' };
}

export default function BlockMap({ blockSummary = [], districtId, onBlockClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const center = districtId === 'chamoli' ? [30.42, 79.35] : districtId === 'uttarkashi' ? [30.82, 78.45] : [30.55, 78.9];
      const zoom = districtId ? 9 : 8;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, zoom);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;

      // Filter GeoJSON by district if needed
      const features = districtId
        ? BLOCKS_GEOJSON.features.filter(f => f.properties.district_id === districtId)
        : BLOCKS_GEOJSON.features;

      const filteredGeoJSON = { ...BLOCKS_GEOJSON, features };

      const layer = L.geoJSON(filteredGeoJSON, {
        style: (feature) => {
          const colors = getBlockColor(blockSummary, feature.properties.block_id);
          return {
            fillColor: colors.fill,
            color: colors.border,
            weight: 2,
            fillOpacity: 0.35,
            opacity: 0.8,
          };
        },
        onEachFeature: (feature, layer) => {
          const block = blockSummary?.find(b => b.block_id === feature.properties.block_id);
          const anomalies = block?.anomaly_count ?? 0;
          const status = block?.status ?? 'unknown';

          layer.bindPopup(`
            <div style="font-family: Inter, sans-serif; min-width: 140px;">
              <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${feature.properties.name}</p>
              <p style="font-size: 11px; color: #94a3b8;">Anomalies: <b style="color: ${anomalies >= 3 ? '#f43f5e' : anomalies >= 1 ? '#f59e0b' : '#10b981'}">${anomalies}</b></p>
              <p style="font-size: 11px; color: #94a3b8;">Status: <b>${status}</b></p>
            </div>
          `);

          layer.on('click', () => {
            if (onBlockClick) onBlockClick(feature.properties.block_id);
          });

          layer.on('mouseover', () => {
            layer.setStyle({ fillOpacity: 0.55, weight: 3 });
          });
          layer.on('mouseout', () => {
            layer.setStyle({ fillOpacity: 0.35, weight: 2 });
          });
        },
      }).addTo(map);

      layerRef.current = layer;

      if (features.length > 0) {
        map.fitBounds(layer.getBounds().pad(0.1));
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [blockSummary, districtId]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl border border-slate-700/50 overflow-hidden"
    />
  );
}
