/*
# Tighten message attachment table privileges

1. Purpose
- Keep the new message attachment table reachable only by signed-in customers through its intended policies.

2. Modified table
- `message_attachments` retains SELECT and INSERT for authenticated customers.
- Anonymous access is removed.
- Authenticated UPDATE and DELETE access are removed because the customer flow never edits or deletes attachment metadata.

3. Security
- Row-level security remains enabled.
- Existing ownership policies continue to control which attachment rows a customer can read or create.
*/

REVOKE ALL ON public.message_attachments FROM anon;
REVOKE UPDATE, DELETE ON public.message_attachments FROM authenticated;
GRANT SELECT, INSERT ON public.message_attachments TO authenticated;
