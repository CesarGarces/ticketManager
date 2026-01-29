'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createServerSupabaseClient();

  const { error, data: { user } } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (user) {
    // Detect role to redirect correctly
    const { data: organizer } = await supabase
      .from('organizers')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    revalidatePath('/', 'layout');
    
    if (organizer) {
      redirect('/dashboard');
    } else {
      // If it's a buyer or doesn't have a profile yet, go to home
      redirect('/');
    }
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Try to find in organizers
  const { data: organizer } = await supabase
    .from('organizers')
    .select('name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (organizer) return { ...organizer, role: 'organizer' };

  // Try to find in buyers
  const { data: buyer } = await supabase
    .from('buyers')
    .select('name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (buyer) return { ...buyer, role: 'buyer' };

  return { email: user.email, role: 'user' };
}
