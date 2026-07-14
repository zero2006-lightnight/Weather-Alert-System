import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import { HiLocationMarker, HiOutlineLocationMarker } from 'react-icons/hi';
import toast from 'react-hot-toast';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
};

const layerOptions = [
  { id: 'standard', name: 'Standard', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
  { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
];

const WeatherMap = () => {
  const { user, profile } = useAuth();
  const [activeLayer, setActiveLayer] = useState('standard');
  const [detecting, setDetecting] = useState(false);
  const [locationName, setLocationName] = useState('');

  // Default to user's profile location or center of India
  const defaultLat = profile?.latitude || 20.5937;
  const defaultLon = profile?.longitude || 78.9629;

  const [mapCenter, setMapCenter] = useState([defaultLat, defaultLon]);
  const [zoom, setZoom] = useState(profile?.latitude ? 12 : 5);

  // Auto-detect location on mount if profile has coordinates
  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      setMapCenter([profile.latitude, profile.longitude]);
      setZoom(12);
      setLocationName(`${profile.village || ''}, ${profile.district || ''}, ${profile.state || ''}`.replace(/^,\s*|,\s*$/g, ''));
    }
  }, [profile]);

  // Detect current location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    toast.loading('Detecting your location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setZoom(13);

        // Use profile location name if available
        const name = profile?.village
          ? `${profile.village}, ${profile.district}, ${profile.state}`
          : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocationName(name);

        toast.success('Location detected!', { id: 'geo' });
        setDetecting(false);
      },
      (error) => {
        setDetecting(false);
        let msg = 'Unable to detect location';
        if (error.code === 1) msg = 'Location permission denied. Please allow location access.';
        else if (error.code === 2) msg = 'Location unavailable. Try again.';
        else if (error.code === 3) msg = 'Location request timed out. Try again.';
        toast.error(msg, { id: 'geo' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [profile]);

  // Auto-detect on first load if no profile location
  useEffect(() => {
    if (!profile?.latitude && !profile?.longitude) {
      detectLocation();
    }
  }, [profile?.latitude, profile?.longitude, detectLocation]);

  const activeLayerConfig = layerOptions.find((l) => l.id === activeLayer);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiLocationMarker className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Weather Map
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Interactive weather map for your farm location
                </p>
              </div>
            </div>
            <button
              onClick={detectLocation}
              disabled={detecting}
              className="btn-primary !py-2 !px-4 text-sm flex items-center space-x-2"
              aria-label="Detect my current location"
            >
              {detecting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineLocationMarker className="w-4 h-4" />
              )}
              <span>{detecting ? 'Detecting...' : 'My Location'}</span>
            </button>
          </div>
        </motion.div>

        {/* Layer Selector */}
        <div className="glass-card p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {layerOptions.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                aria-pressed={activeLayer === layer.id}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeLayer === layer.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-2 h-[600px] overflow-hidden"
        >
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            className="h-full w-full rounded-xl"
            zoomControl={true}
          >
            <MapController center={mapCenter} zoom={zoom} />
            <TileLayer
              url={activeLayerConfig.url}
              attribution={activeLayerConfig.attribution}
            />
            <Marker position={mapCenter}>
              <Popup>
                <div className="text-center min-w-[150px]">
                  <p className="font-semibold text-gray-800">📍 {locationName || 'Your Location'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mapCenter[0].toFixed(4)}°N, {mapCenter[1].toFixed(4)}°E
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Accuracy: {mapCenter[0] !== defaultLat || mapCenter[1] !== defaultLon ? 'GPS' : 'Profile'}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </motion.div>

        {/* Map Info */}
        <div className="glass-card p-4 mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 dark:text-gray-400">📍 Current View:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {locationName || `${mapCenter[0].toFixed(4)}, ${mapCenter[1].toFixed(4)}`}
              </span>
            </div>
            <span className="text-gray-400">
              Layer: <span className="font-medium text-gray-600 dark:text-gray-300">{activeLayerConfig?.name}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;
