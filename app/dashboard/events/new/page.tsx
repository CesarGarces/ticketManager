'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    };

    const result = await createEvent(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.event) {
      router.push(`/dashboard/events/${result.event.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('dashboard.back_to_dashboard')}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.create_new_event')}</CardTitle>
            <CardDescription>
              {t('dashboard.fill_details')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('dashboard.event_title')} *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={t('dashboard.title_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('dashboard.description_label')} *</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('dashboard.description_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('dashboard.location_label')} *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder={t('dashboard.location_placeholder')}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('dashboard.start_date')} *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">{t('dashboard.end_date')} *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? t('dashboard.creating') : t('dashboard.create_event')}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    {t('common.cancel')}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
