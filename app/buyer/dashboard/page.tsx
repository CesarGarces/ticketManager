import { getPurchasesByBuyer } from '@/features/purchases/actions';
import { getProfile } from '@/features/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, ShoppingBag, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import UserNav from '@/components/user-nav';

export default async function BuyerDashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  const purchases = await getPurchasesByBuyer();

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            TicketManager
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" className="text-slate-600 hover:text-indigo-600">
                Browse Events
              </Button>
            </Link>
            <UserNav user={profile as any} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">My Tickets</h1>
              <p className="text-gray-600">Manage your event bookings and history</p>
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
              {purchases.length} total orders
            </div>
          </div>

          {purchases.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                <p className="text-gray-500 mb-6">You haven't purchased any tickets yet. Explore events to find something you'll love!</p>
                <Link href="/events">
                  <Button>Browse events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-2">
                          <Ticket className="w-4 h-4" />
                          {purchase.ticket_type?.name}
                        </div>
                        <h3 className="text-xl font-bold line-clamp-2 leading-tight">
                          {purchase.event?.title}
                        </h3>
                      </div>
                      <div className="mt-4">
                        <Badge variant="secondary" className={`
                          ${purchase.payment_status === 'approved' ? 'bg-green-100 text-green-800' :
                            purchase.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}
                          border-none capitalize
                        `}>
                          {purchase.payment_status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="md:w-2/3 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Date & Time</p>
                              <p className="text-sm font-medium">{formatDate(purchase.event?.start_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Location</p>
                              <p className="text-sm font-medium">{purchase.event?.location}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Ticket className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Quantity</p>
                              <p className="text-sm font-medium">{purchase.quantity} ticket(s)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Order Date</p>
                              <p className="text-sm font-medium">{formatDate(purchase.purchase_date)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Total Paid</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(Number(purchase.ticket_type?.price) * purchase.quantity, purchase.ticket_type?.currency)}
                          </p>
                        </div>
                        <Link href={`/events/${purchase.event?.slug}`}>
                          <Button variant="ghost" size="sm">Event Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
