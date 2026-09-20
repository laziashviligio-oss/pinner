import { useState, useRef, useEffect } from 'react';
import { MapPin, Cloud, ChevronDown, Globe, Users, Building2, Shield, Star } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { Role } from '@/lib/types';

interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role;
  setRole: (r: Role) => void;
  weather: { temp: number; condition: string; icon: string };
  onWeatherClick: () => void;
}

export default function Header({ lang, setLang, role, setRole, weather, onWeatherClick }: HeaderProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const roleIcons: Record<Role, typeof Users> = {
    client: Users,
    manager: Building2,
    admin: Shield,
  };

  const RoleIcon = roleIcons[role];

  const roleLabels: Record<Role, string> = {
    client: translate(lang, 'client'),
    manager: translate(lang, 'venueManager'),
    admin: translate(lang, 'superAdmin'),
  };

  const langLabels: Record<Lang, string> = { en: 'ENG', ka: 'ქართ', ru: 'РУС' };

  return (
    <header className="glass sticky top-0 z-40 safe-top border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md shadow-red-500/20">
            <Star className="w-5 h-5 text-white" fill="#FFFFFF" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-gray-900 leading-none">{translate(lang, 'appName')}</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">{translate(lang, 'appTagline')}</p>
          </div>
        </div>

        {/* Weather Widget */}
        <button
          onClick={onWeatherClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-red-400 transition-colors flex-shrink-0 shadow-sm"
        >
          <Cloud className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-red-500">{weather.temp}°</span>
          <span className="text-sm">{weather.icon}</span>
        </button>

        {/* Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-red-400 transition-colors shadow-sm"
          >
            <RoleIcon className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-gray-700 hidden sm:inline">{roleLabels[role]}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-scale-in z-50">
              {(['client', 'manager', 'admin'] as Role[]).map((r) => {
                const Icon = roleIcons[r];
                return (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setRoleOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${role === r ? 'bg-red-50' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${role === r ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${role === r ? 'text-red-600' : 'text-gray-700'}`}>
                      {roleLabels[r]}
                    </span>
                    {role === r && <div className="ml-auto w-2 h-2 rounded-full bg-red-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-red-400 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-gray-700">{langLabels[lang]}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-scale-in z-50">
              {(['en', 'ka', 'ru'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${lang === l ? 'bg-red-50' : ''}`}
                >
                  <span className={`text-sm font-medium ${lang === l ? 'text-red-600' : 'text-gray-700'}`}>
                    {langLabels[l]}
                  </span>
                  {lang === l && <div className="ml-auto w-2 h-2 rounded-full bg-red-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
