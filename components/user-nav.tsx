'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, LayoutDashboard, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/features/auth/actions';
import Link from 'next/link';

import { useTranslation } from '@/i18n/context';

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, locale, changeLanguage } = useTranslation();

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
        className="flex items-center gap-2 px-2 hover:bg-gray-100 rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200">
          <User className="w-5 h-5" />
        </div>
        <div className="hidden sm:flex flex-col items-start text-xs">
          <span className="font-semibold text-gray-900 leading-none mb-0.5 capitalize">
            {user.name || t('common.account')}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-1 border-b border-gray-50">
            {user.role === 'organizer' ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-50 rounded-lg">
                  <LayoutDashboard className="w-4 h-4 mr-2 text-gray-400" />
                  {t('common.dashboard')}
                </Button>
              </Link>
            ) : (
              <Link href="/buyer/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-50 rounded-lg">
                  <Ticket className="w-4 h-4 mr-2 text-gray-400" />
                  {t('common.my_tickets')}
                </Button>
              </Link>
            )}
          </div>


          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.signout')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
