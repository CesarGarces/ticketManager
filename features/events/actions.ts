'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { CreateEventDTO, Event, EventStatus } from '@/domain/types';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { getEventImageSignedUrl } from '@/services/storage/actions';

export async function createEvent(data: CreateEventDTO): Promise<{ event?: Event; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const slug = generateSlug(data.title);

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      slug,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
      image_path: data.image_path,
      status: EventStatus.DRAFT,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { event: event as Event };
}

export async function getEvents(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  if (events) {
    for (const event of events) {
      if (event.image_path) {
        (event as Event).image_url = await getEventImageSignedUrl(event.image_path) || undefined;
      }
    }
  }

  return (events as Event[]) || [];
}

export async function getPublicEvents(filters?: { search?: string; categoryId?: string }): Promise<Event[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('events')
    .select('*')
    .eq('status', EventStatus.PUBLISHED);

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  if (filters?.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  const { data: events } = await query.order('start_date', { ascending: true });

  if (events) {
    for (const event of events) {
      if (event.image_path) {
        (event as Event).image_url = await getEventImageSignedUrl(event.image_path) || undefined;
      }
    }
  }

  return (events as Event[]) || [];
}

export async function getEventCategories() {
  const supabase = await createServerSupabaseClient();
  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name', { ascending: true });

  return categories || [];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (event && event.image_path) {
    (event as Event).image_url = await getEventImageSignedUrl(event.image_path) || undefined;
  }

  return event as Event | null;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', EventStatus.PUBLISHED)
    .single();

  if (event && event.image_path) {
    (event as Event).image_url = await getEventImageSignedUrl(event.image_path) || undefined;
  }

  return event as Event | null;
}

export async function updateEventStatus(id: string, status: EventStatus): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('events')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organizer_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/events/${id}`);
  return {};
}

export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get events with their ticket types
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      ticket_types (
        name,
        quantity_sold,
        price,
        currency
      )
    `)
    .eq('organizer_id', user.id);

  if (!events) return null;

  const eventSales = events.map(event => ({
    name: event.title,
    sales: (event.ticket_types as any[]).reduce((sum, tt) => sum + tt.quantity_sold, 0),
    revenue: (event.ticket_types as any[]).reduce((sum, tt) => sum + (tt.quantity_sold * Number(tt.price)), 0),
  }));

  const ticketTypeSales: Record<string, number> = {};
  events.forEach(event => {
    (event.ticket_types as any[]).forEach(tt => {
      ticketTypeSales[tt.name] = (ticketTypeSales[tt.name] || 0) + tt.quantity_sold;
    });
  });

  const typeDistribution = Object.entries(ticketTypeSales).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    eventSales,
    typeDistribution,
  };
}
