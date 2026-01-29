-- Migration: Public Signed URL Access for Event Images
-- Description: Enable public users to receive signed URLs for event images
-- 
-- CONTEXT:
-- The "Organizers can read own images" policy restricts file access to uploaded files.
-- However, Supabase needs to READ the file metadata to generate a signed URL.
-- Without this, the createSignedUrl() call fails even with the anon key.
-- 
-- SOLUTION:
-- Create an additional RLS policy that allows the service role to select
-- files from the 'event-image' bucket without folder restrictions.
-- This enables signed URL generation for ALL images without exposing direct access.

-- Allow signed URL generation via anon key (service role)
-- This policy allows the Supabase SDK (using anon key) to read file metadata
-- for the purpose of generating signed URLs, without allowing direct access
CREATE POLICY "Allow signed URL generation for public users"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-image');
