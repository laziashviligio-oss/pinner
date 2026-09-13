import { useState, useEffect } from 'react';
import { X, Plus, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import { supabase, type Venue, type MenuItem } from '@/lib/supabase';
import DeliveryCheckoutModal from './DeliveryCheckoutModal';

interface MenuModalProps {
  lang: Lang;
  venue: Venue;
  onClose: () => void;
}

export type CartItem = MenuItem & { quantity: number };

export default function MenuModal({ lang, venue, onClose }: MenuModalProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('venue_id', venue.id)
        .order('category', { ascending: true });
      setItems(data || []);
      setLoading(false);
    }
    loadMenu();
  }, [venue.id]);

  const categories = [
    { key: 'all', label: translate(lang, 'all') },
    { key: 'appetizer', label: translate(lang, 'appetizers') },
    { key: 'main', label: translate(lang, 'mainDishes') },
    { key: 'drink', label: translate(lang, 'drinks') },
    { key: 'dessert', label: translate(lang, 'desserts') },
  ];

  const filteredItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  function getMenuItemName(item: MenuItem): string {
    if (lang === 'ka' && item.name_ka) return item.name_ka;
    if (lang === 'ru' && item.name_ru) return item.name_ru;
    return item.name;
  }

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (showCheckout) {
    return (
      <DeliveryCheckoutModal
        lang={lang}
        venue={venue}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setShowCheckout(false)}
        onBack={() => { setShowCheckout(false); onClose(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl overflow-hidden border-t sm:border border-[#3A3A3A] max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A] flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">{translate(lang, 'viewMenu')}</h2>
            <span className="text-xs text-gray-500">· {venue.name}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-b border-[#3A3A3A] flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                  : 'bg-[#2A2A2A] border border-[#3A3A3A] text-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin-slow" />
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">{translate(lang, 'noData')}</p>
          ) : (
            filteredItems.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div key={item.id} className="flex items-center gap-3 bg-[#2A2A2A] rounded-xl p-3 border border-[#3A3A3A]">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{getMenuItemName(item)}</h4>
                    {item.description && <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.description}</p>}
                    <span className="text-sm font-bold text-amber-400 mt-1 block">{item.price} ₾</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inCart && (
                      <>
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#3A3A3A] flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold text-amber-400 min-w-[20px] text-center">{inCart.quantity}</span>
                      </>
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-lg gold-btn flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Bar */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#3A3A3A] bg-[#1a1a1a] px-4 py-3 safe-bottom">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full flex items-center justify-between gap-3 py-3 rounded-xl gold-btn px-4"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-semibold">{translate(lang, 'checkout')}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">{cartTotal.toFixed(0)} ₾</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
