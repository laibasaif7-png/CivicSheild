import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Pin icon setup
const icon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
});

const MapComponent = ({ reports }) => {
  // Toba Tek Singh Center
  const position = [30.9711, 72.4828];

  return (
    <div className="rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white h-100 mb-8 z-0">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {reports && reports.map((report) => (
          report.lat && report.lng && (
            <Marker key={report._id} position={[report.lat, report.lng]} icon={icon}>
              <Popup>
                <div className="font-sans p-2">
                  <h4 className="font-bold text-blue-600">{report.title}</h4>
                  <p className="text-[10px] text-slate-500">{report.location}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;