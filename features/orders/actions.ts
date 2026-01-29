'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { CreateOrderDTO, Order, OrderItem, OrderStatus, TicketType } from '@/domain/types';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: CreateOrderDTO): Promise<{ order?: Order; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Fetch ticket types to calculate total
  const ticketTypeIds = data.items.map(item => item.ticket_type_id);
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('*')
    .in('id', ticketTypeIds);

  if (!ticketTypes || ticketTypes.length !== data.items.length) {
    return { error: 'Invalid ticket types' };
  }

  // Calculate total amount
  let totalAmount = 0;
  const orderItems: Array<Omit<OrderItem, 'id' | 'order_id'>> = [];

  for (const item of data.items) {
    const ticketType = ticketTypes.find(tt => tt.id === item.ticket_type_id) as TicketType;
    if (!ticketType) {
      return { error: 'Ticket type not found' };
    }

    // Check availability
    const available = ticketType.quantity_total - ticketType.quantity_sold;
    if (available < item.quantity) {
      return { error: `Only ${available} tickets available for ${ticketType.name}` };
    }

    const subtotal = ticketType.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      ticket_type_id: item.ticket_type_id,
      quantity: item.quantity,
      unit_price: ticketType.price,
      subtotal,
    });
  }

  // Get currency from first ticket type
  const currency = (ticketTypes[0] as TicketType).currency;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      event_id: data.event_id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      total_amount: totalAmount,
      currency,
      status: OrderStatus.COMPLETED, // Simulated payment
    })
    .select()
    .single();

  if (orderError) {
    return { error: `Order error: ${orderError.message}` };
  }

  // Create order items (Trigger trigger_update_ticket_stock will handle stock update)
  const orderItemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsWithOrderId);

  if (itemsError) {
    return { error: `Items error: ${itemsError.message}` };
  }

  // Link to buyer profile and purchases table if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Create record in purchases table for each item
    const purchases = orderItems.map(item => ({
      buyer_id: user.id,
      order_id: order.id,
      ticket_type_id: item.ticket_type_id,
      event_id: data.event_id,
      quantity: item.quantity,
      payment_status: 'approved',
    }));

    console.log('[createOrder] Attempting to insert purchases:', purchases);

    const { data: insertedPurchases, error: purchaseError } = await supabase
      .from('purchases')
      .insert(purchases)
      .select();

    if (purchaseError) {
      console.error('[createOrder] Error creating purchases:', purchaseError);
    } else {
      console.log('[createOrder] Successfully inserted purchases:', insertedPurchases);
    }
  }

  revalidatePath(`/events/${data.event_id}`);
  return { order: order as Order };
}

export async function getOrderById(orderId: string): Promise<{ order: Order; items: Array<OrderItem & { ticket_type: TicketType }> } | null> {
  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select(`
      *,
      ticket_type:ticket_types(*)
    `)
    .eq('order_id', orderId);

  return {
    order: order as Order,
    items: (items as any[])?.map(item => ({
      ...item,
      ticket_type: item.ticket_type,
    })) || [],
  };
}

export async function getOrdersByEvent(eventId: string): Promise<Order[]> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  return (orders as Order[]) || [];
}
