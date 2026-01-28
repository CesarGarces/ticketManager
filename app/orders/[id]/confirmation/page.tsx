import { getOrderById } from '@/features/orders/actions';
import { getEventById } from '@/features/events/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Calendar, MapPin, Mail, User } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderData = await getOrderById(id);

  if (!orderData) {
    notFound();
  }

  const { order, items } = orderData;
  const event = await getEventById(order.event_id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Your tickets have been reserved. Check your email for confirmation.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
              </div>
              <Badge>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">{order.customer_name}</div>
                <div className="text-sm text-gray-600">{order.customer_email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">Event Date</div>
                <div className="text-sm text-gray-600">{formatDate(event.start_date)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-gray-600">{event.location}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{item.ticket_type.name}</div>
                    <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(Number(item.subtotal), order.currency)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(Number(item.unit_price), order.currency)} each
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total_amount), order.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Confirmation email sent!</strong>
              <p className="mt-1">
                We've sent your tickets and event details to {order.customer_email}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/buyer/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              View My Tickets
            </Button>
          </Link>
          <div className="mt-4">
            <Link href={`/events/${event.slug}`} className="text-sm text-gray-500 hover:text-indigo-600 font-medium">
              Back to Event Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
