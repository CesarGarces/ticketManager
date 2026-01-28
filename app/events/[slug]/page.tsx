import { getEventBySlug } from '@/features/events/actions';
import { getTicketTypesByEvent } from '@/features/tickets/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import TicketSelector from '@/components/ticket-selector';

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const ticketTypes = await getTicketTypesByEvent(event.id);
  const availableTickets = ticketTypes.filter(
    tt => tt.quantity_sold < tt.quantity_total
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <Badge className="mb-4 bg-white text-blue-600">
                {event.status}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-blue-50">{event.description}</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Date & Time</div>
                    <div className="text-gray-600">{formatDate(event.start_date)}</div>
                    <div className="text-sm text-gray-500">to {formatDate(event.end_date)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600">{event.location}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Ticket className="w-6 h-6" />
                  Get Your Tickets
                </h2>

                {availableTickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">
                        Sorry, all tickets are sold out for this event.
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
                                    <Badge variant="secondary">Sold Out</Badge>
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
                                {available} tickets remaining
                              </div>
                              {!isSoldOut && (
                                <TicketSelector
                                  eventId={event.id}
                                  ticketType={ticketType}
                                  maxQuantity={Math.min(available, 10)}
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
      </div>
    </div>
  );
}
