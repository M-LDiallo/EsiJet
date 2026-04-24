"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createDotIcon = () => {
  return L.divIcon({
    className: "custom-dot-icon",
    html: `<div style="background-color: #d9b84f; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #000; box-shadow: 0 0 10px rgba(217,184,79,0.8);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

function MapUpdater({ origin, dest }: { origin: [number, number]; dest: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !dest) return;

    const bounds = L.latLngBounds([origin, dest]);
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });

    // Sécurité Anti-Crash : On vérifie que la carte existe toujours avant d'actualiser
    const timeout = setTimeout(() => {
      // @ts-ignore
      if (map && map._leaflet_id) {
        map.invalidateSize();
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [origin, dest, map]);

  return null;
}

export default function MapBox({ origin, dest }: { origin: [number, number]; dest: [number, number] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !origin || !dest) return null;

  // Clé unique pour forcer le rechargement propre de la carte sans erreur "reused"
  const mapKey = `map-${origin[0]}-${dest[0]}`;

  return (
    <MapContainer
      key={mapKey}
      center={origin}
      zoom={5}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%", background: "#090a0c" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Polyline positions={[origin, dest]} pathOptions={{ color: '#d9b84f', weight: 2, dashArray: '5, 5' }} />
      <Marker position={origin} icon={createDotIcon()} />
      <Marker position={dest} icon={createDotIcon()} />
      <MapUpdater origin={origin} dest={dest} />
    </MapContainer>
  );
}