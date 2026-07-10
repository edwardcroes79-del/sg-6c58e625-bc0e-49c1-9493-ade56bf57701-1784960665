-- Create vehicle photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle_photos',
  'vehicle_photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create vehicle documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle_documents',
  'vehicle_documents',
  true,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for vehicle_photos
CREATE POLICY "public_read_vehicle_photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle_photos');

-- Authenticated upload policy for vehicle_photos
CREATE POLICY "auth_insert_vehicle_photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle_photos'
  AND auth.role() = 'authenticated'
);

-- Authenticated delete own files for vehicle_photos
CREATE POLICY "auth_delete_vehicle_photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle_photos'
  AND auth.uid() = owner
);

-- Public read policy for vehicle_documents
CREATE POLICY "public_read_vehicle_documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle_documents');

-- Authenticated upload policy for vehicle_documents
CREATE POLICY "auth_insert_vehicle_documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle_documents'
  AND auth.role() = 'authenticated'
);

-- Authenticated delete own files for vehicle_documents
CREATE POLICY "auth_delete_vehicle_documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle_documents'
  AND auth.uid() = owner
);