-- Tighten order_items INSERT: only the order's owner can add items.
-- The previous policy used WITH CHECK (true), which let any authenticated user
-- insert rows for any order.
DROP POLICY IF EXISTS public_insert_order_items ON order_items;

CREATE POLICY insert_own_order_items ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Tighten service_request_images INSERT the same way.
DROP POLICY IF EXISTS public_insert_service_request_images ON service_request_images;

CREATE POLICY insert_own_service_request_images ON service_request_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = service_request_images.service_request_id
        AND service_requests.user_id = auth.uid()
    )
  );
