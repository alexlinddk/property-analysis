'use client'

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface MapLocation {
  lat: number;
  lng: number;
  weight: number;
  info: {
    price: number;
    address: string;
    propertyType: string;
    size: number;
  };
}

interface MapProps {
  data: MapLocation[];
}

const Map = ({ data }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([55.6761, 12.5683], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    if (data && data.length > 0) {
      if (heatLayerRef.current) {
        heatLayerRef.current.remove();
      }

      const heatData = data.map(point => [
        point.lat,
        point.lng,
        point.weight
      ]);

      data.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapRef.current!);

        marker.bindPopup(`
          <div class="p-2">
            <p class="font-bold">${point.info.address}</p>
            <p>${point.info.propertyType}</p>
            <p>${new Intl.NumberFormat('da-DK', {
              style: 'currency',
              currency: 'DKK',
              maximumFractionDigits: 0
            }).format(point.info.price)}</p>
            <p>${point.info.size} m²</p>
          </div>
        `);
      });

      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.4: 'blue',
          0.6: 'green',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data]);

  return <div id="map" className="h-full w-full" />;
};

export default Map;