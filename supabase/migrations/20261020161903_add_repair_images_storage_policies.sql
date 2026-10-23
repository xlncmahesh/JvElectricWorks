/*
# Storage policies for repair-images bucket
*/

-- Public read policy for repair-images bucket
DROP POLICY IF EXISTS "public_read_repair_images" ON storage.objects;
CREATE POLICY "public_read_repair_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'repair-images');

-- Authenticated users can upload to repair-images
DROP POLICY IF EXISTS "auth_upload_repair_images" ON storage.objects;
CREATE POLICY "auth_upload_repair_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'repair-images');

-- Authenticated users can update/delete their own uploads in repair-images
DROP POLICY IF EXISTS "auth_update_repair_images" ON storage.objects;
CREATE POLICY "auth_update_repair_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'repair-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_delete_repair_images" ON storage.objects;
CREATE POLICY "auth_delete_repair_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'repair-images' AND owner = auth.uid());
