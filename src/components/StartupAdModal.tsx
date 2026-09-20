import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getAdTitle, getAdSubtitle, getAdCta } from '@/lib/i18n';
import type { Ad } from '@/lib/supabase';

interface StartupAdModalProps {
  lang: Lang;
  ad: Ad | null;
  onClose: () => void;
  onAdClick: (ad: Ad) => void;
}

export default function StartupAdModal({ lang, ad, onClose, onAdClick }: StartupAdModalProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!ad) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ad, onClose]);

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden border-2 border-red-500 shadow-2xl animate-scale-in">
        {/* Skip button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Countdown badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
          <span className="text-xs text-red-400 font-semibold">
            {translate(lang, 'closingIn')} {countdown}{translate(lang, 'seconds')}
          </span>
        </div>

        {/* Image */}
        {ad.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img src={ad.image_url} alt={getAdTitle(ad, lang)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="sponsored-badge">{translate(lang, 'sponsored')}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{getAdTitle(ad, lang)}</h2>
          {getAdSubtitle(ad, lang) && <p className="text-sm text-gray-500">{getAdSubtitle(ad, lang)}</p>}
          <button
            onClick={() => { onAdClick(ad); onClose(); }}
            className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {getAdCta(ad, lang) || translate(lang, 'getDirections')}
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            {translate(lang, 'skipAd')} →
          </button>
        </div>
      </div>
    </div>
  );
}
