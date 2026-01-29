'use server';

import { createServerSupabaseClient } from '@/services/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function uploadEventImage(formData: FormData): Promise<{ path?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file uploaded' };
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-image')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return { error: 'Failed to upload image' };
    }

    return { path: filePath };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { error: 'Internal Server Error' };
  }
}

export async function getEventImageSignedUrl(path: string | undefined): Promise<string | null> {
  if (!path) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from('event-image')
    .createSignedUrl(path, 60 * 60); // 1 hour expiry

  if (error) {
    console.error('Signed URL Error:', error);
    return null;
  }

  return data.signedUrl;
}
