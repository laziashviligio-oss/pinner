import { useState } from 'react';
import { X, MapPin, CheckCircle2, ChevronLeft, CreditCard, Banknote, Bike, Store, UtensilsCrossed } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate, getVenueName } from '@/lib/i18n';
import type { Venue } from '@/lib/supabase';
import { DISTRICT_KEYS } from '@/lib/types';
import type { CartItem } from './MenuModal';

interface DeliveryCheckoutModalProps {
  lang: Lang;
  venue: Venue;
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onBack: () => void;
}

type OrderType = 'dinein' | 'delivery' | 'pickup';

export default function DeliveryCheckoutModal({ lang, venue, cart, cartTotal, onClose, onBack }: DeliveryCheckoutModalProps) {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [confirmed, setConfirmed] = useState(false);

  const deliveryFee = 5;
  const grandTotal = orderType === 'delivery' ? cartTotal + deliveryFee : cartTotal;
  const districtKey = DISTRICT_KEYS[venue.district];
  const districtLabel = districtKey ? translate(lang, districtKey as any) : venue.district;

  const orderTypeOptions: { value: OrderType; label: string; icon: typeof Bike }[] = [
    { value: 'dinein', label: translate(lang, 'dineIn'), icon: UtensilsCrossed },
    { value: 'delivery', label: translate(lang, 'deliveryOption'), icon: Bike },
    { value: 'pickup', label: translate(lang, 'pickupOption'), icon: Store },
  ];

  function getCartItemName(item: CartItem): string {
    if (lang === 'ka' && item.name_ka) return item.name_ka;
    if (lang === 'ru' && item.name_ru) return item.name_ru;
    return item.name;
  }

  const orderTypeLabel = orderType === 'dinein' ? translate(lang, 'dineIn')
    : orderType === 'delivery' ? translate(lang, 'deliveryOption') : translate(lang, 'pickupOption');

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
        <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 shadow-xl animate-slide-up sm:animate-scale-in p-6 text-center safe-bottom">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{translate(lang, 'orderConfirmed')}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {orderType === 'dinein' ? translate(lang, 'dineInOrder') : translate(lang, 'orderConfirmedMsg')}
          </p>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-left space-y-1 mb-4">
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'venue')}</span><span className="text-gray-700 font-medium">{getVenueName(venue, lang)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'category')}</span><span className="text-gray-700 font-medium">{orderTypeLabel}</span></div>
            {orderType === 'dinein' && tableNumber && (
              <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'tableNumber')}</span><span className="text-gray-700 font-medium">#{tableNumber}</span></div>
            )}
            {orderType === 'delivery' && address && (
              <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'deliveryAddress')}</span><span className="text-gray-700 truncate max-w-[180px]">{address}</span></div>
            )}
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'paymentMethod')}</span><span className="text-gray-700 font-medium">{paymentMethod === 'card' ? translate(lang, 'payByCard') : translate(lang, 'payByCash')}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{translate(lang, 'orderTotal')}</span><span className="text-red-500 font-bold">{grandTotal.toFixed(0)} ₾</span></div>
          </div>
          <button onClick={onBack} className="w-full red-btn py-2.5 rounded-xl text-sm font-semibold">
            {translate(lang, 'close')}
          </button>
        </div>
      </div>
    );
  }

  const canProceed = orderType === 'dinein' ? !!tableNumber : orderType === 'delivery' ? !!address : true;

  return (
    <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-gray-200 shadow-xl max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-gray-900">{translate(lang, 'checkout')}</h2>
          </div>
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* 3-Way Order Type Toggle */}
          <div className="grid grid-cols-3 gap-2">
            {orderTypeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setOrderType(value)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                  orderType === value
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Dine-In: Table Number Selector */}
          {orderType === 'dinein' && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-red-500" />
                {translate(lang, 'tableNumber')}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }, (_, i) => String(i + 1)).map(n => (
                  <button
                    key={n}
                    onClick={() => setTableNumber(n)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      tableNumber === n
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                <UtensilsCrossed className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{translate(lang, 'placeOrderAtTable')}</p>
                  <p className="text-xs text-gray-400">{getVenueName(venue, lang)} · {districtLabel}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery: Address + Map */}
          {orderType === 'delivery' && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                {translate(lang, 'deliveryAddress')}
              </h3>
              <div className="w-full h-32 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, #E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-red-500" fill="#EF4444" />
                  <span className="text-[10px] text-gray-400 mt-1">{districtLabel}</span>
                </div>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={translate(lang, 'deliveryAddress')}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              />
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={translate(lang, 'deliveryInstructions')}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15 resize-none"
              />
            </div>
          )}

          {/* Pickup Info */}
          {orderType === 'pickup' && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3">
              <Store className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{translate(lang, 'pickupAtVenue')}</p>
                <p className="text-xs text-gray-400">{getVenueName(venue, lang)} · {districtLabel}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">{translate(lang, 'paymentMethod')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {translate(lang, 'payByCard')}
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                {translate(lang, 'payByCash')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">{translate(lang, 'cart')}</h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    <span className="text-red-500 font-medium">{item.quantity}×</span> {getCartItemName(item)}
                  </span>
                  <span className="text-gray-500">{(item.price * item.quantity).toFixed(0)} ₾</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{translate(lang, 'subtotal')}</span>
              <span className="text-gray-600">{cartTotal.toFixed(0)} ₾</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{translate(lang, 'deliveryFee')}</span>
                <span className="text-gray-600">{deliveryFee} ₾</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-900">{translate(lang, 'orderTotal')}</span>
              <span className="text-lg font-bold text-red-500">{grandTotal.toFixed(0)} ₾</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 safe-bottom">
          <button
            onClick={() => setConfirmed(true)}
            disabled={!canProceed}
            className="w-full red-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {paymentMethod === 'card' ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
            {translate(lang, 'proceedToPayment')}
          </button>
        </div>
      </div>
    </div>
  );
}
