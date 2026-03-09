-- ============================================================
-- Storage policies for bucket: resume-pdfs
-- Run this in Supabase SQL Editor AFTER creating the bucket "resume-pdfs" in Storage.
-- ============================================================

-- Allow authenticated users to upload to their own folder (path starts with user_id)
CREATE POLICY "Users can upload own resume PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resume-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own resume PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update own resume PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resume-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own resume PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resume-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
