import { Search, X } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import { DISTRICTS, CUISINES, VIBES, DISTANCES, FEATURES, DISTRICT_KEYS, type SearchPill } from '@/lib/types';

interface FilterBarProps {
  lang: Lang;
  search: string;
  setSearch: (s: string) => void;
  district: string;
  setDistrict: (d: string) => void;
  cuisine: string;
  setCuisine: (c: string) => void;
  vibe: string;
  setVibe: (v: string) => void;
  distance: string;
  setDistance: (d: string) => void;
  feature: string;
  setFeature: (f: string) => void;
  onClear: () => void;
  searchPill: SearchPill;
  setSearchPill: (p: SearchPill) => void;
}

export default function FilterBar({
  lang, search, setSearch,
  district, setDistrict,
  cuisine, setCuisine,
  vibe, setVibe,
  distance, setDistance,
  feature, setFeature,
  onClear, searchPill, setSearchPill,
}: FilterBarProps) {
  const hasActiveFilters = search || district !== 'All' || cuisine !== 'All' || vibe !== 'All' || distance !== 'Any distance' || feature !== 'All' || searchPill !== 'all';

  const pills: { value: SearchPill; label: string; icon: string }[] = [
    { value: 'all', label: translate(lang, 'all'), icon: '' },
    { value: 'free', label: translate(lang, 'freeTablesOnly'), icon: '🟢' },
    { value: 'top', label: translate(lang, 'topRating'), icon: '⭐' },
    { value: 'live', label: translate(lang, 'liveVibeFilter'), icon: '🔥' },
  ];

  return (
    <div className="px-4 py-3 space-y-2.5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={translate(lang, 'search')}
          className="w-full bg-white border-2 border-red-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {pills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setSearchPill(pill.value)}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              searchPill === pill.value
                ? 'bg-red-600 border border-red-600 text-white shadow-sm'
                : 'bg-white border border-red-500 text-red-600 hover:bg-red-50'
            }`}
          >
            {pill.icon && <span>{pill.icon}</span>}
            {pill.label}
          </button>
        ))}
      </div>

      {/* 2x2 Grid Dropdowns */}
      <div className="grid grid-cols-2 gap-2">
        {/* District — top-left */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 font-medium px-1">{translate(lang, 'district')}</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="dropdown-select w-full"
          >
            <option value="All">{translate(lang, 'all')}</option>
            {DISTRICTS.map((d) => {
              const key = DISTRICT_KEYS[d];
              return <option key={d} value={d}>{key ? translate(lang, key as any) : d}</option>;
            })}
          </select>
        </div>

        {/* Cuisine — top-right */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 font-medium px-1">{translate(lang, 'cuisine')}</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="dropdown-select w-full"
          >
            {CUISINES.map((c) => {
              const key = c === 'All' ? 'all' : c === 'Georgian Traditional' ? 'georgianTraditional' : c === 'European' ? 'european' : c === 'Asian' ? 'asian' : c === 'Khinkali House' ? 'khinkaliHouse' : 'seafood';
              return <option key={c} value={c}>{translate(lang, key as any)}</option>;
            })}
          </select>
        </div>

        {/* Vibe — bottom-left */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 font-medium px-1">{translate(lang, 'vibe')}</label>
          <select
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="dropdown-select w-full"
          >
            {VIBES.map((v) => {
              const key = v === 'All' ? 'all' : v === 'Romantic' ? 'romantic' : v === 'High Energy' ? 'highEnergy' : v === 'Cozy' ? 'cozy' : 'familyFriendly';
              return <option key={v} value={v}>{translate(lang, key as any)}</option>;
            })}
          </select>
        </div>

        {/* Distance + Features combined — bottom-right */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 font-medium px-1">
            {translate(lang, 'distance')} / {translate(lang, 'features')}
          </label>
          <div className="flex gap-1.5">
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="dropdown-select flex-1 min-w-0"
            >
              {DISTANCES.map((d) => {
                const key = d === 'Any distance' ? 'anyDistance' : d === 'Within 1 km' ? 'within1km' : d === 'Within 3 km' ? 'within3km' : 'within5km';
                return <option key={d} value={d}>{translate(lang, key)}</option>;
              })}
            </select>
            <select
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              className="dropdown-select flex-1 min-w-0"
            >
              {FEATURES.map((f) => {
                const key = f === 'All' ? 'all' : f === 'Outdoor Seating' ? 'outdoorSeating' : f === 'LiveMusic' ? 'liveMusic' : f === 'Folk' ? 'folk' : 'jazz';
                return <option key={f} value={f}>{translate(lang, key as any)}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
        >
          <X className="w-3 h-3" />
          {translate(lang, 'clearFilters')}
        </button>
      )}
    </div>
  );
}
