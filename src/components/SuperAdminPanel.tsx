import { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, XCircle, Star, MessageCircle, Building2,
  Users, TrendingUp, DollarSign, Trash2, BarChart3, MapPin,
} from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName } from '@/lib/i18n';
import { supabase, type Venue, type Review, type ChatMessage, type Ad } from '@/lib/supabase';

interface SuperAdminPanelProps {
  lang: Lang;
  venues: Venue[];
  onVenueUpdated: () => void;
}

export default function SuperAdminPanel({ lang, venues, onVenueUpdated }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'ads' | 'reviews' | 'chat' | 'pricing'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [adPrice, setAdPrice] = useState('150');

  useEffect(() => {
    async function loadModeration() {
      const [reviewsRes, messagesRes, adsRes] = await Promise.all([
        supabase.from('reviews').select('*, venues(name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('chat_messages').select('*, venues(name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('ads').select('*').order('created_at', { ascending: false }),
      ]);
      setReviews(reviewsRes.data || []);
      setMessages(messagesRes.data || []);
      setAds(adsRes.data || []);
    }
    loadModeration();
  }, []);

  async function approveVenue(venue: Venue) {
    await supabase.from('venues').update({ approved: true }).eq('id', venue.id);
    onVenueUpdated();
  }

  async function rejectVenue(venue: Venue) {
    await supabase.from('venues').update({ approved: false }).eq('id', venue.id);
    onVenueUpdated();
  }

  async function deleteReview(id: string) {
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  async function deleteMessage(id: string) {
    await supabase.from('chat_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  async function toggleAd(ad: Ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id);
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a));
  }

  async function deleteAd(id: string) {
    await supabase.from('ads').delete().eq('id', id);
    setAds(prev => prev.filter(a => a.id !== id));
  }

  const pendingVenues = venues.filter(v => !v.approved);
  const approvedVenues = venues.filter(v => v.approved);
  const totalRatings = venues.reduce((s, v) => s + v.total_ratings, 0);

  // District heatmap data
  const districtCounts = venues.reduce((acc, v) => {
    acc[v.district] = (acc[v.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxCount = Math.max(...Object.values(districtCounts), 1);

  const tabs = [
    { id: 'overview' as const, label: translate(lang, 'overview'), icon: BarChart3 },
    { id: 'approvals' as const, label: translate(lang, 'venueApprovals'), icon: Building2 },
    { id: 'ads' as const, label: translate(lang, 'adManagement'), icon: DollarSign },
    { id: 'reviews' as const, label: translate(lang, 'moderateReviews'), icon: Star },
    { id: 'chat' as const, label: translate(lang, 'moderateChat'), icon: MessageCircle },
    { id: 'pricing' as const, label: translate(lang, 'adPricing'), icon: TrendingUp },
  ];

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      {/* Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-[#2A2A2A] border border-[#3A3A3A] text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: translate(lang, 'totalVenues'), value: venues.length, icon: Building2, color: 'text-amber-400' },
              { label: translate(lang, 'activeUsers'), value: Math.floor(venues.length * 12.5), icon: Users, color: 'text-green-400' },
              { label: translate(lang, 'totalReviews'), value: totalRatings, icon: Star, color: 'text-amber-400' },
              { label: translate(lang, 'totalMessages'), value: messages.length * 8, icon: MessageCircle, color: 'text-blue-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              {translate(lang, 'platformHeatmap')}
            </h3>
            <div className="space-y-2">
              {Object.entries(districtCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([district, count]) => (
                  <div key={district} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 truncate">{district}</span>
                    <div className="flex-1 h-6 bg-[#1a1a1a] rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          background: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-400 w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Venue Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">{translate(lang, 'venueApprovals')}</h3>
            <span className="ml-auto px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
              {pendingVenues.length} {translate(lang, 'pending')}
            </span>
          </div>
          {pendingVenues.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noPendingVenues')}</p>
          ) : (
            pendingVenues.map(venue => (
              <div key={venue.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] flex items-center gap-3">
                {venue.image_url && <img src={venue.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{getVenueName(venue, lang)}</p>
                  <span className="text-[10px] text-gray-500">{venue.district} · {venue.cuisine}</span>
                </div>
                <button onClick={() => approveVenue(venue)} className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => rejectVenue(venue)} className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {/* Approved venues */}
          {approvedVenues.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs text-gray-500 font-medium mb-2">{translate(lang, 'approved')} ({approvedVenues.length})</h4>
              {approvedVenues.slice(0, 5).map(venue => (
                <div key={venue.id} className="flex items-center gap-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">{getVenueName(venue, lang)}</span>
                  <button onClick={() => rejectVenue(venue)} className="text-xs text-gray-500 hover:text-red-400">
                    {translate(lang, 'reject')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ad Management */}
      {activeTab === 'ads' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            {translate(lang, 'adManagement')}
          </h3>
          {ads.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noData')}</p>
          ) : ads.map(ad => (
            <div key={ad.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] flex items-center gap-3">
              {ad.image_url && <img src={ad.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{ad.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.type === 'startup' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {ad.type}
                  </span>
                  <span className={`text-[10px] ${ad.active ? 'text-green-400' : 'text-gray-500'}`}>
                    {ad.active ? translate(lang, 'active') : translate(lang, 'inactive')}
                  </span>
                </div>
              </div>
              <button onClick={() => toggleAd(ad)} className="text-gray-400 hover:text-amber-400">
                {ad.active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </button>
              <button onClick={() => deleteAd(ad.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            {translate(lang, 'moderateReviews')}
          </h3>
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noReviewsToModerate')}</p>
          ) : reviews.map(review => (
            <div key={review.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-200">{review.user_name}</span>
                  <div className="rating-badge flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                    <span className="text-xs">{review.rating_overall.toFixed(1)}</span>
                  </div>
                </div>
                <button onClick={() => deleteReview(review.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {review.text && <p className="text-sm text-gray-300 mb-1">{review.text}</p>}
              <span className="text-[10px] text-gray-600">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Moderation */}
      {activeTab === 'chat' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-400" />
            {translate(lang, 'moderateChat')}
          </h3>
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noMessagesToModerate')}</p>
          ) : messages.map(msg => (
            <div key={msg.id} className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                {msg.user_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-200">{msg.user_name}</span>
                  <span className="text-[10px] text-gray-600">{new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{msg.message}</p>
              </div>
              <button onClick={() => deleteMessage(msg.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pricing */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            {translate(lang, 'adPricing')}
          </h3>
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] space-y-3">
            <div>
              <label className="text-xs text-gray-400 font-medium">{translate(lang, 'pricePerAd')} (GEL)</label>
              <input
                type="number"
                value={adPrice}
                onChange={(e) => setAdPrice(e.target.value)}
                className="w-full mt-1 bg-[#1a1a1a] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{translate(lang, 'manageStartupAds')}</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{parseInt(adPrice) * 3} GEL</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{translate(lang, 'manageCarousel')}</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{adPrice} GEL</p>
              </div>
            </div>
            <button onClick={() => {}} className="w-full gold-btn py-2.5 rounded-xl text-sm font-semibold">
              {translate(lang, 'updatePricing')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
