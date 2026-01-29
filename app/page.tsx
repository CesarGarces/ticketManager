import { getPublicEvents } from '@/features/events/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';
import AppFooter from '@/components/app-footer';
import { EventFilters } from '@/components/event-filters';
import { getEventCategories } from '@/features/events/actions';
import { FeaturedEventHero } from '@/components/featured-event-hero';

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const { search, category } = await searchParams;
  const categories = await getEventCategories();
  const events = await getPublicEvents({ search, categoryId: category });
  const { t } = await getTranslation();

  // Simple logic to pick a featured event: first one with an image
  // In a real app, this would be a specific query or flag
  const featuredEvent = !search && !category ? events.find(e => e.image_url) : null;
  const eventsToList = featuredEvent ? events.filter(e => e.id !== featuredEvent.id) : events;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">

          {featuredEvent && featuredEvent.image_url && (
            <FeaturedEventHero event={{
              id: featuredEvent.id,
              title: featuredEvent.title,
              city: featuredEvent.location,
              date: featuredEvent.start_date,
              imageUrl: featuredEvent.image_url,
              category: categories.find(c => c.id === featuredEvent.category_id)?.name || 'Event',
              slug: featuredEvent.slug
            }}
              ctaLabel={t('events.get_tickets')}
            />
          )}

          <div className="mb-12 text-center text-slate-900">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              {t('events.explore')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('events.upcoming')}
            </p>
          </div>

          <EventFilters categories={categories} />

          {eventsToList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-indigo-50">
              <p className="text-gray-500 text-lg">
                {(search || category) ? t('events.no_results') || 'No se encontraron eventos para esta búsqueda.' : t('events.no_upcoming')}
              </p>
              {(search || category) && (
                <Link href="/">
                  <Button variant="link" className="mt-4 text-indigo-600">
                    Limpiar filtros
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-slate-900">
              {eventsToList.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-indigo-50 group">
                  <div className="h-48 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-6 text-white text-center">
                        <h3 className="text-2xl font-bold">{event.title}</h3>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="capitalize bg-indigo-50 text-indigo-700 border-indigo-100">
                        {event.location}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1 group-hover:text-indigo-600 transition-colors">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-auto">
                    <Link href={`/events/${event.slug}`} className="w-full">
                      <Button className="w-full mt-4 bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300 shadow-sm" variant="outline">
                        {t('common.view_details')} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
