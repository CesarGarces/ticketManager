import { NextResponse } from 'next/server';
import { getPaymentInfo, verifyWebhookSignature } from '@/services/mercadopago/client';
import { updatePurchasePaymentStatus } from '@/features/purchases/actions';

export async function POST(request: Request) {
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const signature = request.headers.get('x-signature-id');

  console.log('MercadoPago Webhook received:', body);

  // MercadoPago webhook format for payments:
  // { action: "payment.created", data: { id: "123456" }, ... }
  if (body.action === 'payment.created' || body.type === 'payment') {
    const paymentId = body.data?.id || body.id;
    
    if (paymentId) {
      try {
        // Fetch full payment info from MercadoPago
        const paymentInfo = await getPaymentInfo(paymentId);
        const purchaseId = paymentInfo.external_reference;

        if (purchaseId) {
          console.log(`Updating purchase ${purchaseId} with status ${paymentInfo.status}`);
          await updatePurchasePaymentStatus(
            purchaseId,
            paymentId.toString(),
            paymentInfo.status
          );
        }
      } catch (error) {
        console.error('Error processing MercadoPago webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
