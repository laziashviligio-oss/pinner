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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [TBILISI_CENTER.lat, TBILISI_CENTER.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Fix invalidateSize after render
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Custom gold marker icon
    const goldIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#FBBF24,#F59E0B);border:2px solid #121212;box-shadow:0 2px 8px rgba(245,158,11,0.5);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:12px;">📍</span></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    venues.forEach((venue) => {
      const marker = L.marker([venue.lat, venue.lng], { icon: goldIcon }).addTo(map);
      const name = getVenueName(venue, lang);
      marker.bindPopup(`
        <div style="min-width:160px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#F5F5F5;">${name}</div>
          <div style="font-size:11px;color:#A0A0A0;margin-bottom:6px;">${venue.district} · ★ ${venue.rating_overall.toFixed(1)}/10</div>
          <button onclick="window.__pinnerVenueClick__('${venue.id}')" style="width:100%;padding:6px 12px;border-radius:8px;background:linear-gradient(135deg,#FBBF24,#F59E0B);color:#121212;font-weight:600;font-size:12px;border:none;cursor:pointer;">View Details</button>
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

    // Fit bounds if venues exist
    if (venues.length > 0) {
      const bounds = L.latLngBounds(venues.map(v => [v.lat, v.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [venues, lang, onVenueClick]);

  return (
    <div className="px-4 pb-4">
      <div ref={containerRef} className="w-full h-[400px] rounded-2xl overflow-hidden border border-[#3A3A3A]" />
    </div>
  );
}
