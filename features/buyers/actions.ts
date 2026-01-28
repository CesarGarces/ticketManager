'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { revalidatePath } from 'next/cache';

export async function createBuyerProfile(name: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: buyer, error } = await supabase
    .from('buyers')
    .insert({
      id: user.id,
      email: user.email!,
      name,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { buyer };
}

export async function getBuyerProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: buyer } = await supabase
    .from('buyers')
    .select('*')
    .eq('id', user.id)
    .single();

  return buyer;
}

export async function updateBuyerProfile(name: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('buyers')
    .update({ name })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/buyer/dashboard');
  return {};
}
