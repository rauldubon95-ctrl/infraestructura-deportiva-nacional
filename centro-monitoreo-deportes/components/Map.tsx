'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface Academia {
  id: number;
  nombre: string;
  deporte: string;
  infraestructura: string;
  usuarios: number;
  lat: number;
  lng: number;
}

// Iconos Visuales (Emojis Deportivos)
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
    default: emoji = '📍';
  }

  return L.divIcon({
    className: 'sport-marker',
    html: `
      <div style="
        background-color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        border: 3px solid ${color};
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">${emoji}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const ClickDetector = ({ onMapClick, isAddingMode }: { onMapClick: (lat: number, lng: number) => void, isAddingMode: boolean }) => {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return isAddingMode ? <style>{`.leaflet-container { cursor: crosshair !important; }`}</style> : null;
};

const center: [number, number] = [13.794185, -88.89653];

const Map = ({ data, isAddingMode, onMapClick }: { data: Academia[], isAddingMode?: boolean, onMapClick?: (lat: number, lng: number) => void }) => {
  return (
    <MapContainer center={center} zoom={9} scrollWheelZoom={true} className="h-full w-full bg-[#0f172a]">
      {/* Capa Satelital ESRI */}
      <TileLayer
        attribution='Tiles &copy; Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      {/* Capa de Etiquetas (Calles/Nombres) para ubicarse mejor */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      />

      {onMapClick && isAddingMode !== undefined && (
        <ClickDetector onMapClick={onMapClick} isAddingMode={isAddingMode} />
      )}

      {data.map((item) => (
        <Marker key={item.id} position={[item.lat, item.lng]} icon={createSportIcon(item.deporte)}>
          <Popup>
            <div className="p-2 min-w-[200px] font-sans">
              <div className="flex items-center gap-2 border-b pb-2 mb-2">
                 <span className="text-xl">{item.deporte === 'Fútbol' ? '⚽' : '📍'}</span>
                 <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{item.nombre}</h3>
                    <p className="text-[10px] text-slate-500 uppercase">ID: {item.id}</p>
                 </div>
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                 <p><strong>Infraestructura:</strong> {item.infraestructura}</p>
                 <p><strong>Aforo:</strong> {item.usuarios} atletas</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;