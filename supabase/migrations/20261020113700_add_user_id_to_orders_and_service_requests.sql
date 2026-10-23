/*
# Add user_id to orders and service_requests (auth-scoped writes)

## Purpose
The app now requires sign-in before a customer can submit an order or a service request.
We attach each order and service request to the signed-in user so RLS can enforce that
only authenticated users can write, and only the owning user can view their own rows.

## Changes

1. New columns
- `orders.user_id` — uuid, nullable (existing rows keep NULL), defaults to `auth.uid()`
  for new inserts so the client does not need to pass it explicitly.
- `service_requests.user_id` — uuid, nullable, defaults to `auth.uid()`.

2. Foreign keys
- Both columns reference `auth.users(id)` with `ON DELETE SET NULL` so deleting a user
  does not orphan historical order/service records.

3. Indexes
- `orders_user_id_idx` and `service_requests_user_id_idx` for per-user lookups.

4. RLS policy updates
- `orders`: drop the existing anon/public INSERT policy. Add:
  - INSERT policy `TO authenticated` with `WITH CHECK (auth.uid() = user_id)` so only
    signed-in users can create orders for themselves.
  - SELECT policy `TO authenticated` with `USING (auth.uid() = user_id)` so users can
    see their own orders.
- `service_requests`: same pattern — authenticated-only INSERT + SELECT, scoped to owner.
- `service_request_images`: keep the existing public INSERT policy (images are written
  right after the service request is created, still within the authenticated session),
  but add an authenticated SELECT policy scoped through the parent service_request.

5. Notes
- Existing NULL user_id rows remain readable only via the service role; the app does not
  show historical orders to users, so this is safe.
- Read access for catalog tables (categories, products, subcategories,
  service_request_types) is unchanged and remains public (anon + authenticated).
*/

-- ── orders.user_id ────────────────────────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

-- ── service_requests.user_id ──────────────────────────────────────────────────
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_requests
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS service_requests_user_id_idx ON public.service_requests (user_id);

-- ── RLS: orders ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;

DROP POLICY IF EXISTS "select_own_orders" ON public.orders;
CREATE POLICY "select_own_orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
CREATE POLICY "insert_own_orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── RLS: service_requests ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "public_insert_service_requests" ON public.service_requests;

DROP POLICY IF EXISTS "select_own_service_requests" ON public.service_requests;
CREATE POLICY "select_own_service_requests"
  ON public.service_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_service_requests" ON public.service_requests;
CREATE POLICY "insert_own_service_requests"
  ON public.service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── RLS: service_request_images ───────────────────────────────────────────────
-- Keep public INSERT so image metadata can be written during the authenticated session.
-- Add an authenticated SELECT scoped through the parent service_request.
DROP POLICY IF EXISTS "select_own_service_request_images" ON public.service_request_images;
CREATE POLICY "select_own_service_request_images"
  ON public.service_request_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests
      WHERE service_requests.id = service_request_images.service_request_id
        AND service_requests.user_id = auth.uid()
    )
  );

-- ── RLS: order_items ──────────────────────────────────────────────────────────
-- Keep public INSERT (written during checkout within the authenticated session).
-- Add an authenticated SELECT scoped through the parent order.
DROP POLICY IF EXISTS "select_own_order_items" ON public.order_items;
CREATE POLICY "select_own_order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
