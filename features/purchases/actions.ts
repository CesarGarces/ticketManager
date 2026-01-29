'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { createPaymentPreference } from '@/services/mercadopago/client';
import type { PreferenceData } from '@/services/mercadopago/types';
import { revalidatePath } from 'next/cache';

export async function createPurchaseWithPayment(data: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get ticket type info
  const { data: ticketType } = await supabase
    .from('ticket_types')
    .select('*, event:events(*)')
    .eq('id', data.ticketTypeId)
    .single();

  if (!ticketType) {
    return { error: 'Ticket type not found' };
  }

  // Check availability
  const available = ticketType.quantity_total - ticketType.quantity_sold;
  if (available < data.quantity) {
    return { error: `Only ${available} tickets available` };
  }

  // Create order first
  const totalAmount = Number(ticketType.price) * data.quantity;
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      event_id: data.eventId,
      customer_name: user.email!,
      customer_email: user.email!,
      total_amount: totalAmount,
      currency: ticketType.currency,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    return { error: orderError.message };
  }

  // Create order item
  await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      ticket_type_id: data.ticketTypeId,
      quantity: data.quantity,
      unit_price: ticketType.price,
      subtotal: totalAmount,
    });

  // Create purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      buyer_id: user.id,
      order_id: order.id,
      ticket_type_id: data.ticketTypeId,
      event_id: data.eventId,
      quantity: data.quantity,
      payment_status: 'pending',
    })
    .select()
    .single();

  if (purchaseError) {
    return { error: purchaseError.message };
  }

  // Create MercadoPago preference
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const preferenceData: PreferenceData = {
    items: [
      {
        id: data.ticketTypeId,
        title: ticketType.event.title,
        description: `${ticketType.name} - ${data.quantity} ticket(s)`,
        quantity: data.quantity,
        unit_price: Number(ticketType.price),
        currency_id: ticketType.currency,
      },
    ],
    back_urls: {
      success: `${baseUrl}/payment/success?purchase_id=${purchase.id}`,
      failure: `${baseUrl}/payment/failure?purchase_id=${purchase.id}`,
      pending: `${baseUrl}/payment/success?purchase_id=${purchase.id}`,
    },
    auto_return: 'approved',
    external_reference: purchase.id,
    metadata: {
      purchase_id: purchase.id,
      buyer_id: user.id,
      event_id: data.eventId,
    },
  };

  try {
    const preference = await createPaymentPreference(preferenceData);

    return {
      purchase,
      checkoutUrl: preference.init_point,
    };
  } catch (error) {
    console.error('Payment preference error:', error);
    return { error: 'Failed to create payment' };
  }
}

export async function getPurchasesByBuyer() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  console.log('[getPurchasesByBuyer] Fetching for user:', user.id);

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      *,
      event:events(*),
      ticket_type:ticket_types(*)
    `)
    .eq('buyer_id', user.id)
    .order('purchase_date', { ascending: false });

  if (error) {
    console.error('[getPurchasesByBuyer] Error fetching purchases:', error);
  } else {
    console.log('[getPurchasesByBuyer] Found purchases:', purchases?.length);
  }

  return purchases || [];
}

export async function getPurchaseById(purchaseId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: purchase } = await supabase
    .from('purchases')
    .select(`
      *,
      event:events(*),
      ticket_type:ticket_types(*)
    `)
    .eq('id', purchaseId)
    .single();

  return purchase;
}

export async function updatePurchasePaymentStatus(
  purchaseId: string,
  paymentId: string,
  status: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('purchases')
    .update({
      payment_id: paymentId,
      payment_status: status,
    })
    .eq('id', purchaseId);

  if (error) {
    return { error: error.message };
  }

  // If payment approved, update ticket quantity
  if (status === 'approved') {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('ticket_type_id, quantity')
      .eq('id', purchaseId)
      .single();

    if (purchase) {
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('quantity_sold')
        .eq('id', purchase.ticket_type_id)
        .single();

      if (ticketType) {
        await supabase
          .from('ticket_types')
          .update({
            quantity_sold: ticketType.quantity_sold + purchase.quantity,
          })
          .eq('id', purchase.ticket_type_id);
      }

      // Update order status
      const { data: orderData } = await supabase
        .from('purchases')
        .select('order_id')
        .eq('id', purchaseId)
        .single();

      if (orderData) {
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', orderData.order_id);
      }
    }
  }

  revalidatePath('/buyer/dashboard');
  return {};
}
