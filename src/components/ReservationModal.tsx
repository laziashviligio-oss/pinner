import { useState } from 'react';
import { X, Users, Calendar, Phone, CheckCircle2, ChevronRight, ChevronLeft, Armchair, Sun, Layout } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';

interface ReservationModalProps {
  lang: Lang;
  venue: Venue;
  onClose: () => void;
  preselectedTime?: string;
}

export default function ReservationModal({ lang, venue, onClose, preselectedTime }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [tableLocation, setTableLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(preselectedTime || '19:00');
  const [name, setName] = useState(localStorage.getItem('pinner_username') || '');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const totalSteps = 4;

  const locationOptions = [
    { value: 'indoor', label: translate(lang, 'indoorSeating'), icon: Layout },
    { value: 'outdoor', label: translate(lang, 'outdoorSeating2'), icon: Sun },
    { value: 'window', label: translate(lang, 'windowSeating'), icon: Armchair },
  ];

  function handleConfirm() {
    localStorage.setItem('pinner_username', name || 'Guest');
    setConfirmed(true);
  }

  const locationLabel = locationOptions.find(o => o.value === tableLocation)?.label || '—';

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
        <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 shadow-xl animate-slide-up sm:animate-scale-in p-6 text-center safe-bottom">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{translate(lang, 'bookingConfirmed')}</h2>
          <p className="text-sm text-gray-500 mb-4">{translate(lang, 'bookingConfirmedMsg')}</p>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-left space-y-1 mb-4">
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'venue')}</span><span className="text-gray-700 font-medium">{getVenueName(venue, lang)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'guestsCount')}</span><span className="text-gray-700 font-medium">{guests === 11 ? '10+' : guests}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'tableLocation')}</span><span className="text-gray-700 font-medium">{locationLabel}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'date')}</span><span className="text-gray-700 font-medium">{date} {time}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'name')}</span><span className="text-gray-700 font-medium">{name || 'Guest'}</span></div>
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
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 shadow-xl max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-gray-900">{translate(lang, 'bookTable')}</h2>
            <span className="text-xs text-gray-400">· {getVenueName(venue, lang)}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-4 py-2 flex-shrink-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < step ? 'bg-red-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                {translate(lang, 'selectGuests')}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setGuests(n)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      guests === n
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setGuests(11)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    guests === 11
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  10+
                </button>
              </div>
              <div className="text-center text-sm text-gray-400">
                <span className="font-bold text-red-500">{guests === 11 ? '10+' : guests}</span> {translate(lang, 'guestsCount')}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Armchair className="w-4 h-4 text-red-500" />
                {translate(lang, 'selectTableLocation')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {locationOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTableLocation(value)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                      tableLocation === value
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                {translate(lang, 'selectDate')}
              </h3>
              <div>
                <label className="text-xs text-gray-500 font-medium">{translate(lang, 'date')}</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 bg-white border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">{translate(lang, 'time')}</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['12:00', '14:00', '16:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        time === t
                          ? 'border-red-500 bg-red-600 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500" />
                {translate(lang, 'contactInfo')}
              </h3>
              <div>
                <label className="text-xs text-gray-500 font-medium">{translate(lang, 'name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={translate(lang, 'yourName')}
                  className="w-full mt-1 bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">{translate(lang, 'phoneNumber')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+995 5__ ___ ___"
                  className="w-full mt-1 bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                />
              </div>
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'guestsCount')}</span><span className="text-gray-700 font-medium">{guests === 11 ? '10+' : guests}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'tableLocation')}</span><span className="text-gray-700 font-medium">{locationLabel}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'date')}</span><span className="text-gray-700 font-medium">{date || '—'} {time}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 safe-bottom">
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 2 && !tableLocation) || (step === 3 && !date)}
              className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {translate(lang, 'confirm')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!name || !phone}
              className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {translate(lang, 'confirmBooking')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
