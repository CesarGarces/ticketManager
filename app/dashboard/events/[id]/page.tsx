import { getEventById, updateEventStatus } from '@/features/events/actions';
import { getProfile } from '@/features/auth/actions';
import { getTicketTypesByEvent } from '@/features/tickets/actions';
import { getOrdersByEvent } from '@/features/orders/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Ticket } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { EventStatus } from '@/domain/types';
import TicketTypeForm from '@/components/ticket-type-form';
import PublishEventButton from '@/components/publish-event-button';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  const { t } = await getTranslation();

  if (!event) {
    notFound();
  }

  const profile = await getProfile();
  const ticketTypes = await getTicketTypesByEvent(id);
  const orders = await getOrdersByEvent(id);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalTicketsSold = ticketTypes.reduce((sum, tt) => sum + tt.quantity_sold, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('dashboard.back_to_dashboard')}
            </Link>
          </div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                  {event.status}
                </Badge>
              </div>
              <p className="text-gray-600">{event.description}</p>
            </div>
            {event.status === EventStatus.DRAFT && ticketTypes.length > 0 && (
              <PublishEventButton eventId={event.id} />
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('dashboard.total_revenue')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue, ticketTypes[0]?.currency || 'USD')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('dashboard.total_sold')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTicketsSold}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('dashboard.orders')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.event_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('dashboard.start')}</div>
                    <div className="text-sm text-gray-600">{formatDate(event.start_date)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('dashboard.end')}</div>
                    <div className="text-sm text-gray-600">{formatDate(event.end_date)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('dashboard.location_label')}</div>
                    <div className="text-sm text-gray-600">{event.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {event.status === EventStatus.PUBLISHED && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.public_page')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('dashboard.share_link')}
                  </p>
                  <Link href={`/events/${event.slug}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      {t('dashboard.view_public')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('dashboard.ticket_types')}</CardTitle>
                  <CardDescription>{t('dashboard.manage_pricing')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ticketTypes.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">{t('dashboard.no_ticket_types')}</p>
                  <TicketTypeForm eventId={event.id} />
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{ticketType.name}</h4>
                        {ticketType.description && (
                          <p className="text-sm text-gray-600">{ticketType.description}</p>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {ticketType.quantity_sold} / {ticketType.quantity_total} {t('dashboard.sold')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {formatCurrency(Number(ticketType.price), ticketType.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <TicketTypeForm eventId={event.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
