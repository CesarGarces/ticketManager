import { getProfile } from '@/features/auth/actions';
import { getEvents, getDashboardStats } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, MapPin, Plus, TrendingUp, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { EventSalesChart } from '@/components/dashboard/event-sales-chart';
import { TicketDistributionChart } from '@/components/dashboard/ticket-distribution-chart';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';

export default async function DashboardPage() {
  const profile = await getProfile();
  const events = await getEvents();
  const stats = await getDashboardStats();
  const { t } = await getTranslation();

  const totalSales = stats?.eventSales.reduce((acc, ev) => acc + ev.sales, 0) || 0;
  const totalRevenue = stats?.eventSales.reduce((acc, ev) => acc + ev.revenue, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
            <p className="text-gray-600 mt-1">{t('dashboard.description')}</p>
          </div>
          <Link href="/dashboard/events/new">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.create_event')}
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.total_sold')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">+20% {t('dashboard.stats_from_last_month')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.total_revenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">+15% {t('dashboard.stats_from_last_month')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.active_events')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === 'published').length}</div>
              <p className="text-xs text-muted-foreground">{events.length} {t('dashboard.my_events').toLowerCase()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {events.length > 0 && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t('dashboard.event_sales')}</CardTitle>
                <CardDescription>{t('dashboard.tickets_per_event')}</CardDescription>
              </CardHeader>
              <CardContent>
                <EventSalesChart data={stats.eventSales} />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t('dashboard.ticket_distribution')}</CardTitle>
                <CardDescription>{t('dashboard.sales_by_category')}</CardDescription>
              </CardHeader>
              <CardContent>
                <TicketDistributionChart data={stats.typeDistribution} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.recent_events')}</h3>
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.no_events')}</h3>
                <p className="text-gray-600 mb-6">{t('dashboard.create_first')}</p>
                <Link href="/dashboard/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dashboard.create_event')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-indigo-50">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className={event.status === 'published' ? 'bg-indigo-600' : ''}>
                          {event.status}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
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
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
