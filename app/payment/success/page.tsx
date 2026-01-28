import { getPurchaseById, updatePurchasePaymentStatus } from '@/features/purchases/actions';
import { getPaymentInfo } from '@/services/mercadopago/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, Ticket, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase_id: string; payment_id: string; status: string }>;
}) {
  const { purchase_id, payment_id, status } = await searchParams;

  if (!purchase_id) {
    notFound();
  }

  // Get current purchase data
  let purchase = await getPurchaseById(purchase_id);

  if (!purchase) {
    notFound();
  }

  // If we have a payment_id from the return URL, verify and update status immediately 
  // (MercadoPago returns status in the query params)
  if (payment_id && purchase.payment_status !== 'approved') {
    const paymentInfo = await getPaymentInfo(payment_id);
    if (paymentInfo.status === 'approved') {
      await updatePurchasePaymentStatus(purchase_id, payment_id, 'approved');
      // Fetch again to get updated status
      purchase = await getPurchaseById(purchase_id);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full shadow-2xl border-t-8 border-t-green-500 overflow-hidden">
        <div className="bg-green-50 p-8 text-center border-b">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h1>
          <p className="text-green-700">Thank you for your purchase. Your tickets are confirmed.</p>
        </div>

        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Order Reference</span>
              <span className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded">{purchase.id.slice(0, 8).toUpperCase()}</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{purchase.event?.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(purchase.event?.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{purchase.event?.location}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{purchase.ticket_type?.name}</p>
                    <p className="text-xs text-gray-500">{purchase.quantity} ticket(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Amount Paid</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(Number(purchase.ticket_type?.price) * purchase.quantity, purchase.ticket_type?.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <Link href="/buyer/dashboard" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                  Access My Tickets <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  <Home className="w-4 h-4" /> Go to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
