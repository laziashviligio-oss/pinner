import { useState } from 'react';
import { X, Users, Calendar, Phone, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';

interface ReservationModalProps {
  lang: Lang;
  venue: Venue;
  onClose: () => void;
}

export default function ReservationModal({ lang, venue, onClose }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [name, setName] = useState(localStorage.getItem('pinner_username') || '');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  function handleConfirm() {
    localStorage.setItem('pinner_username', name || 'Guest');
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
        <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] animate-slide-up sm:animate-scale-in p-6 text-center safe-bottom">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{translate(lang, 'bookingConfirmed')}</h2>
          <p className="text-sm text-gray-400 mb-4">{translate(lang, 'bookingConfirmedMsg')}</p>
          <div className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] text-left space-y-1 mb-4">
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'venue')}</span><span className="text-gray-200">{venue.name}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'guestsCount')}</span><span className="text-gray-200">{guests}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'date')}</span><span className="text-gray-200">{date} {time}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'name')}</span><span className="text-gray-200">{name || 'Guest'}</span></div>
          </div>
          <button onClick={onClose} className="w-full gold-btn py-2.5 rounded-xl text-sm font-semibold">
            {translate(lang, 'close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A] flex-shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-white">{translate(lang, 'bookTable')}</h2>
            <span className="text-xs text-gray-500">· {venue.name}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-4 py-2 flex-shrink-0">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-amber-400' : 'bg-[#3A3A3A]'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                {translate(lang, 'selectGuests')}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setGuests(n)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      guests === n
                        ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                        : 'border-[#3A3A3A] bg-[#2A2A2A] text-gray-300 hover:border-[#555]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setGuests(11)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    guests === 11
                      ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                      : 'border-[#3A3A3A] bg-[#2A2A2A] text-gray-300 hover:border-[#555]'
                  }`}
                >
                  10+
                </button>
              </div>
              <div className="text-center text-sm text-gray-400">
                <span className="font-bold text-amber-400">{guests === 11 ? '10+' : guests}</span> {translate(lang, 'guestsCount')}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                {translate(lang, 'selectDate')}
              </h3>
              <div>
                <label className="text-xs text-gray-400 font-medium">{translate(lang, 'date')}</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">{translate(lang, 'time')}</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['12:00', '14:00', '16:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        time === t
                          ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                          : 'border-[#3A3A3A] bg-[#2A2A2A] text-gray-300 hover:border-[#555]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                {translate(lang, 'contactInfo')}
              </h3>
              <div>
                <label className="text-xs text-gray-400 font-medium">{translate(lang, 'name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={translate(lang, 'yourName')}
                  className="w-full mt-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">{translate(lang, 'phoneNumber')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+995 5__ ___ ___"
                  className="w-full mt-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              {/* Summary */}
              <div className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'guestsCount')}</span><span className="text-gray-200">{guests === 11 ? '10+' : guests}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'date')}</span><span className="text-gray-200">{date || '—'} {time}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#3A3A3A] px-4 py-3 safe-bottom">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !date}
              className="w-full gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {translate(lang, 'confirm')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!name || !phone}
              className="w-full gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
