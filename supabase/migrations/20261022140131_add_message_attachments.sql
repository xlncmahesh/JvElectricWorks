/*
# Add customer message attachments

1. Purpose
- Allow customers to attach supporting files to order, service-request, and support conversations.
- Keep attachment records linked to the exact message and conversation.

2. New table: message_attachments
- `id` — unique attachment identifier.
- `message_id` — message owning the attachment.
- `conversation_id` — conversation used for ownership checks and efficient reads.
- `storage_path` — private Storage object path.
- `file_name` — original display name, stored for the customer interface.
- `content_type` — uploaded MIME type.
- `size_bytes` — uploaded file size.
- `created_at` — upload timestamp.

3. Storage
- Creates the private `message-attachments` bucket.
- Customers may upload only inside a folder named with their authenticated user ID.
- Customers may read only objects inside their own user folder.
- Customers may update or delete only their own objects.

4. Security
- Enables RLS on `message_attachments`.
- Customers can read attachments only when they own the linked conversation.
- Customers can insert attachments only for messages in conversations they own.
- Grants are limited to authenticated users.
*/

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments(message_id, created_at);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.message_attachments TO authenticated;

DROP POLICY IF EXISTS "select_own_message_attachments" ON public.message_attachments;
CREATE POLICY "select_own_message_attachments"
  ON public.message_attachments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = message_attachments.conversation_id
      AND conversations.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "insert_own_message_attachments" ON public.message_attachments;
CREATE POLICY "insert_own_message_attachments"
  ON public.message_attachments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.messages
      JOIN public.conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = message_attachments.message_id
        AND messages.conversation_id = message_attachments.conversation_id
        AND conversations.user_id = auth.uid()
        AND messages.sender = 'customer'
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "customers_upload_message_attachments" ON storage.objects;
CREATE POLICY "customers_upload_message_attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "customers_read_message_attachments" ON storage.objects;
CREATE POLICY "customers_read_message_attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "customers_update_message_attachments" ON storage.objects;
CREATE POLICY "customers_update_message_attachments"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "customers_delete_message_attachments" ON storage.objects;
CREATE POLICY "customers_delete_message_attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
