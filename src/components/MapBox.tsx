"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createDotIcon = () => new L.DivIcon({
  className: 'custom-map-dot',
  html: `<div style="width: 14px; height: 14px; background: #d9b84f; border-radius: 50%; box-shadow: 0 0 15px rgba(217,184,79,0.8); display: flex; justify-content: center; align-items: center;"><div style="width: 6px; height: 6px; background: #000; border-radius: 50%;"></div></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const createPlaneIcon = () => new L.DivIcon({
  className: 'custom-map-plane',
  html: `<div style="width: 36px; height: 36px; background: rgba(0,0,0,0.7); border: 1px solid rgba(217,184,79,0.4); border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 20px rgba(217,184,79,0.2); backdrop-filter: blur(4px);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="#d9b84f" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); color: #d9b84f;"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-.5-.5-2.5 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L2.5 9l8.1 4.5L6 18l-3 1 1.5 2.5 4-1.5 2.5 1.5 1-3 4.5-8.1 2.2 8.1c.4.2.7-.2.6-.7z"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function MapUpdater({ origin, dest }: { origin: [number, number], dest: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([origin, dest]);
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    setTimeout(() => { map.invalidateSize(); }, 400);
  }, [origin, dest, map]);
  return null;
}

export default function MapBox({ origin, dest }: { origin: [number, number], dest: [number, number] }) {
  const center = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2] as [number, number];

  return (
    <MapContainer
      center={center}
      zoom={5}
      zoomControl={false}
      attributionControl={false} 
      dragging={true}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", background: "#090a0c" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Polyline positions={[origin, dest]} pathOptions={{ color: '#d9b84f', weight: 2, dashArray: '5, 8', opacity: 0.7 }} />
      <Marker position={origin} icon={createDotIcon()} />
      <Marker position={dest} icon={createDotIcon()} />
      <Marker position={center} icon={createPlaneIcon()} />
      <MapUpdater origin={origin} dest={dest} />
    </MapContainer>
  );
}