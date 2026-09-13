import { useState } from 'react';
import { X, MapPin, CheckCircle2, ChevronLeft, CreditCard } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';
import type { CartItem } from './MenuModal';

interface DeliveryCheckoutModalProps {
  lang: Lang;
  venue: Venue;
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onBack: () => void;
}

export default function DeliveryCheckoutModal({ lang, venue, cart, cartTotal, onClose, onBack }: DeliveryCheckoutModalProps) {
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const deliveryFee = 5;
  const grandTotal = cartTotal + deliveryFee;

  function getCartItemName(item: CartItem): string {
    if (lang === 'ka' && item.name_ka) return item.name_ka;
    if (lang === 'ru' && item.name_ru) return item.name_ru;
    return item.name;
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
        <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] animate-slide-up sm:animate-scale-in p-6 text-center safe-bottom">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{translate(lang, 'orderConfirmed')}</h2>
          <p className="text-sm text-gray-400 mb-4">{translate(lang, 'orderConfirmedMsg')}</p>
          <div className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] text-left space-y-1 mb-4">
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'venue')}</span><span className="text-gray-200">{venue.name}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'deliveryAddress')}</span><span className="text-gray-200 truncate max-w-[180px]">{address}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">{translate(lang, 'orderTotal')}</span><span className="text-amber-400 font-bold">{grandTotal.toFixed(0)} ₾</span></div>
          </div>
          <button onClick={onBack} className="w-full gold-btn py-2.5 rounded-xl text-sm font-semibold">
            {translate(lang, 'close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A] flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-white">{translate(lang, 'checkout')}</h2>
          </div>
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Delivery Address */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              {translate(lang, 'deliveryAddress')}
            </h3>
            {/* Mini map placeholder with pin */}
            <div className="w-full h-32 rounded-xl bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(0deg, #333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="w-8 h-8 text-amber-400" fill="#F59E0B" />
                <span className="text-[10px] text-gray-500 mt-1">{venue.district}</span>
              </div>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={translate(lang, 'deliveryAddress')}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={translate(lang, 'deliveryInstructions')}
              rows={2}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">{translate(lang, 'cart')}</h3>
            <div className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">
                    <span className="text-amber-400 font-medium">{item.quantity}×</span> {getCartItemName(item)}
                  </span>
                  <span className="text-gray-400">{(item.price * item.quantity).toFixed(0)} ₾</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{translate(lang, 'subtotal')}</span>
              <span className="text-gray-300">{cartTotal.toFixed(0)} ₾</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{translate(lang, 'deliveryFee')}</span>
              <span className="text-gray-300">{deliveryFee} ₾</span>
            </div>
            <div className="h-px bg-[#3A3A3A] my-1" />
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-white">{translate(lang, 'orderTotal')}</span>
              <span className="text-lg font-bold text-amber-400">{grandTotal.toFixed(0)} ₾</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#3A3A3A] px-4 py-3 safe-bottom">
          <button
            onClick={() => setConfirmed(true)}
            disabled={!address}
            className="w-full gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {translate(lang, 'proceedToPayment')}
          </button>
        </div>
      </div>
    </div>
  );
}
