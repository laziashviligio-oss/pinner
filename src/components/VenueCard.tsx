import { Star, MapPin, Navigation, Music, UtensilsCrossed, Users, BookOpen, Armchair, Bike, Car, Clock } from 'lucide-react';
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
  onOrderTaxi: () => void;
  onBookTimeSlot?: (time: string) => void;
  distance?: number;
}

const TIME_SLOTS = ['19:15', '19:30', '19:45', '20:00', '20:15', '20:30'];

export default function VenueCard({ lang, venue, onClick, onDirections, onViewMenu, onBookTable, onOrderDelivery, onOrderTaxi, onBookTimeSlot, distance }: VenueCardProps) {
  const name = getVenueName(venue, lang);
  const desc = getVenueDescription(venue, lang);
  const vibeLabel = venue.vibe_status === 'green' ? translate(lang, 'vibeGreen')
    : venue.vibe_status === 'yellow' ? translate(lang, 'vibeYellow') : translate(lang, 'vibeRed');

  const tableLabel = venue.table_status === 'available' ? translate(lang, 'tablesAvailable')
    : venue.table_status === 'limited' ? translate(lang, 'fewTablesLeft') : translate(lang, 'fullyBooked');
  const tableColor = venue.table_status === 'available' ? 'text-green-600 bg-green-50 border-green-200'
    : venue.table_status === 'limited' ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';

  const featureIcons: Record<string, typeof Music> = {
    'LiveMusic': Music,
    'Folk': Music,
    'Jazz': Music,
    'Outdoor Seating': UtensilsCrossed,
    'Family Friendly': Users,
  };

  const districtKey = DISTRICT_KEYS[venue.district];
  const districtLabel = districtKey ? translate(lang, districtKey as any) : venue.district;

  const showTimeSlots = venue.table_status !== 'full';

  return (
    <div onClick={onClick} className="venue-card cursor-pointer">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        {venue.image_url ? (
          <img src={venue.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Sponsored badge */}
        {venue.sponsored && (
          <div className="absolute top-2 right-2">
            <span className="sponsored-badge">{translate(lang, 'sponsored')}</span>
          </div>
        )}

        {/* Vibe indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
          <span className={`vibe-dot vibe-${venue.vibe_status}`} />
          <span className="text-[10px] text-gray-700 font-medium">{vibeLabel}</span>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 rating-badge flex items-center gap-1">
          <Star className="w-3 h-3 text-red-500" fill="currentColor" />
          <span className="text-xs">{venue.rating_overall.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">/10</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-500">{districtLabel}</span>
            {distance !== undefined && (
              <span className="text-[11px] text-red-500">· {distance.toFixed(1)} km</span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>

        {/* Feature icons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {venue.features.slice(0, 3).map((f) => {
            const Icon = featureIcons[f] || UtensilsCrossed;
            return (
              <span key={f} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-600">
                <Icon className="w-2.5 h-2.5" />
                {f === 'Outdoor Seating' ? 'Outdoor' : f === 'Family Friendly' ? 'Family' : f}
              </span>
            );
          })}
          <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] text-red-600 border border-red-200">
            {translate(lang, venue.cuisine === 'Georgian Traditional' ? 'georgianTraditional' : venue.cuisine === 'European' ? 'european' : venue.cuisine === 'Asian' ? 'asian' : venue.cuisine === 'Khinkali House' ? 'khinkaliHouse' : 'seafood')}
          </span>
        </div>

        {/* Table Availability Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${tableColor}`}>
          <span className={`w-2 h-2 rounded-full ${venue.table_status === 'available' ? 'bg-green-500' : venue.table_status === 'limited' ? 'bg-amber-500' : 'bg-red-500'}`} />
          {tableLabel}
          {venue.available_tables_count !== null && venue.table_status !== 'full' && (
            <span className="opacity-70">· {venue.available_tables_count}</span>
          )}
        </div>

        {/* Time Slot Chips */}
        {showTimeSlots && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
              <Clock className="w-3 h-3" />
              {translate(lang, 'availableTimes')}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {TIME_SLOTS.slice(0, 4).map((time) => (
                <button
                  key={time}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onBookTimeSlot) onBookTimeSlot(time);
                    else onBookTable();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all whitespace-nowrap"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4-Button Quick Action Bar */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onViewMenu(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-100 hover:text-red-600 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {translate(lang, 'viewMenu')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBookTable(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            <Armchair className="w-3.5 h-3.5" />
            {translate(lang, 'bookTable')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOrderDelivery(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-100 hover:text-red-600 transition-colors"
          >
            <Bike className="w-3.5 h-3.5" />
            {translate(lang, 'orderDelivery')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOrderTaxi(); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-100 hover:text-red-600 transition-colors"
          >
            <Car className="w-3.5 h-3.5" />
            {translate(lang, 'orderTaxi')}
          </button>
        </div>
      </div>
    </div>
  );
}
