import { NextResponse } from 'next/server';
import { getPaymentInfo } from '@/services/mercadopago/client';
import { updatePurchasePaymentStatus } from '@/features/purchases/actions';
import crypto from 'crypto';

// MercadoPago IPN webhook handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = new URL(request.url).searchParams;

    // Log incoming webhook
    console.log('[MercadoPago Webhook] Received notification:', {
      type: body.type,
      action: body.action,
      data_id: body.data?.id,
    });

    // MercadoPago can send different notification types
    // We handle: payment.created, payment.updated, and type=payment
    const isPaymentNotification =
      body.type === 'payment' ||
      body.action === 'payment.created' ||
      body.action === 'payment.updated';

    if (!isPaymentNotification) {
      console.log('[MercadoPago Webhook] Ignoring non-payment notification');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Extract payment ID from webhook data
    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      console.warn('[MercadoPago Webhook] No payment ID found in webhook');
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      );
    }

    try {
      // Fetch full payment info from MercadoPago API
      console.log(`[MercadoPago Webhook] Fetching payment details for ID: ${paymentId}`);
      const paymentInfo = await getPaymentInfo(paymentId.toString());

      // Extract purchase ID from external_reference
      // This was set when we created the preference
      const purchaseId = paymentInfo.external_reference;

      if (!purchaseId) {
        console.warn(
          `[MercadoPago Webhook] Payment ${paymentId} has no external_reference`
        );
        return NextResponse.json(
          { error: 'No external reference found' },
          { status: 400 }
        );
      }

      // Only update if payment status indicates a meaningful state change
      // (don't spam on pending notifications)
      const relevantStatuses = ['approved', 'rejected', 'cancelled', 'in_process'];
      if (!relevantStatuses.includes(paymentInfo.status)) {
        console.log(
          `[MercadoPago Webhook] Skipping irrelevant status: ${paymentInfo.status}`
        );
        return NextResponse.json({ received: true }, { status: 200 });
      }

      console.log(
        `[MercadoPago Webhook] Updating purchase ${purchaseId} with status: ${paymentInfo.status}`
      );

      await updatePurchasePaymentStatus(
        purchaseId,
        paymentId.toString(),
        paymentInfo.status
      );

      console.log(
        `[MercadoPago Webhook] Successfully updated purchase ${purchaseId}`
      );
      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
      console.error('[MercadoPago Webhook] Error processing payment:', error);
      // Return 200 to prevent MercadoPago from retrying indefinitely
      // Error is logged for manual investigation
      return NextResponse.json(
        { received: true, error: 'Processing failed' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[MercadoPago Webhook] Failed to parse request:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
