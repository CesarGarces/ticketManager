'use client';

import { useState } from 'react';
import { signIn } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onOpenSignup }: LoginModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-indigo-600 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-indigo-900 text-center">{t('auth.welcome')}</CardTitle>
          <CardDescription className="text-center text-gray-600">
            {t('auth.login_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-indigo-900 font-semibold">{t('common.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
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
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('common.or')}</span>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600 text-sm">
            {t('auth.no_account')}{' '}
            <button
              onClick={onOpenSignup}
              className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
            >
              {t('common.signup')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
