import { useState, useEffect, useCallback } from 'react';
import { List, Map as MapIcon, Sun, Cloud, CloudRain } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import { supabase, type Venue, type Ad } from '@/lib/supabase';
import { haversineDistance, TBILISI_CENTER, type Role, type ViewMode, type SearchPill } from '@/lib/types';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import AdCarousel from '@/components/AdCarousel';
import StartupAdModal from '@/components/StartupAdModal';
import VenueCard from '@/components/VenueCard';
import VenueDetailModal from '@/components/VenueDetailModal';
import MapView from '@/components/MapView';
import InstallPrompt from '@/components/InstallPrompt';
import VenueManagerDashboard from '@/components/VenueManagerDashboard';
import SuperAdminPanel from '@/components/SuperAdminPanel';
import MenuModal from '@/components/MenuModal';
import ReservationModal from '@/components/ReservationModal';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [role, setRole] = useState<Role>('client');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupAd, setStartupAd] = useState<Ad | null>(null);
  const [showStartupAd, setShowStartupAd] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All');
  const [cuisine, setCuisine] = useState('All');
  const [vibe, setVibe] = useState('All');
  const [distance, setDistance] = useState('Any distance');
  const [feature, setFeature] = useState('All');
  const [searchPill, setSearchPill] = useState<SearchPill>('all');

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [menuVenue, setMenuVenue] = useState<Venue | null>(null);
  const [reservationVenue, setReservationVenue] = useState<Venue | null>(null);
  const [checkedInVenues, setCheckedInVenues] = useState<Set<string>>(new Set());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [weather, setWeather] = useState({ temp: 24, condition: 'sunny', icon: '☀️' });
  const [showWeatherAlert, setShowWeatherAlert] = useState(false);

  // Load data
  const loadVenues = useCallback(async () => {
    const { data } = await supabase.from('venues').select('*').order('rating_overall', { ascending: false });
    setVenues(data || []);
    setLoading(false);
  }, []);

  const loadAds = useCallback(async () => {
    const { data } = await supabase.from('ads').select('*').eq('active', true).order('created_at', { ascending: false });
    setAds(data || []);
    const startup = (data || []).find(a => a.type === 'startup');
    if (startup) {
      setStartupAd(startup);
      setShowStartupAd(true);
    }
  }, []);

  useEffect(() => {
    loadVenues();
    loadAds();
  }, [loadVenues, loadAds]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Load check-ins from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pinner_checkins');
    if (stored) {
      try { setCheckedInVenues(new Set(JSON.parse(stored))); } catch {}
    }
  }, []);

  // Weather simulation
  useEffect(() => {
    const conditions = [
      { temp: 24, condition: 'sunny', icon: '☀️' },
      { temp: 22, condition: 'cloudy', icon: '⛅' },
      { temp: 26, condition: 'sunny', icon: '☀️' },
      { temp: 19, condition: 'rainy', icon: '🌧️' },
    ];
    const random = conditions[Math.floor(Math.random() * conditions.length)];
    setWeather(random);
    if (random.condition === 'sunny') {
      setTimeout(() => setShowWeatherAlert(true), 2000);
      setTimeout(() => setShowWeatherAlert(false), 7000);
    }
  }, []);

  // Filter venues
  const filteredVenues = venues.filter(v => {
    if (!v.approved) return false;
    if (district !== 'All' && v.district !== district) return false;
    if (cuisine !== 'All' && v.cuisine !== cuisine) return false;
    if (vibe !== 'All' && v.vibe !== vibe) return false;
    if (feature !== 'All' && !v.features.includes(feature)) return false;
    if (search) {
      const s = search.toLowerCase();
      const cuisineKey = v.cuisine === 'Georgian Traditional' ? 'georgianTraditional' : v.cuisine === 'European' ? 'european' : v.cuisine === 'Asian' ? 'asian' : v.cuisine === 'Khinkali House' ? 'khinkaliHouse' : 'seafood';
      const cuisineTrans = translate(lang, cuisineKey as any).toLowerCase();
      if (!v.name.toLowerCase().includes(s)
        && !v.district.toLowerCase().includes(s)
        && !(v.name_ka || '').includes(s)
        && !v.cuisine.toLowerCase().includes(s)
        && !cuisineTrans.includes(s)) return false;
    }
    if (searchPill === 'free' && v.table_status === 'full') return false;
    if (searchPill === 'top' && v.rating_overall < 8.0) return false;
    if (searchPill === 'live' && v.vibe_status !== 'green') return false;
    if (distance !== 'Any distance') {
      const maxKm = distance === 'Within 1 km' ? 1 : distance === 'Within 3 km' ? 3 : 5;
      const dist = haversineDistance(TBILISI_CENTER.lat, TBILISI_CENTER.lng, v.lat, v.lng);
      if (dist > maxKm) return false;
    }
    return true;
  });

  // Weather-based venue boosting
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    if (weather.condition === 'sunny') {
      const aOutdoor = a.features.includes('Outdoor Seating') ? 1 : 0;
      const bOutdoor = b.features.includes('Outdoor Seating') ? 1 : 0;
      if (aOutdoor !== bOutdoor) return bOutdoor - aOutdoor;
    }
    return b.rating_overall - a.rating_overall;
  });

  function handleClearFilters() {
    setSearch('');
    setDistrict('All');
    setCuisine('All');
    setVibe('All');
    setDistance('Any distance');
    setFeature('All');
    setSearchPill('all');
  }

  function handleDirections(venue: Venue) {
    const url = `https://www.openstreetmap.org/directions?from=41.6928,44.8015&to=${venue.lat},${venue.lng}`;
    window.open(url, '_blank');
  }

  function handleCheckIn(venue: Venue) {
    if (checkedInVenues.has(venue.id)) return;
    const newSet = new Set(checkedInVenues);
    newSet.add(venue.id);
    setCheckedInVenues(newSet);
    localStorage.setItem('pinner_checkins', JSON.stringify([...newSet]));
    supabase.from('visits').insert({ venue_id: venue.id, user_name: localStorage.getItem('pinner_username') || 'Guest' }).then();
  }

  function handleAdClick(ad: Ad) {
    if (ad.venue_id) {
      const venue = venues.find(v => v.id === ad.venue_id);
      if (venue) setSelectedVenue(venue);
    }
  }

  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  }

  function handleDismissInstall() {
    localStorage.setItem('pinner_install_dismissed', 'true');
    setDeferredPrompt(null);
  }

  const visitedVenues = venues.filter(v => checkedInVenues.has(v.id));

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col">
      <Header
        lang={lang}
        setLang={setLang}
        role={role}
        setRole={setRole}
        weather={weather}
        onWeatherClick={() => setShowWeatherAlert(!showWeatherAlert)}
      />

      {/* Weather Alert Banner */}
      {showWeatherAlert && weather.condition === 'sunny' && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-amber-500/20 animate-slide-down">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Sun className="w-4 h-4" />
            <span>{translate(lang, 'weatherRooftopTip')}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {role === 'client' && (
          <>
            <FilterBar
              lang={lang}
              search={search}
              setSearch={setSearch}
              district={district}
              setDistrict={setDistrict}
              cuisine={cuisine}
              setCuisine={setCuisine}
              vibe={vibe}
              setVibe={setVibe}
              distance={distance}
              setDistance={setDistance}
              feature={feature}
              setFeature={setFeature}
              onClear={handleClearFilters}
              searchPill={searchPill}
              setSearchPill={setSearchPill}
            />

            <AdCarousel lang={lang} ads={ads} onAdClick={handleAdClick} />

            {/* View Toggle */}
            <div className="flex items-center gap-2 px-4 pb-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-gray-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                {translate(lang, 'listView')}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-gray-400'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                {translate(lang, 'mapView')}
              </button>
              <span className="ml-auto text-xs text-gray-500">
                {sortedVenues.length} {translate(lang, 'venue')}
              </span>
            </div>

            {/* Venue Feed or Map */}
            {loading ? (
              <div className="px-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="shimmer rounded-2xl h-64" />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="px-4 space-y-3 pb-4">
                {sortedVenues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-gray-500 mb-3">{translate(lang, 'noVenues')}</p>
                    <button onClick={handleClearFilters} className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                      {translate(lang, 'clearFilters')}
                    </button>
                  </div>
                ) : (
                  sortedVenues.map(venue => (
                    <VenueCard
                      key={venue.id}
                      lang={lang}
                      venue={venue}
                      onClick={() => setSelectedVenue(venue)}
                      onDirections={() => handleDirections(venue)}
                      onViewMenu={() => setMenuVenue(venue)}
                      onBookTable={() => setReservationVenue(venue)}
                      onOrderDelivery={() => setMenuVenue(venue)}
                      distance={haversineDistance(TBILISI_CENTER.lat, TBILISI_CENTER.lng, venue.lat, venue.lng)}
                    />
                  ))
                )}

                {/* My Visits Section */}
                {visitedVenues.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-amber-400" />
                      {translate(lang, 'myVisits')} ({visitedVenues.length})
                    </h3>
                    <div className="space-y-2">
                      {visitedVenues.map(venue => (
                        <div key={venue.id} className="flex items-center gap-3 bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A]">
                          {venue.image_url && <img src={venue.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="text-sm text-gray-200 flex-1 truncate">{venue.name}</span>
                          <span className="text-xs text-amber-400">★ {venue.rating_overall.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <MapView lang={lang} venues={sortedVenues} onVenueClick={setSelectedVenue} />
            )}
          </>
        )}

        {role === 'manager' && (
          <VenueManagerDashboard lang={lang} venues={venues.filter(v => v.approved)} onVenueUpdated={loadVenues} />
        )}

        {role === 'admin' && (
          <SuperAdminPanel lang={lang} venues={venues} onVenueUpdated={loadVenues} />
        )}
      </main>

      {/* Modals */}
      {selectedVenue && (
        <VenueDetailModal
          lang={lang}
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onDirections={handleDirections}
          onCheckIn={handleCheckIn}
          checkedIn={checkedInVenues.has(selectedVenue.id)}
        />
      )}

      <StartupAdModal
        lang={lang}
        ad={showStartupAd ? startupAd : null}
        onClose={() => setShowStartupAd(false)}
        onAdClick={handleAdClick}
      />

      {menuVenue && (
        <MenuModal lang={lang} venue={menuVenue} onClose={() => setMenuVenue(null)} />
      )}
      {reservationVenue && (
        <ReservationModal lang={lang} venue={reservationVenue} onClose={() => setReservationVenue(null)} />
      )}

      <InstallPrompt
        lang={lang}
        deferredPrompt={deferredPrompt}
        onInstall={handleInstall}
        onDismiss={handleDismissInstall}
      />
    </div>
  );
}
