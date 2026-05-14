import { NextResponse } from 'next/server';
import { getPaymentInfo } from '@/services/mercadopago/client';
import { updatePurchasePaymentStatus } from '@/features/purchases/actions';
import { createNotification } from '@/features/notifications/actions';
import { createServerSupabaseClient } from '@/services/supabase/client';
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

      // Create notifications if payment is approved
      if (paymentInfo.status === 'approved') {
        console.log(`[MercadoPago Webhook] Creating notifications for approved payment`);
        try {
          const supabase = await createServerSupabaseClient();

          // Fetch purchase details with related data
          const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .select(`
              *,
              event:events(*),
              ticket_type:ticket_types(*)
            `)
            .eq('id', purchaseId)
            .single();

          if (purchaseError || !purchase) {
            console.error('Error fetching purchase details:', purchaseError);
          } else {
            const buyer_email = purchase.buyer_email || 'buyer@example.com';
            const buyer_name = purchase.buyer_name || 'Buyer';
            const event_title = purchase.event?.title || 'Event';
            const ticket_type_name = purchase.ticket_type?.name || 'Ticket';
            const quantity = purchase.quantity || 1;
            const amount = purchase.total_amount || 0;
            const currency = purchase.currency || 'USD';

            // Notification for SELLER (organizer) - Ticket Sold
            if (purchase.event?.organizer_id) {
              const sellerNotification = await createNotification({
                user_id: purchase.event.organizer_id,
                type: 'ticket_sold',
                title: '🎟️ Ticket Sold!',
                message: `${quantity} ticket(s) for "${event_title}" sold to ${buyer_name}`,
                related_event_id: purchase.event_id,
                related_purchase_id: purchaseId,
                buyer_email,
                buyer_name,
                event_title,
                ticket_type_name,
                quantity,
                amount,
                currency,
              });

              if (sellerNotification.error) {
                console.error('Error creating seller notification:', sellerNotification.error);
              } else {
                console.log(`[MercadoPago Webhook] Created seller notification for event ${purchase.event_id}`);
              }
            }

            // Notification for BUYER - Purchase Confirmed
            const buyerNotification = await createNotification({
              user_id: purchase.buyer_id,
              type: 'purchase_confirmed',
              title: '✅ Purchase Confirmed!',
              message: `Your purchase of ${quantity} ticket(s) for "${event_title}" is confirmed`,
              related_event_id: purchase.event_id,
              related_purchase_id: purchaseId,
              event_title,
              ticket_type_name,
              quantity,
              amount,
              currency,
            });

            if (buyerNotification.error) {
              console.error('Error creating buyer notification:', buyerNotification.error);
            } else {
              console.log(`[MercadoPago Webhook] Created buyer notification for purchase ${purchaseId}`);
            }
          }
        } catch (notificationError) {
          console.error('[MercadoPago Webhook] Error creating notifications:', notificationError);
          // Don't fail the webhook if notifications fail
        }
      }

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
