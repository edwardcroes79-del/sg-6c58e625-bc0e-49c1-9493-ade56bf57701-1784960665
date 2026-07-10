-- Create logos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Public read policy for logos bucket
CREATE POLICY "logos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Authenticated users can upload their own workshop logo
CREATE POLICY "logos_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
);

-- Users can update/delete their own logo
CREATE POLICY "logos_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'logos'
  AND auth.uid() = owner
);

CREATE POLICY "logos_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos'
  AND auth.uid() = owner
);