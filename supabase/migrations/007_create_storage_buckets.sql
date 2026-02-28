-- 007_create_storage_buckets.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  FALSE,
  10485760,  -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
);

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'task-attachments');

-- Users can view files from their tasks or if admin
CREATE POLICY "Users can view task files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (
      EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.tasks
        WHERE id = (string_to_array(name, '/'))[1]::uuid
        AND asignado_a = auth.uid()
      )
    )
  );

-- Admins can delete files
CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );
