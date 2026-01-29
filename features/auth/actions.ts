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
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', user.id)
      .single();

    revalidatePath('/', 'layout');
    
    // Check if role is organizer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleObj = userRole?.role as any;
    const roleName = roleObj?.name;

    if (roleName === 'organizer') {
      redirect('/dashboard');
    } else {
      // If it's a buyer/user, go to home
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

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  if (!profile) return { email: user.email, role: 'user' };

  // Fetch role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleObj = userRole?.role as any;
  const roleName = roleObj?.name || 'user';

  return { ...profile, role: roleName };
}
