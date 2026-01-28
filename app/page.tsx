import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Ticket, Users } from 'lucide-react';
import { getTranslation } from '@/i18n/server';

export default async function HomePage() {
  const { t } = await getTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t('home.hero_title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('home.hero_subtitle')}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-16">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                {t('home.organizer_login')}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.feature_create_title')}</h3>
              <p className="text-gray-600">
                {t('home.feature_create_desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.feature_sell_title')}</h3>
              <p className="text-gray-600">
                {t('home.feature_sell_desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.feature_manage_title')}</h3>
              <p className="text-gray-600">
                {t('home.feature_manage_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
