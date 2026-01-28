'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { CreateEventDTO, Event, EventStatus } from '@/domain/types';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

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
      title: data.title,
      description: data.description,
      slug,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
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

  return (events as Event[]) || [];
}

export async function getPublicEvents(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', EventStatus.PUBLISHED)
    .order('start_date', { ascending: true });

  return (events as Event[]) || [];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

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
