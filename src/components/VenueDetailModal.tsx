import { useState, useEffect } from 'react';
import {
  X, Star, MapPin, Navigation, Phone, Calendar, UtensilsCrossed,
  Music, Users, MessageCircle, CheckCircle2, Camera, Armchair,
} from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName, getVenueDescription } from '@/lib/i18n';
import { supabase, type Venue, type Review, type EventItem } from '@/lib/supabase';
import { DISTRICT_KEYS } from '@/lib/types';
import LiveChat from './LiveChat';

interface VenueDetailModalProps {
  lang: Lang;
  venue: Venue;
  onClose: () => void;
  onDirections: (venue: Venue) => void;
  onCheckIn: (venue: Venue) => void;
  checkedIn: boolean;
}

export default function VenueDetailModal({ lang, venue, onClose, onDirections, onCheckIn, checkedIn }: VenueDetailModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'events' | 'chat'>('about');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingFood, setRatingFood] = useState(7);
  const [ratingService, setRatingService] = useState(7);
  const [ratingMusic, setRatingMusic] = useState(7);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('Guest');
  const [submitting, setSubmitting] = useState(false);

  const name = getVenueName(venue, lang);
  const districtKey = DISTRICT_KEYS[venue.district];
  const districtLabel = districtKey ? translate(lang, districtKey as any) : venue.district;
  const desc = getVenueDescription(venue, lang);
  const vibeLabel = venue.vibe_status === 'green' ? translate(lang, 'vibeGreen')
    : venue.vibe_status === 'yellow' ? translate(lang, 'vibeYellow') : translate(lang, 'vibeRed');

  const tableLabel = venue.table_status === 'available' ? translate(lang, 'tablesAvailable')
    : venue.table_status === 'limited' ? translate(lang, 'fewTablesLeft') : translate(lang, 'fullyBooked');
  const tableColorClass = venue.table_status === 'available'
    ? 'bg-green-500/10 border-green-500/30 text-green-400'
    : venue.table_status === 'limited'
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    : 'bg-red-500/10 border-red-500/30 text-red-400';
  const tableDotClass = venue.table_status === 'available' ? 'bg-green-400' : venue.table_status === 'limited' ? 'bg-amber-400' : 'bg-red-400';

  useEffect(() => {
    setReviewerName(localStorage.getItem('pinner_username') || 'Guest');
  }, []);

  useEffect(() => {
    async function loadData() {
      const [reviewsRes, eventsRes] = await Promise.all([
        supabase.from('reviews').select('*').eq('venue_id', venue.id).order('created_at', { ascending: false }),
        supabase.from('events').select('*').eq('venue_id', venue.id).order('event_date', { ascending: true }),
      ]);
      setReviews(reviewsRes.data || []);
      setEvents(eventsRes.data || []);
    }
    loadData();
  }, [venue.id]);

  async function submitReview() {
    setSubmitting(true);
    const overall = ((ratingFood + ratingService + ratingMusic) / 3);
    const revName = reviewerName || 'Guest';
    localStorage.setItem('pinner_username', revName);

    const { data } = await supabase
      .from('reviews')
      .insert({
        venue_id: venue.id,
        user_name: revName,
        rating_food: ratingFood,
        rating_service: ratingService,
        rating_music: ratingMusic,
        rating_overall: Math.round(overall * 10) / 10,
        text: reviewText.trim(),
      })
      .select()
      .single();

    if (data) {
      setReviews(prev => [data, ...prev]);
      setShowRatingForm(false);
      setReviewText('');
    }

    // Update venue aggregate
    const allReviews = [...reviews, data].filter(Boolean) as Review[];
    const avgFood = allReviews.reduce((s, r) => s + r.rating_food, 0) / allReviews.length;
    const avgService = allReviews.reduce((s, r) => s + r.rating_service, 0) / allReviews.length;
    const avgMusic = allReviews.reduce((s, r) => s + r.rating_music, 0) / allReviews.length;
    const avgOverall = allReviews.reduce((s, r) => s + r.rating_overall, 0) / allReviews.length;

    await supabase
      .from('venues')
      .update({
        rating_food: Math.round(avgFood * 10) / 10,
        rating_service: Math.round(avgService * 10) / 10,
        rating_music: Math.round(avgMusic * 10) / 10,
        rating_overall: Math.round(avgOverall * 10) / 10,
        total_ratings: allReviews.length,
      })
      .eq('id', venue.id);

    setSubmitting(false);
  }

  const featureIcons: Record<string, typeof Music> = {
    'LiveMusic': Music, 'Folk': Music, 'Jazz': Music,
    'Outdoor Seating': UtensilsCrossed, 'Family Friendly': Users,
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header image */}
        <div className="relative h-40 flex-shrink-0">
          {venue.image_url && (
            <img src={venue.image_url} alt={name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`vibe-dot vibe-${venue.vibe_status}`} />
              <span className="text-xs text-white font-medium">{vibeLabel}</span>
              <div className="ml-auto rating-badge flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                <span className="text-sm">{venue.rating_overall.toFixed(1)}</span>
                <span className="text-[10px] text-gray-400">/10</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{name}</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{districtLabel}</span>
              {venue.address && <span className="text-xs text-gray-500">· {venue.address}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#3A3A3A] flex-shrink-0">
          {([
            ['about', translate(lang, 'about')],
            ['reviews', `${translate(lang, 'reviews')} (${reviews.length})`],
            ['events', translate(lang, 'events')],
            ['chat', translate(lang, 'liveChat')],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {activeTab === 'about' && (
            <>
              <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>

              {/* Rating breakdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: translate(lang, 'foodDrinks'), value: venue.rating_food, icon: UtensilsCrossed },
                  { label: translate(lang, 'serviceStaff'), value: venue.rating_service, icon: Users },
                  { label: translate(lang, 'musicAtmosphere'), value: venue.rating_music, icon: Music },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-[#2A2A2A] rounded-xl p-3 text-center">
                    <Icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-amber-400">{value.toFixed(1)}</div>
                    <div className="text-[10px] text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {venue.features.map((f) => {
                  const Icon = featureIcons[f] || UtensilsCrossed;
                  const label = f === 'Outdoor Seating' ? translate(lang, 'outdoorSeating')
                    : f === 'LiveMusic' ? translate(lang, 'liveMusic')
                    : f === 'Folk' ? translate(lang, 'folk')
                    : f === 'Jazz' ? translate(lang, 'jazz')
                    : f === 'Family Friendly' ? translate(lang, 'familyFriendly') : f;
                  return (
                    <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] text-xs text-gray-300">
                      <Icon className="w-3 h-3 text-amber-400" />
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* Table Availability Badge */}
              <div className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${tableColorClass}`}>
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4" />
                  <span className="text-sm font-medium">{tableLabel}</span>
                  {venue.available_tables_count !== null && venue.table_status !== 'full' && (
                    <span className="text-xs opacity-70">· {venue.available_tables_count} {translate(lang, 'tablesCount')}</span>
                  )}
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${tableDotClass} animate-pulse`} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {venue.table_status !== 'full' && venue.phone && (
                  <a href={`tel:${venue.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gold-btn text-sm">
                    <Armchair className="w-4 h-4" />
                    {translate(lang, 'reserveTable')}
                  </a>
                )}
                <button
                  onClick={() => onDirections(venue)}
                  className={`${venue.table_status !== 'full' && venue.phone ? '' : 'flex-1 '}flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2A2A2A] border border-[#3A3A3A] text-amber-400 text-sm font-medium hover:bg-[#333] transition-colors`}
                >
                  <Navigation className="w-4 h-4" />
                  {translate(lang, 'getDirections')}
                </button>
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="w-11 h-11 rounded-xl bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-amber-400 hover:bg-[#333] transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => onCheckIn(venue)}
                  className={`px-4 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border transition-colors ${
                    checkedIn
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-[#2A2A2A] border-[#3A3A3A] text-gray-300 hover:bg-[#333]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {checkedIn ? translate(lang, 'checkedIn') : translate(lang, 'checkIn')}
                </button>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <button
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gold-btn text-sm"
              >
                <Star className="w-4 h-4" />
                {translate(lang, 'rateVenue')}
              </button>

              {showRatingForm && (
                <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-3 border border-[#3A3A3A] animate-scale-in">
                  <div>
                    <label className="text-xs text-gray-400 font-medium">{translate(lang, 'yourName')}</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full mt-1 bg-[#1a1a1a] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  {[
                    { label: translate(lang, 'foodDrinks'), value: ratingFood, set: setRatingFood },
                    { label: translate(lang, 'serviceStaff'), value: ratingService, set: setRatingService },
                    { label: translate(lang, 'musicAtmosphere'), value: ratingMusic, set: setRatingMusic },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400 font-medium">{label}</label>
                        <span className="text-sm font-bold text-amber-400">{value.toFixed(1)}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={value}
                        onChange={(e) => set(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-400 font-medium">{translate(lang, 'writeReview')}</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="w-full mt-1 bg-[#1a1a1a] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
                    />
                  </div>
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="w-full gold-btn py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {submitting ? translate(lang, 'loading') : translate(lang, 'submitRating')}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noReviewsToModerate')}</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                            {review.user_name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-200">{review.user_name}</span>
                          <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            {translate(lang, 'verified')}
                          </span>
                        </div>
                        <div className="rating-badge flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                          <span className="text-xs">{review.rating_overall.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 mb-2 text-[10px] text-gray-500">
                        <span>{translate(lang, 'foodDrinks')}: <b className="text-gray-300">{review.rating_food.toFixed(1)}</b></span>
                        <span>{translate(lang, 'serviceStaff')}: <b className="text-gray-300">{review.rating_service.toFixed(1)}</b></span>
                        <span>{translate(lang, 'musicAtmosphere')}: <b className="text-gray-300">{review.rating_music.toFixed(1)}</b></span>
                      </div>
                      {review.text && <p className="text-sm text-gray-300 leading-relaxed">{review.text}</p>}
                      {review.photo_url && (
                        <img src={review.photo_url} alt="review" className="mt-2 rounded-lg max-h-32 object-cover" />
                      )}
                      <span className="text-[10px] text-gray-600 mt-1 block">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noEvents')}</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A]">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                        {event.description && <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>}
                        <span className="text-[10px] text-amber-400/70 mt-1 block">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <LiveChat lang={lang} venueId={venue.id} venueName={name} />
          )}
        </div>
      </div>
    </div>
  );
}
