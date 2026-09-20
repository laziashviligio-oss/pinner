import { Home, Search, Gift, User } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';

export type NavTab = 'home' | 'search' | 'rewards' | 'profile';

interface BottomNavProps {
  lang: Lang;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSearchFocus: () => void;
}

export default function BottomNav({ lang, activeTab, onTabChange, onSearchFocus }: BottomNavProps) {
  const tabs: { id: NavTab; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: translate(lang, 'navHome') },
    { id: 'search', icon: Search, label: translate(lang, 'navSearch') },
    { id: 'rewards', icon: Gift, label: translate(lang, 'navRewards') },
    { id: 'profile', icon: User, label: translate(lang, 'navProfile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-200 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                if (tab.id === 'search') onSearchFocus();
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-red-50' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-red-500" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
