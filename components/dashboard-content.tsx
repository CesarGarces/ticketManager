'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, MapPin, Plus, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { EventSalesChart } from '@/components/dashboard/event-sales-chart';
import { TicketDistributionChart } from '@/components/dashboard/ticket-distribution-chart';
import { useTranslation } from '@/i18n/context';
import CreateEventModal from '@/components/create-event-modal';

interface DashboardContentProps {
  events: any[];
  stats: any;
}

export default function DashboardContent({ events, stats }: DashboardContentProps) {
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const { t } = useTranslation();

  const totalSales = stats?.eventSales.reduce((acc: number, ev: any) => acc + ev.sales, 0) || 0;
  const totalRevenue = stats?.eventSales.reduce((acc: number, ev: any) => acc + ev.revenue, 0) || 0;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          <p className="text-gray-600 mt-1">{t('dashboard.description')}</p>
        </div>
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsCreateEventModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.create_event')}
        </Button>
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
              <Button onClick={() => setIsCreateEventModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.create_event')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-indigo-50 overflow-hidden flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
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
                      <Badge
                        variant={event.status === 'published' ? 'default' : 'secondary'}
                        className={event.status === 'published' ? 'bg-indigo-600' : ''}
                      >
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

      <CreateEventModal isOpen={isCreateEventModalOpen} onClose={() => setIsCreateEventModalOpen(false)} />
    </>
  );
}
