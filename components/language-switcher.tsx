'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/context';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, changeLanguage } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: 'en' | 'es') => {
    if (newLocale !== locale) {
      changeLanguage(newLocale);
      window.location.reload();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 px-3 hover:bg-gray-100 rounded-full transition-colors h-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-bold text-gray-700 uppercase">{locale}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => handleLanguageChange('en')}
            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇺🇸</span>
              <span className={locale === 'en' ? 'font-bold text-indigo-600' : 'text-gray-600'}>English</span>
            </div>
            {locale === 'en' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => handleLanguageChange('es')}
            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇪🇸</span>
              <span className={locale === 'es' ? 'font-bold text-indigo-600' : 'text-gray-600'}>Español</span>
            </div>
            {locale === 'es' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      )}
    </div>
  );
}
