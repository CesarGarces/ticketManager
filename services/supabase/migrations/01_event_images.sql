-- Migration: Event Images
-- Description: Create storage bucket for event images and add image_path to events table

-- 1. Create 'event-image' bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-image', 'event-image', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Add RLS policies for storage

-- Allow organizers to upload images
-- Policy: "Organizers can insert images"
CREATE POLICY "Organizers can insert images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-image' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow organizers to delete their own images
-- Policy: "Organizers can delete own images"
CREATE POLICY "Organizers can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-image' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow organizers to read their own images (for management)
-- Policy: "Organizers can read own images"
CREATE POLICY "Organizers can read own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'event-image' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: Public access is NOT enabled via RLS. We will use Signed URLs.

-- 3. Update events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_path TEXT;
