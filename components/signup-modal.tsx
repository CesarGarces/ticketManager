'use client';

import { useState, useEffect } from 'react';
import { signUp } from '@/features/auth/signup-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/context';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onOpenLogin }: SignupModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const { t } = useTranslation();
  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      <Card ref={modalRef} className={`w-full max-w-md shadow-2xl border-t-4 border-t-indigo-600 relative transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-indigo-900 text-center">{t('auth.signup_title')}</CardTitle>
          <CardDescription className="text-center text-gray-600">
            {t('auth.signup_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-indigo-900 font-semibold">{t('common.name')}</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-indigo-900 font-semibold">{t('common.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                className="border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-indigo-900 font-semibold">{t('common.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {loading ? t('auth.creating_account') : t('common.signup')}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            {t('auth.already_account')}{' '}
            <button
              onClick={onOpenLogin}
              className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
            >
              {t('common.login')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
