import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { fetchTrains, fetchTrainStats } from '../utils/api';
import { Navigation, Clock, AlertTriangle, Train } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Custom Map Marker Icons
const createMarkerIcon = (color, pulse = false) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="relative flex items-center justify-center w-4 h-4">
          ${pulse ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-${color}-400"></span>` : ''}
          <span class="relative inline-flex rounded-full w-3 h-3 bg-${color}-500 border border-${color}-300"></span>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const LiveMap = () => {
  const [trains, setTrains] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for map demonstration since we might not have a backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        
        setStats({ totalTrains: 482, onTime: 390, delayed: 92, avgDelay: '14 min' });
        
        // Mock trains around India
        setTrains([
          { id: 1, name: 'Rajdhani Express', number: '12951', lat: 28.6139, lng: 77.2090, delay: 0, speed: 110, nextStation: 'New Delhi' },
          { id: 2, name: 'Shatabdi Express', number: '12004', lat: 26.8467, lng: 80.9462, delay: 15, speed: 90, nextStation: 'Lucknow' },
          { id: 3, name: 'Vande Bharat', number: '22436', lat: 25.3176, lng: 82.9739, delay: 5, speed: 130, nextStation: 'Varanasi' },
          { id: 4, name: 'Howrah Mail', number: '12809', lat: 22.5726, lng: 88.3639, delay: 45, speed: 70, nextStation: 'Howrah' },
          { id: 5, name: 'Duronto Express', number: '12245', lat: 19.0760, lng: 72.8777, delay: 120, speed: 0, nextStation: 'Mumbai Central' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getDelayColor = (delay) => {
    if (delay === 0) return 'green';
    if (delay < 30) return 'amber';
    return 'red';
  };

  if (loading) return <LoadingSkeleton count={1} type="card" />;

  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Top Stats Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-full px-6 py-3 shadow-lg flex gap-8 items-center">
        <div className="flex items-center gap-2">
          <Train size={16} className="text-gray-400" />
          <span className="text-sm font-medium"><span className="text-white font-bold">{stats?.totalTrains}</span> Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium"><span className="text-white font-bold">{stats?.onTime}</span> On Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium"><span className="text-white font-bold">{stats?.delayed}</span> Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm font-medium">Avg Delay: <span className="text-red-400 font-bold">{stats?.avgDelay}</span></span>
        </div>
      </div>

      {/* Map */}
      <MapContainer 
        center={[22.5, 82]} 
        zoom={5} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Draw a mock corridor polyline */}
        <Polyline positions={[[28.6139, 77.2090], [26.8467, 80.9462], [25.3176, 82.9739], [22.5726, 88.3639]]} color="#3b82f6" weight={2} opacity={0.3} dashArray="5, 5" />

        {trains.map(train => {
          const color = getDelayColor(train.delay);
          return (
            <Marker 
              key={train.id} 
              position={[train.lat, train.lng]}
              icon={createMarkerIcon(color, train.delay === 0)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{train.number}</h3>
                      <p className="text-xs text-gray-500">{train.name}</p>
                    </div>
                    {train.delay > 0 ? (
                      <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded font-bold">{train.delay}m late</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-bold">On Time</span>
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3 border-t border-gray-100 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Navigation size={12}/> Speed</span>
                      <span className="font-medium text-gray-900">{train.speed} km/h</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Clock size={12}/> Next</span>
                      <span className="font-medium text-gray-900">{train.nextStation}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Right Sidebar List */}
      <div className="absolute top-4 right-4 bottom-4 w-72 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl flex flex-col shadow-2xl z-[400] overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Most Delayed
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {[...trains].sort((a,b) => b.delay - a.delay).map(train => (
            <div key={train.id} className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg cursor-pointer border border-transparent hover:border-gray-700 transition-colors group">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{train.number}</span>
                <span className={`text-xs font-bold ${train.delay > 30 ? 'text-red-400' : train.delay > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {train.delay > 0 ? `+${train.delay}m` : 'On Time'}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">{train.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
