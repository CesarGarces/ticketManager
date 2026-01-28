'use client';

import { useState } from 'react';
import { signIn } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    // For clients, we redirect to events or buyer dashboard
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-indigo-600">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-indigo-900 font-semibold">{t('common.password')}</Label>
              </div>
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
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl text-lg font-bold transition-all transform hover:scale-[1.02]" disabled={loading}>
              {loading ? t('auth.logging_in') : t('common.login')}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">{t('auth.new_here')}</span>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 py-6 rounded-xl font-bold">
              <Link href="/signup">{t('auth.create_account_btn')}</Link>
            </Button>

            <p className="text-center text-sm text-gray-400 mt-6">
              {t('auth.is_organizer')}{' '}
              <Link href="/organizer/login" className="text-indigo-600 hover:underline font-semibold">
                {t('auth.access_here')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
