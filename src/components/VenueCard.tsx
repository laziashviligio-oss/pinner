import { Star, MapPin, Navigation, Music, UtensilsCrossed, Users, BookOpen, Armchair, Bike } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName, getVenueDescription } from '@/lib/i18n';
import { DISTRICT_KEYS } from '@/lib/types';
import type { Venue } from '@/lib/supabase';

interface VenueCardProps {
  lang: Lang;
  venue: Venue;
  onClick: () => void;
  onDirections: () => void;
  onViewMenu: () => void;
  onBookTable: () => void;
  onOrderDelivery: () => void;
  distance?: number;
}

export default function VenueCard({ lang, venue, onClick, onDirections, distance }: VenueCardProps) {
  const name = getVenueName(venue, lang);
  const desc = getVenueDescription(venue, lang);
  const vibeLabel = venue.vibe_status === 'green' ? translate(lang, 'vibeGreen')
    : venue.vibe_status === 'yellow' ? translate(lang, 'vibeYellow') : translate(lang, 'vibeRed');

  const tableLabel = venue.table_status === 'available' ? translate(lang, 'tablesAvailable')
    : venue.table_status === 'limited' ? translate(lang, 'fewTablesLeft') : translate(lang, 'fullyBooked');
  const tableColor = venue.table_status === 'available' ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : venue.table_status === 'limited' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  const featureIcons: Record<string, typeof Music> = {
    'LiveMusic': Music,
    'Folk': Music,
    'Jazz': Music,
    'Outdoor Seating': UtensilsCrossed,
    'Family Friendly': Users,
  };

  const districtKey = DISTRICT_KEYS[venue.district];
  const districtLabel = districtKey ? translate(lang, districtKey as any) : venue.district;

  return (
    <div onClick={onClick} className="venue-card cursor-pointer">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        {venue.image_url ? (
          <img src={venue.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#222] flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A2A] via-transparent to-transparent" />

        {/* Sponsored badge */}
        {venue.sponsored && (
          <div className="absolute top-2 right-2">
            <span className="sponsored-badge">{translate(lang, 'sponsored')}</span>
          </div>
        )}

        {/* Vibe indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <span className={`vibe-dot vibe-${venue.vibe_status}`} />
          <span className="text-[10px] text-white font-medium">{vibeLabel}</span>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 rating-badge flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
          <span className="text-xs">{venue.rating_overall.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">/10</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-[11px] text-gray-400">{districtLabel}</span>
            {distance !== undefined && (
              <span className="text-[11px] text-amber-400/70">· {distance.toFixed(1)} km</span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{desc}</p>

        {/* Feature icons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {venue.features.slice(0, 3).map((f) => {
            const Icon = featureIcons[f] || UtensilsCrossed;
            return (
              <span key={f} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#333] text-[10px] text-gray-400">
                <Icon className="w-2.5 h-2.5" />
                {f === 'Outdoor Seating' ? 'Outdoor' : f === 'Family Friendly' ? 'Family' : f}
              </span>
            );
          })}
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[10px] text-amber-400/80 border border-amber-500/20">
            {translate(lang, venue.cuisine === 'Georgian Traditional' ? 'georgianTraditional' : venue.cuisine === 'European' ? 'european' : venue.cuisine === 'Asian' ? 'asian' : venue.cuisine === 'Khinkali House' ? 'khinkaliHouse' : 'seafood')}
          </span>
        </div>

        {/* Table Availability Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${tableColor}`}>
          <span className={`w-2 h-2 rounded-full ${venue.table_status === 'available' ? 'bg-green-400' : venue.table_status === 'limited' ? 'bg-amber-400' : 'bg-red-400'}`} />
          {tableLabel}
          {venue.available_tables_count !== null && venue.table_status !== 'full' && (
            <span className="text-gray-500">· {venue.available_tables_count}</span>
          )}
        </div>

        {/* 3-Button Quick Action Bar */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onViewMenu(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-[#333] border border-[#3A3A3A] text-gray-300 text-[10px] font-medium hover:bg-[#3A3A3A] hover:text-amber-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {translate(lang, 'viewMenu')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBookTable(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-medium hover:bg-amber-500/20 transition-colors"
          >
            <Armchair className="w-3.5 h-3.5" />
            {translate(lang, 'bookTable')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOrderDelivery(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-[#333] border border-[#3A3A3A] text-gray-300 text-[10px] font-medium hover:bg-[#3A3A3A] hover:text-amber-400 transition-colors"
          >
            <Bike className="w-3.5 h-3.5" />
            {translate(lang, 'orderDelivery')}
          </button>
        </div>
      </div>
    </div>
  );
}
