import { useState, useEffect } from 'react';
import {
  Building2, Star, TrendingUp, Plus, Trash2, ToggleRight, ToggleLeft,
  Calendar, UtensilsCrossed, Users, Music, Sparkles, BarChart3, Armchair,
} from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName } from '@/lib/i18n';
import { supabase, type Venue, type Ad, type EventItem, type Review } from '@/lib/supabase';

interface VenueManagerDashboardProps {
  lang: Lang;
  venues: Venue[];
  onVenueUpdated: () => void;
}

export default function VenueManagerDashboard({ lang, venues, onVenueUpdated }: VenueManagerDashboardProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [adForm, setAdForm] = useState({ title: '', subtitle: '', image_url: '', cta_text: 'Learn More', type: 'carousel' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '' });

  const selectedVenue = venues.find(v => v.id === selectedVenueId) || venues[0];

  useEffect(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  useEffect(() => {
    if (!selectedVenueId) return;
    async function loadData() {
      const [adsRes, eventsRes, reviewsRes] = await Promise.all([
        supabase.from('ads').select('*').eq('venue_id', selectedVenueId).order('created_at', { ascending: false }),
        supabase.from('events').select('*').eq('venue_id', selectedVenueId).order('event_date', { ascending: true }),
        supabase.from('reviews').select('*').eq('venue_id', selectedVenueId).order('created_at', { ascending: false }),
      ]);
      setAds(adsRes.data || []);
      setEvents(eventsRes.data || []);
      setReviews(reviewsRes.data || []);
    }
    loadData();
  }, [selectedVenueId]);

  async function updateVibeStatus(status: string) {
    if (!selectedVenue) return;
    await supabase.from('venues').update({ vibe_status: status }).eq('id', selectedVenue.id);
    onVenueUpdated();
  }

  async function updateTableStatus(status: string, count: number | null) {
    if (!selectedVenue) return;
    await supabase.from('venues').update({ table_status: status, available_tables_count: count }).eq('id', selectedVenue.id);
    onVenueUpdated();
  }

  async function createAd() {
    if (!selectedVenue || !adForm.title) return;
    const { data } = await supabase.from('ads').insert({
      ...adForm,
      venue_id: selectedVenue.id,
      active: true,
    }).select().single();
    if (data) {
      setAds(prev => [data, ...prev]);
      setAdForm({ title: '', subtitle: '', image_url: '', cta_text: 'Learn More', type: 'carousel' });
      setShowAdForm(false);
    }
  }

  async function toggleAd(ad: Ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id);
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a));
  }

  async function deleteAd(id: string) {
    await supabase.from('ads').delete().eq('id', id);
    setAds(prev => prev.filter(a => a.id !== id));
  }

  async function createEvent() {
    if (!selectedVenue || !eventForm.title || !eventForm.event_date) return;
    const { data } = await supabase.from('events').insert({
      venue_id: selectedVenue.id,
      title: eventForm.title,
      description: eventForm.description,
      event_date: eventForm.event_date,
    }).select().single();
    if (data) {
      setEvents(prev => [...prev, data]);
      setEventForm({ title: '', description: '', event_date: '' });
      setShowEventForm(false);
    }
  }

  async function deleteEvent(id: string) {
    await supabase.from('events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  if (!selectedVenue) {
    return <div className="flex items-center justify-center h-64 text-gray-500">{translate(lang, 'loading')}</div>;
  }

  const avgFood = reviews.length ? (reviews.reduce((s, r) => s + r.rating_food, 0) / reviews.length).toFixed(1) : '0.0';
  const avgService = reviews.length ? (reviews.reduce((s, r) => s + r.rating_service, 0) / reviews.length).toFixed(1) : '0.0';
  const avgMusic = reviews.length ? (reviews.reduce((s, r) => s + r.rating_music, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Venue Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-amber-400" />
        <select
          value={selectedVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="flex-1 dropdown-select"
        >
          {venues.map(v => (
            <option key={v.id} value={v.id}>{getVenueName(v, lang)}</option>
          ))}
        </select>
      </div>

      {/* Vibe Status Control */}
      <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          {translate(lang, 'updateVibe')}
        </h3>
        <div className="flex items-center gap-2">
          {([
            { value: 'green', label: translate(lang, 'vibeGreen'), color: 'bg-green-500' },
            { value: 'yellow', label: translate(lang, 'vibeYellow'), color: 'bg-yellow-500' },
            { value: 'red', label: translate(lang, 'vibeRed'), color: 'bg-red-500' },
          ] as const).map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => updateVibeStatus(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                selectedVenue.vibe_status === value
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-[#3A3A3A] bg-[#1a1a1a] hover:border-[#555]'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${color}`} />
              <span className={`text-xs font-medium ${selectedVenue.vibe_status === value ? 'text-amber-400' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Status Quick Update */}
      <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Armchair className="w-4 h-4 text-amber-400" />
          {translate(lang, 'updateTableStatus')}
        </h3>
        <div className="flex items-center gap-2">
          {([
            { value: 'available', label: translate(lang, 'available'), color: 'bg-green-500', count: 10 },
            { value: 'limited', label: translate(lang, 'limited'), color: 'bg-amber-500', count: 3 },
            { value: 'full', label: translate(lang, 'full'), color: 'bg-red-500', count: 0 },
          ] as const).map(({ value, label, color, count }) => (
            <button
              key={value}
              onClick={() => updateTableStatus(value, count)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                selectedVenue.table_status === value
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-[#3A3A3A] bg-[#1a1a1a] hover:border-[#555]'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${color}`} />
              <span className={`text-xs font-medium ${selectedVenue.table_status === value ? 'text-amber-400' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating Analytics */}
      <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          {translate(lang, 'ratingAnalytics')}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: translate(lang, 'overallScore'), value: selectedVenue.rating_overall.toFixed(1), icon: Star },
            { label: translate(lang, 'avgFood'), value: avgFood, icon: UtensilsCrossed },
            { label: translate(lang, 'avgService'), value: avgService, icon: Users },
            { label: translate(lang, 'avgMusic'), value: avgMusic, icon: Music },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#1a1a1a] rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-amber-400">{value}</div>
              <div className="text-[9px] text-gray-500 leading-tight">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">{translate(lang, 'totalRatings')}: <b className="text-gray-300">{selectedVenue.total_ratings}</b></span>
        </div>
      </div>

      {/* Ad Management */}
      <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {translate(lang, 'manageAds')}
          </h3>
          <button
            onClick={() => setShowAdForm(!showAdForm)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {translate(lang, 'createAd')}
          </button>
        </div>

        {showAdForm && (
          <div className="space-y-2 mb-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#3A3A3A] animate-scale-in">
            <select
              value={adForm.type}
              onChange={(e) => setAdForm({ ...adForm, type: e.target.value })}
              className="w-full dropdown-select"
            >
              <option value="carousel">{translate(lang, 'manageCarousel')}</option>
              <option value="startup">{translate(lang, 'manageStartupAds')}</option>
            </select>
            <input
              type="text"
              value={adForm.title}
              onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
              placeholder={translate(lang, 'adTitle')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="text"
              value={adForm.subtitle}
              onChange={(e) => setAdForm({ ...adForm, subtitle: e.target.value })}
              placeholder={translate(lang, 'adSubtitle')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="text"
              value={adForm.image_url}
              onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })}
              placeholder={translate(lang, 'adImage')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="text"
              value={adForm.cta_text}
              onChange={(e) => setAdForm({ ...adForm, cta_text: e.target.value })}
              placeholder={translate(lang, 'adCta')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <button onClick={createAd} className="w-full gold-btn py-2 rounded-lg text-sm font-semibold">
              {translate(lang, 'create')}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {ads.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-4">{translate(lang, 'noData')}</p>
          ) : ads.map(ad => (
            <div key={ad.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#3A3A3A]">
              {ad.image_url && <img src={ad.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{ad.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.type === 'startup' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {ad.type}
                  </span>
                  <span className={`text-[10px] ${ad.active ? 'text-green-400' : 'text-gray-500'}`}>
                    {ad.active ? translate(lang, 'activeAds') : translate(lang, 'inactiveAds')}
                  </span>
                </div>
              </div>
              <button onClick={() => toggleAd(ad)} className="text-gray-400 hover:text-amber-400">
                {ad.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
              <button onClick={() => deleteAd(ad.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Events Management */}
      <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            {translate(lang, 'events')}
          </h3>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {translate(lang, 'addEvent')}
          </button>
        </div>

        {showEventForm && (
          <div className="space-y-2 mb-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#3A3A3A] animate-scale-in">
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder={translate(lang, 'eventName')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="text"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder={translate(lang, 'eventDesc')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="date"
              value={eventForm.event_date}
              onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500/50"
            />
            <button onClick={createEvent} className="w-full gold-btn py-2 rounded-lg text-sm font-semibold">
              {translate(lang, 'addEventBtn')}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-4">{translate(lang, 'noEvents')}</p>
          ) : events.map(event => (
            <div key={event.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#3A3A3A]">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{event.title}</p>
                <span className="text-[10px] text-amber-400/70">{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <button onClick={() => deleteEvent(event.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
