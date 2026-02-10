'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// 1. ÍCONOS (Igual que antes, esto está bien)
const createSportIcon = (deporte: string) => {
  let emoji = '🏅';
  let color = '#334155';
  switch(deporte) {
    case 'Fútbol': emoji = '⚽'; color = '#10b981'; break;
    case 'Baloncesto': emoji = '🏀'; color = '#f59e0b'; break;
    case 'Natación': emoji = '🏊'; color = '#3b82f6'; break;
    case 'Artes Marciales': emoji = '🥋'; color = '#ef4444'; break;
    case 'Voleibol': emoji = '🏐'; color = '#8b5cf6'; break;
    case 'Atletismo': emoji = '🏃'; color = '#ec4899'; break;
    case 'Béisbol': emoji = '⚾'; color = '#f97316'; break;
    default: emoji = '📍';
  }
  return L.divIcon({
    className: 'sport-marker',
    html: `<div style="background-color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.5); border: 3px solid ${color};"><div style="transform: rotate(45deg); font-size: 16px;">${emoji}</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// 2. CONTROLADOR DE CÁMARA MEJORADO
// Ahora vigila lat y lng individualmente para ser más preciso
const MapController = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (lat && lng) {
      // Usamos flyTo para un movimiento suave y automático
      map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]); // <--- Solo se dispara si cambian estos números

  return null;
};

// 3. DETECTOR DE CLICS
const ClickDetector = ({ onMapClick }: { onMapClick: (e: any) => void }) => {
  useMapEvents({
    click(e) { onMapClick(e); },
  });
  return null;
};

// 4. COMPONENTE PRINCIPAL
const Map = ({ data, isAddingMode, onMapClick }: { data: any[], isAddingMode?: boolean, onMapClick?: (e: any) => void }) => {
  
  // Coordenada por defecto (San Salvador)
  const defaultCenter: [number, number] = [13.6929, -89.2182];
  
  // Detectamos la coordenada actual de los datos
  const currentLat = data.length > 0 && data[0].lat ? data[0].lat : defaultCenter[0];
  const currentLng = data.length > 0 && data[0].lng ? data[0].lng : defaultCenter[1];

  return (
    <MapContainer center={[currentLat, currentLng]} zoom={13} scrollWheelZoom={true} className="h-full w-full bg-[#0f172a] z-0">
      <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

      {/* AQUÍ ESTÁ EL CAMBIO: Pasamos lat y lng por separado para que el efecto las detecte bien */}
      <MapController lat={currentLat} lng={currentLng} />
      
      {onMapClick && <ClickDetector onMapClick={onMapClick} />}

      {data.map((item, idx) => (
        <Marker key={idx} position={[item.lat, item.lng]} icon={createSportIcon(item.deporte || 'Otro')}>
          <Popup>
            <div className="p-2 min-w-[200px] font-sans text-slate-900">
               <strong className="block text-sm">{item.nombre || "Ubicación"}</strong>
               {isAddingMode && <span className="text-green-600 font-bold text-xs">¡Aquí estás!</span>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;