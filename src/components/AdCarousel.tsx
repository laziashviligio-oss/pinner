import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { Ad } from '@/lib/supabase';

interface AdCarouselProps {
  lang: Lang;
  ads: Ad[];
  onAdClick: (ad: Ad) => void;
}

export default function AdCarousel({ lang, ads, onAdClick }: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeAds = ads.filter(a => a.active && a.type === 'carousel');

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

  useEffect(() => {
    if (scrollRef.current && activeAds.length > 0) {
      const child = scrollRef.current.children[currentIndex] as HTMLElement;
      if (child) {
        scrollRef.current.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' });
      }
    }
  }, [currentIndex, activeAds.length]);

  if (activeAds.length === 0) return null;

  return (
    <div className="px-4 pt-1 pb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{translate(lang, 'sponsored')}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {activeAds.map((ad, idx) => (
          <div
            key={ad.id}
            onClick={() => onAdClick(ad)}
            className={`relative flex-shrink-0 w-[280px] h-[120px] rounded-2xl overflow-hidden cursor-pointer transition-all ${
              idx === currentIndex ? 'animate-glow border-2 border-amber-400' : 'border border-[#3A3A3A]'
            }`}
          >
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-2 left-2">
              <span className="sponsored-badge">{translate(lang, 'sponsored')}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-bold text-white leading-tight mb-0.5 line-clamp-2">{ad.title}</h3>
              {ad.subtitle && <p className="text-[11px] text-gray-300 line-clamp-1">{ad.subtitle}</p>}
            </div>
            <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-[#121212]" />
            </div>
          </div>
        ))}
      </div>
      {/* Dots */}
      {activeAds.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {activeAds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-[#3A3A3A]'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
