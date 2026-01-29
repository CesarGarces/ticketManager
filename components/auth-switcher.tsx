'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogIn, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/context';

export default function AuthSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 px-3 hover:bg-gray-100 rounded-full transition-colors h-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="w-4 h-4 text-gray-600" />
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-200">
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-700">
              {t('common.login')}
            </button>
          </Link>
          <Link href="/signup" onClick={() => setIsOpen(false)}>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors text-indigo-600 font-medium border-t border-gray-100">
              {t('common.signup')}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
