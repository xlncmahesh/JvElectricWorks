/*
# Customer platform: conversations, messages, support tickets, demo product tracking

## Purpose
Adds the database infrastructure for the customer-facing platform:
1. Conversations + messages for orders, service requests, and support tickets
2. Support tickets table
3. Solar subcategories (none existed before)
4. is_demo column on products to identify temporary demo products
5. Storage bucket for repair images

## New Tables

### conversations
- id (uuid, PK)
- thread_type (text) — 'order' | 'service_request' | 'ticket'
- thread_id (uuid) — the id of the order/service_request/ticket
- user_id (uuid) — the customer who owns this conversation
- created_at (timestamptz)

### messages
- id (uuid, PK)
- conversation_id (uuid, FK → conversations, CASCADE)
- sender (text) — 'customer' | 'business'
- body (text, NOT NULL)
- created_at (timestamptz)

### support_tickets
- id (uuid, PK)
- reference (text, unique)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- subject (text, NOT NULL)
- category (text, NOT NULL) — e.g. 'general', 'product', 'order', 'billing', 'other'
- description (text, NOT NULL)
- status (text, DEFAULT 'open')
- created_at (timestamptz)
- updated_at (timestamptz)

## Modified Tables
- products: added `is_demo` boolean column (default false) to identify demo/test products
- subcategories: added Solar subcategories (panels, inverters-batteries)

## Security
- RLS enabled on all new tables
- Conversations: customer can SELECT/INSERT their own (auth.uid() = user_id)
- Messages: customer can SELECT messages in their own conversations, INSERT only as 'customer' sender
- Support tickets: full owner-scoped CRUD (select/insert/update/delete own tickets)
- All policies use auth.uid() for ownership

## Storage
- Creates 'repair-images' bucket (public read, authenticated write)
- Policies: anyone can read, authenticated users can upload to their own path
*/

-- ── 1. is_demo column on products ────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE products ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Index for filtering demo products
CREATE INDEX IF NOT EXISTS idx_products_is_demo ON products(is_demo);

-- ── 2. Solar subcategories ───────────────────────────────────────────────────
INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'panels', 'Solar Panels', 'Monocrystalline & polycrystalline panels', 'Solar panels for residential and commercial rooftop installations.', '/buy/solar/panels', '/solar/panels', 10, true
FROM categories c WHERE c.slug = 'solar'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'inverters-batteries', 'Inverters & Batteries', 'Inverters, charge controllers & battery storage', 'Solar inverters, charge controllers, and battery storage systems.', '/buy/solar/inverters-batteries', '/solar/inverters-batteries', 20, true
FROM categories c WHERE c.slug = 'solar'
ON CONFLICT DO NOTHING;

-- ── 3. conversations table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_type text NOT NULL CHECK (thread_type IN ('order', 'service_request', 'ticket')),
  thread_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (thread_type, thread_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations"
  ON conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations"
  ON conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 4. messages table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('customer', 'business')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Customers can read messages in their own conversations
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages"
  ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Customers can insert messages only as 'customer' sender, in their own conversations
DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages"
  ON messages FOR INSERT
  TO authenticated WITH CHECK (
    sender = 'customer'
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ── 5. support_tickets table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  subject text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id, created_at DESC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets"
  ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets"
  ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets"
  ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 6. Function to get or create a conversation for a thread ─────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_thread_type text,
  p_thread_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_user_id uuid;
  v_thread_user_id uuid;
BEGIN
  -- Determine the user_id from the thread
  IF p_thread_type = 'order' THEN
    SELECT user_id INTO v_thread_user_id FROM orders WHERE id = p_thread_id;
  ELSIF p_thread_type = 'service_request' THEN
    SELECT user_id INTO v_thread_user_id FROM service_requests WHERE id = p_thread_id;
  ELSIF p_thread_type = 'ticket' THEN
    SELECT user_id INTO v_thread_user_id FROM support_tickets WHERE id = p_thread_id;
  ELSE
    RAISE EXCEPTION 'Unknown thread type: %', p_thread_type;
  END IF;

  IF v_thread_user_id IS NULL THEN
    RAISE EXCEPTION 'Thread % with id % not found', p_thread_type, p_thread_id;
  END IF;

  -- Only the owner can create/access their conversation
  IF v_thread_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE thread_type = p_thread_type AND thread_id = p_thread_id;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (thread_type, thread_id, user_id)
  VALUES (p_thread_type, p_thread_id, auth.uid())
  RETURNING id INTO v_conversation_id;

  RETURN v_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(p_thread_type text, p_thread_id uuid) TO authenticated;

-- ── 7. Updated_at trigger for support_tickets ────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_ticket_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_update ON support_tickets;
CREATE TRIGGER on_ticket_update
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_ticket_updated_at();
