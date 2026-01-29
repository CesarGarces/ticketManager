'use client';

import { useState } from 'react';
import { LogIn, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/context';
import { useClickOutside } from '@/hooks/useClickOutside';
import LoginModal from '@/components/login-modal';
import SignupModal from '@/components/signup-modal';

export default function AuthSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));
  const { t } = useTranslation();

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
          <button
            onClick={() => {
              setIsLoginModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-700"
          >
            {t('common.login')}
          </button>
          <button
            onClick={() => {
              setIsSignupModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors text-indigo-600 font-medium border-t border-gray-100"
          >
            {t('common.signup')}
          </button>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}
