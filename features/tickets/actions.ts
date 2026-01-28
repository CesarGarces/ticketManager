'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { CreateTicketTypeDTO, TicketType } from '@/domain/types';
import { revalidatePath } from 'next/cache';

export async function createTicketType(data: CreateTicketTypeDTO): Promise<{ ticketType?: TicketType; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify the event belongs to the user
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', data.event_id)
    .eq('organizer_id', user.id)
    .single();

  if (!event) {
    return { error: 'Event not found or unauthorized' };
  }

  const { data: ticketType, error } = await supabase
    .from('ticket_types')
    .insert({
      event_id: data.event_id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      currency: data.currency,
      quantity_total: data.quantity_total,
      quantity_sold: 0,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/events/${data.event_id}`);
  return { ticketType: ticketType as TicketType };
}

export async function getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
  const supabase = await createServerSupabaseClient();

  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', eventId)
    .order('price', { ascending: true });

  return (ticketTypes as TicketType[]) || [];
}

export async function updateTicketQuantity(ticketTypeId: string, quantitySold: number): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('ticket_types')
    .update({ quantity_sold: quantitySold })
    .eq('id', ticketTypeId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
