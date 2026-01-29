'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/services/supabase/client';
import { revalidatePath } from 'next/cache';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Database triggers now handle profile creation and role assignment
  // automatically upon auth.users insertion.

  revalidatePath('/', 'layout');
  redirect('/events');
}
