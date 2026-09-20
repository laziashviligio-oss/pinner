import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';

interface InstallPromptProps {
  lang: Lang;
  deferredPrompt: any | null;
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallPrompt({ lang, deferredPrompt, onInstall, onDismiss }: InstallPromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      const dismissed = localStorage.getItem('pinner_install_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [deferredPrompt]);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-up">
      <div className="max-w-sm mx-auto bg-white border border-red-200 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">{translate(lang, 'installApp')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{translate(lang, 'appName')} · {translate(lang, 'appTagline')}</p>
          </div>
          <button onClick={() => { setVisible(false); onDismiss(); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => { setVisible(false); onInstall(); }}
          className="w-full red-btn mt-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {translate(lang, 'installNow')}
        </button>
      </div>
    </div>
  );
}
