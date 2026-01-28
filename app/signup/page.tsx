'use client';

import { useState } from 'react';
import { signUp } from '@/features/auth/signup-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';

export default function SignUpPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('auth.signup_title')}</CardTitle>
          <CardDescription>
            {t('auth.signup_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('common.name')}</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('common.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.creating_account') : t('common.signup')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              {t('auth.already_account')}{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                {t('common.login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
