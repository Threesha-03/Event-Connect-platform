import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom purple marker
const createCustomIcon = () => L.divIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(124,58,237,0.4);
  "></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Click handler for admin map
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// View-only map for event details
export const EventMap = ({ latitude, longitude, venueName, venueAddress }) => {
  if (!latitude || !longitude) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: '300px' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={createCustomIcon()}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{venueName}</p>
                <p className="text-gray-500">{venueAddress}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
      >
        🗺️ Get Directions on Google Maps
      </a>
    </div>
  );
};

// Admin map with click-to-select
export const AdminMap = ({ latitude, longitude, onLocationSelect }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const center = latitude && longitude ? [latitude, longitude] : defaultCenter;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700" style={{ height: '350px' }}>
      <MapContainer
        center={center}
        zoom={latitude ? 14 : 5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {latitude && longitude && (
          <Marker position={[latitude, longitude]} icon={createCustomIcon()}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default EventMap;
