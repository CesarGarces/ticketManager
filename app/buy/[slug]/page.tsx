import { getEventBySlug } from '@/features/events/actions';
import { getTicketTypesByEvent } from '@/features/tickets/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, ShieldCheck, ChevronLeft } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import MercadoPagoPurchaseButton from '@/components/mercadopago-purchase-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function BuyEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const ticketTypes = await getTicketTypesByEvent(event.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold truncate">{event.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left Column: Event Information */}
          <div className="lg:w-3/5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white flex flex-col justify-end">
                <Badge className="w-fit mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                  {event.status}
                </Badge>
                <h2 className="text-4xl font-bold line-clamp-2">{event.title}</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Date & Time</div>
                      <div className="text-sm text-gray-600">{formatDate(event.start_date)}</div>
                      <div className="text-xs text-gray-500">starts at {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 text-purple-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Location</div>
                      <div className="text-sm text-gray-600">{event.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Secure Purchase</h4>
                <p className="text-sm text-blue-700">
                  Your transaction is protected by MercadoPago. We don't store your credit card information.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Selection */}
          <div className="lg:w-2/5 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-blue-600" />
              Select Your Ticket
            </h3>

            {ticketTypes.map((ticketType) => {
              const available = ticketType.quantity_total - ticketType.quantity_sold;
              const isSoldOut = available <= 0;

              return (
                <Card key={ticketType.id} className={`${isSoldOut ? 'opacity-50 grayscale' : 'hover:border-blue-300 transition-colors shadow-sm'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">{ticketType.name}</CardTitle>
                        {ticketType.description && (
                          <CardDescription className="text-xs mt-1">{ticketType.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant={isSoldOut ? 'outline' : 'default'} className={isSoldOut ? '' : 'bg-blue-600'}>
                        {isSoldOut ? 'Sold Out' : 'Available'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 font-medium">Price</div>
                        <div className="text-2xl font-black text-gray-900 leading-none">
                          {formatCurrency(Number(ticketType.price), ticketType.currency)}
                        </div>
                      </div>

                      {!isSoldOut && (
                        <MercadoPagoPurchaseButton
                          eventId={event.id}
                          ticketTypeId={ticketType.id}
                          quantity={1}
                        />
                      )}
                    </div>
                    {!isSoldOut && (
                      <div className="text-[10px] text-gray-400 mt-4 text-center">
                        {available} tickets remaining
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">
                Need help? <Link href="#" className="underline font-medium">Contact support</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
