import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Lang } from '@/lib/i18n';
import { getVenueName } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';
import { TBILISI_CENTER } from '@/lib/types';

interface MapViewProps {
  lang: Lang;
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

export default function MapView({ lang, venues, onVenueClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const baseLayersRef = useRef<Record<string, L.TileLayer>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [TBILISI_CENTER.lat, TBILISI_CENTER.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    });

    streetLayer.addTo(map);

    baseLayersRef.current = {
      'Street': streetLayer,
      'Satellite': satelliteLayer,
    };

    L.control.layers(baseLayersRef.current, undefined, {
      position: 'topright',
      collapsed: false,
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const redIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#EF4444,#DC2626);border:2px solid #FFFFFF;box-shadow:0 2px 8px rgba(220,38,38,0.4);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:12px;">📍</span></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    venues.forEach((venue) => {
      const marker = L.marker([venue.lat, venue.lng], { icon: redIcon }).addTo(map);
      const name = getVenueName(venue, lang);
      marker.bindPopup(`
        <div style="min-width:160px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#111827;">${name}</div>
          <div style="font-size:11px;color:#6B7280;margin-bottom:6px;">${venue.district} · ★ ${venue.rating_overall.toFixed(1)}/10</div>
          <button onclick="window.__pinnerVenueClick__('${venue.id}')" style="width:100%;padding:6px 12px;border-radius:8px;background:linear-gradient(135deg,#DC2626,#B91C1C);color:#FFFFFF;font-weight:600;font-size:12px;border:none;cursor:pointer;">View Details</button>
        </div>
      `);
      marker.on('popupopen', () => {
        (window as any).__pinnerVenueClick__ = (id: string) => {
          const v = venues.find(vv => vv.id === id);
          if (v) onVenueClick(v);
        };
      });
      markersRef.current.push(marker);
    });

    if (venues.length > 0) {
      const bounds = L.latLngBounds(venues.map(v => [v.lat, v.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [venues, lang, onVenueClick]);

  return (
    <div className="px-4 pb-4">
      <div ref={containerRef} className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200" />
    </div>
  );
}
