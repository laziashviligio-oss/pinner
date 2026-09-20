import { useState, useEffect } from 'react';
import { X, Car, MapPin, CheckCircle2, Clock, Navigation, Star, Users, Wine } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';
import { DISTRICT_KEYS } from '@/lib/types';

type Tariff = 'standard' | 'comfort' | 'minivan' | 'sober';

interface TaxiModalProps {
  lang: Lang;
  venue: Venue;
  onClose: () => void;
}

export default function TaxiModal({ lang, venue, onClose }: TaxiModalProps) {
  const [tariff, setTariff] = useState<Tariff>('standard');
  const [pickup, setPickup] = useState('');
  const [phase, setPhase] = useState<'setup' | 'searching' | 'found' | 'confirmed'>('setup');
  const [arriveIn, setArriveIn] = useState(4);

  const districtKey = DISTRICT_KEYS[venue.district];
  const districtLabel = districtKey ? translate(lang, districtKey as any) : venue.district;

  const fareRanges: Record<Tariff, { min: number; max: number }> = {
    standard: { min: 8, max: 12 },
    comfort: { min: 15, max: 22 },
    minivan: { min: 20, max: 30 },
    sober: { min: 18, max: 25 },
  };

  const estimatedFare = fareRanges[tariff].min + Math.floor(Math.random() * (fareRanges[tariff].max - fareRanges[tariff].min));

  const tariffs: { value: Tariff; label: string; price: string; icon: typeof Car; note?: string }[] = [
    { value: 'standard', label: translate(lang, 'taxiStandard'), price: '8-12 ₾', icon: Car },
    { value: 'comfort', label: translate(lang, 'taxiComfort'), price: '15-22 ₾', icon: Car },
    { value: 'minivan', label: translate(lang, 'taxiMinivan'), price: '20-30 ₾', icon: Users },
    { value: 'sober', label: translate(lang, 'soberDriver'), price: '18-25 ₾', icon: Wine, note: translate(lang, 'soberDriverNote') },
  ];

  useEffect(() => {
    if (phase === 'searching') {
      const timer = setTimeout(() => setPhase('found'), 2500);
      return () => clearTimeout(timer);
    }
    if (phase === 'found') {
      const interval = setInterval(() => {
        setArriveIn(prev => Math.max(1, prev - 1));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  function handleConfirmRide() {
    if (!pickup) return;
    setPhase('searching');
  }

  const selectedTariff = tariffs.find(t => t.value === tariff)!;

  if (phase === 'confirmed') {
    return (
      <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
        <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 animate-slide-up sm:animate-scale-in p-6 text-center safe-bottom">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{translate(lang, 'taxiRideConfirmed')}</h2>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-left space-y-1 mb-4">
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'taxiFromLocation')}</span><span className="text-gray-700 truncate max-w-[160px]">{pickup}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'taxiToVenue')}</span><span className="text-gray-700">{getVenueName(venue, lang)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'taxiDriverName')}</span><span className="text-gray-700">Dato K.</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'category')}</span><span className="text-gray-700">{selectedTariff.label}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'taxiEstimate')}</span><span className="text-red-500 font-bold">{estimatedFare} ₾</span></div>
          </div>
          <button onClick={onClose} className="w-full red-btn py-2.5 rounded-xl text-sm font-semibold">
            {translate(lang, 'close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-gray-900">{translate(lang, 'taxiRide')}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Route Map */}
          <div className="w-full h-40 rounded-xl bg-gray-50 border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(0deg, #333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <line x1="30" y1="30" x2="90%" y2="80%" stroke="#DC2626" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            <div className="absolute top-3 left-3 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
              <span className="text-[9px] text-gray-400 mt-0.5">{translate(lang, 'taxiFromLocation')}</span>
            </div>
            <div className="absolute bottom-3 right-3 flex flex-col items-center">
              <MapPin className="w-5 h-5 text-red-500" fill="#EF4444" />
              <span className="text-[9px] text-gray-400 mt-0.5">{districtLabel}</span>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-400">{translate(lang, 'taxiFromLocation')}</span>
            </div>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder={translate(lang, 'taxiFromLocation')}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-200"
              disabled={phase !== 'setup'}
            />
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className="text-xs text-gray-400">{translate(lang, 'taxiToVenue')}:</span>
              <span className="text-xs text-gray-700">{getVenueName(venue, lang)} · {districtLabel}</span>
            </div>
          </div>

          {/* Tariff Selection */}
          {phase === 'setup' && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">{translate(lang, 'taxiEstimate')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {tariffs.map(({ value, label, price, icon: Icon, note }) => (
                  <button
                    key={value}
                    onClick={() => setTariff(value)}
                    className={`flex flex-col items-center gap-1 py-4 rounded-xl border transition-all relative ${
                      tariff === value
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-[10px] opacity-70">{price}</span>
                    {value === 'sober' && <span className="text-[9px] mt-0.5">🍷</span>}
                  </button>
                ))}
              </div>
              {/* Sober Driver Note */}
              {tariff === 'sober' && selectedTariff.note && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <Wine className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{selectedTariff.note}</p>
                </div>
              )}
            </div>
          )}

          {/* Searching State */}
          {phase === 'searching' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin-slow mb-3" />
              <p className="text-sm text-gray-500">{translate(lang, 'taxiSearching')}</p>
            </div>
          )}

          {/* Driver Found State */}
          {phase === 'found' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-red-200 animate-scale-in space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-600">{translate(lang, 'taxiDriverFound')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-lg font-bold text-red-500">D</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Dato K.</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-red-500" fill="currentColor" />
                    <span className="text-xs text-gray-500">4.9 · Toyota Prius</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-red-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{arriveIn}</span>
                    <span className="text-xs">{translate(lang, 'taxiMin')}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{translate(lang, 'taxiArrivingIn')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
                <Navigation className="w-3.5 h-3.5 text-red-500" />
                <span>{translate(lang, 'taxiEstimate')}: <b className="text-red-500">{estimatedFare} ₾</b></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 safe-bottom">
          {phase === 'setup' && (
            <button
              onClick={handleConfirmRide}
              disabled={!pickup}
              className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Car className="w-4 h-4" />
              {translate(lang, 'taxiConfirmRide')}
            </button>
          )}
          {phase === 'found' && (
            <button
              onClick={() => setPhase('confirmed')}
              className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {translate(lang, 'confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
