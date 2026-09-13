import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-3xl overflow-hidden border-2 border-amber-400 animate-glow animate-scale-in">
        {/* Skip button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Countdown badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <span className="text-xs text-amber-400 font-semibold">
            {translate(lang, 'closingIn')} {countdown}{translate(lang, 'seconds')}
          </span>
        </div>

        {/* Image */}
        {ad.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="sponsored-badge">{translate(lang, 'sponsored')}</span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">{ad.title}</h2>
          {ad.subtitle && <p className="text-sm text-gray-400">{ad.subtitle}</p>}
          <button
            onClick={() => { onAdClick(ad); onClose(); }}
            className="w-full gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {ad.cta_text || translate(lang, 'getDirections')}
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
          >
            {translate(lang, 'skipAd')} →
          </button>
        </div>
      </div>
    </div>
  );
}
