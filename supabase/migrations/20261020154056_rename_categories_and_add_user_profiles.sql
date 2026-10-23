/*
# Rename categories and create user_profiles table for account tracking

## Changes

### 1. Rename categories in the categories table
- "Lights" → "Lights & Fans"
- "Mobile" → "Electronics"
- The slugs (`lights`, `mobiles`) stay the same so all existing URLs, routes, and product associations continue to work unchanged.

### 2. New table: user_profiles
Tracks every account that has ever been created, along with their details.

Columns:
- `id` (uuid, primary key) — references auth.users(id) ON DELETE CASCADE
- `email` (text) — the user's email at time of sign-up
- `full_name` (text, nullable) — populated from orders and service requests
- `phone` (text, nullable) — populated from orders and service requests
- `provider` (text, nullable) — 'google' or 'email' depending on sign-up method
- `created_at` (timestamptz) — when the profile record was created
- `updated_at` (timestamptz) — last time the profile was updated

### 3. New table: user_activity
Links each user profile to their orders and service requests so the owner
app can see everything a user has done in one place.

Columns:
- `id` (uuid, primary key)
- `user_profile_id` (uuid, references user_profiles ON DELETE CASCADE)
- `activity_type` (text) — 'order' or 'service_request'
- `reference` (text) — the order or service request reference (e.g. ORD-xxx, REP-xxx, SOL-xxx)
- `activity_id` (uuid, nullable) — the id of the order or service_request row
- `summary` (jsonb, nullable) — a snapshot of key details from the activity (device info, delivery address, etc.)
- `created_at` (timestamptz)

### 4. Triggers to auto-populate user_profiles
- `on_auth_user_created` — when a new auth.users row is inserted, creates a matching user_profiles row with the email and provider info.
- `on_order_created` — when a new order is inserted, upserts the user_profiles row (if the order has a user_id) with name/phone from the order, and creates a user_activity row.
- `on_service_request_created` — same for service_requests.

### 5. Security
- RLS enabled on both new tables.
- user_profiles: a user can only SELECT/UPDATE their own profile. INSERT is handled by the trigger (SECURITY DEFINER), so no direct INSERT policy for users.
- user_activity: a user can only SELECT their own activity rows. INSERT is handled by triggers.
- The owner app will use the service role key which bypasses RLS entirely.

## Notes
1. The category slugs (`lights`, `mobiles`) are intentionally kept unchanged so
   existing URLs, routes, and product references continue to work.
2. user_profiles and user_activity are populated automatically by triggers —
   the frontend does not need to write to them directly.
3. The triggers are SECURITY DEFINER so they can insert into these tables
   even when the original INSERT comes from a user with limited permissions.
*/

-- ── 1. Rename categories ────────────────────────────────────────────────────
UPDATE categories SET name = 'Lights & Fans' WHERE slug = 'lights' AND name = 'Lights';
UPDATE categories SET name = 'Electronics' WHERE slug = 'mobiles' AND name = 'Mobile';

-- ── 2. Create user_profiles table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  provider text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile"
  ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile"
  ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── 3. Create user_activity table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  reference text,
  activity_id uuid,
  summary jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_profile ON user_activity(user_profile_id);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity" ON user_activity;
CREATE POLICY "select_own_activity"
  ON user_activity FOR SELECT
  TO authenticated USING (user_profile_id = auth.uid());

-- ── 4. Trigger functions ────────────────────────────────────────────────────

-- Auto-create a user_profiles row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (SELECT provider FROM auth.identities WHERE identities.user_id = NEW.id LIMIT 1),
      'email'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Populate user_profiles + user_activity when an order is created
CREATE OR REPLACE FUNCTION public.handle_order_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process orders that have a user_id
  IF NEW.user_id IS NOT NULL THEN
    -- Upsert profile with name/phone from the order
    INSERT INTO user_profiles (id, email, full_name, phone)
    VALUES (NEW.user_id, NEW.email, NEW.full_name, NEW.phone)
    ON CONFLICT (id) DO UPDATE
      SET full_name = COALESCE(user_profiles.full_name, EXCLUDED.full_name),
          phone = COALESCE(user_profiles.phone, EXCLUDED.phone),
          email = COALESCE(user_profiles.email, EXCLUDED.email),
          updated_at = now();

    -- Record the activity
    INSERT INTO user_activity (user_profile_id, activity_type, reference, activity_id, summary)
    VALUES (
      NEW.user_id,
      'order',
      NEW.reference,
      NEW.id,
      jsonb_build_object(
        'status', NEW.status,
        'subtotal', NEW.subtotal,
        'fulfilment_mode', NEW.fulfilment_mode,
        'delivery_address', NEW.delivery_address,
        'notes', NEW.notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_created();

-- Populate user_profiles + user_activity when a service request is created
CREATE OR REPLACE FUNCTION public.handle_service_request_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    -- Upsert profile with name/phone/email from the service request
    INSERT INTO user_profiles (id, email, full_name, phone)
    VALUES (NEW.user_id, NEW.email, NEW.full_name, NEW.phone)
    ON CONFLICT (id) DO UPDATE
      SET full_name = COALESCE(user_profiles.full_name, EXCLUDED.full_name),
          phone = COALESCE(user_profiles.phone, EXCLUDED.phone),
          email = COALESCE(user_profiles.email, EXCLUDED.email),
          updated_at = now();

    -- Record the activity with relevant service request details
    INSERT INTO user_activity (user_profile_id, activity_type, reference, activity_id, summary)
    VALUES (
      NEW.user_id,
      'service_request',
      NEW.reference,
      NEW.id,
      jsonb_build_object(
        'status', NEW.status,
        'device_type', NEW.device_type,
        'device_brand', NEW.device_brand,
        'device_model', NEW.device_model,
        'problem_description', NEW.problem_description,
        'install_address', NEW.install_address,
        'property_type', NEW.property_type,
        'notes', NEW.notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_service_request_created ON service_requests;
CREATE TRIGGER on_service_request_created
  AFTER INSERT ON service_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_service_request_created();

-- ── 5. Backfill existing data ───────────────────────────────────────────────
-- Create profile rows for any existing auth users who don't have one yet
INSERT INTO user_profiles (id, email, provider)
SELECT u.id, u.email, COALESCE(
  (SELECT i.provider FROM auth.identities i WHERE i.user_id = u.id LIMIT 1),
  'email'
)
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
