import { getEventBySlug } from '@/features/events/actions';
import { getTicketTypesByEvent } from '@/features/tickets/actions';
import { getProfile } from '@/features/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MercadoPagoPurchaseButton from '@/components/mercadopago-purchase-button';
import { getTranslation } from '@/i18n/server';
import NavHeader from '@/components/nav-header';
import { USER_TYPE } from '@/lib/constants';

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  const profile = await getProfile();
  const { t } = await getTranslation();

  if (!event) {
    notFound();
  }

  const ticketTypes = await getTicketTypesByEvent(event.id);
  const availableTickets = ticketTypes.filter(
    tt => tt.quantity_sold < tt.quantity_total
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-indigo-600 pl-0">
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
            <div className={`relative p-8 md:p-12 text-center text-white ${!event.image_url ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}>
              {event.image_url && (
                <>
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              )}

              <div className="relative">
                {profile?.role === USER_TYPE.ORGANIZER && (
                  <Badge className="mb-4 bg-white text-blue-600 capitalize">
                    {event.status}
                  </Badge>
                )}
                <h1 className="text-4xl font-bold mb-4 text-shadow">{event.title}</h1>
                <p className="text-lg text-blue-50 text-shadow-sm">{event.description}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t('events.date_time')}</div>
                    <div className="text-gray-600">{formatDate(event.start_date)}</div>
                    <div className="text-sm text-gray-500">{t('events.to')} {formatDate(event.end_date)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t('events.location')}</div>
                    <div className="text-gray-600">{event.location}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Ticket className="w-6 h-6" />
                  {t('events.get_tickets')}
                </h2>

                {availableTickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">
                        {t('events.tickets_sold_out')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ticketTypes.map((ticketType) => {
                      const available = ticketType.quantity_total - ticketType.quantity_sold;
                      const isSoldOut = available <= 0;

                      return (
                        <Card key={ticketType.id} className={isSoldOut ? 'opacity-60' : ''}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {ticketType.name}
                                  {isSoldOut && (
                                    <Badge variant="secondary">{t('events.sold_out')}</Badge>
                                  )}
                                </CardTitle>
                                {ticketType.description && (
                                  <CardDescription>{ticketType.description}</CardDescription>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {formatCurrency(Number(ticketType.price), ticketType.currency)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                {available} {t('events.remaining')}
                              </div>
                              {!isSoldOut && (
                                <MercadoPagoPurchaseButton
                                  eventId={event.id}
                                  ticketTypeId={ticketType.id}
                                  quantity={1}
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
