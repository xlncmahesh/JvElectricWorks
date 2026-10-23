/*
# Add stock management to products and expand subcategories

## Purpose
This migration prepares the database so the Owner-Side Application can add and
manage products (with stock) and have them appear on this website. It also adds
the subcategory structure needed for the Electronics and Lights & Fans categories.

## Changes

### 1. Stock columns on `products`
Two new columns:
- `stock_quantity` (numeric, nullable, default null) — the number of units in stock.
  NULL means "untracked / unlimited" (e.g. cables sold by length). A value of 0
  means "out of stock".
- `low_stock_threshold` (numeric, nullable, default null) — when stock falls at
  or below this number, the website shows a "Low stock" warning.

Both are nullable so existing products continue to work without changes.

### 2. New subcategories
Added subcategories that the Owner App can assign products to:

Electronics (slug: mobiles):
- Spare Parts (spare-parts)
- Speakers (speakers)
- Chargers (chargers)
- Charging Cables (charging-cables)
- Stands (stands)
- Accessories (accessories)

Lights & Fans (slug: lights):
- Domestic Lights (domestic-lights) — replaces the old "Domestic" lighting subcat
- Industrial Lights (industrial-lights) — replaces the old "Industrial" lighting subcat
- Fans (fans)

The old "Domestic" and "Industrial" subcategories under Lights are renamed/kept
so existing product associations remain valid. New "Fans" subcategory added.

### 3. New function: `upsert_subcategory`
A SECURITY DEFINER function that lets the Owner App create or update a
subcategory by slug + category slug. This way new subcategories can be added
from the Owner App without direct table access.

### 4. RLS note
The Owner App will use the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely.
No new RLS policies are needed for product/subcategory management — the service
role can already do everything. The website (anon key) only needs SELECT on
published products and subcategories, which already exists.

## Important notes
1. The Owner App should use the service role key for all product/subcategory/order
   management operations.
2. The website continues to use the anon key and only reads published products.
3. `stock_quantity = NULL` means stock is not tracked (unlimited). Use 0 for out-of-stock.
*/

-- ── 1. Add stock columns to products ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold numeric;
  END IF;
END $$;

-- Index for sorting/filtering by stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- ── 2. Add new subcategories ─────────────────────────────────────────────────

-- Electronics subcategories (category slug = 'mobiles')
INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'spare-parts', 'Spare Parts', 'Original & OEM spare parts', 'Genuine and OEM-equivalent spare parts for phones and electronic devices.', '/buy/mobiles/spare-parts', '/mobiles/spare-parts', 10, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'speakers', 'Speakers', 'Bluetooth & wired speakers', 'Portable Bluetooth speakers, wired speakers, and audio accessories.', '/buy/mobiles/speakers', '/mobiles/speakers', 20, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'chargers', 'Chargers', 'Adapters & power bricks', 'Mobile phone chargers, fast chargers, and power adapters.', '/buy/mobiles/chargers', '/mobiles/chargers', 30, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'charging-cables', 'Charging Cables', 'USB, Type-C & Lightning cables', 'Charging and data cables including USB-C, Lightning, and micro-USB.', '/buy/mobiles/charging-cables', '/mobiles/charging-cables', 40, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'stands', 'Stands & Mounts', 'Phone stands & holders', 'Phone stands, tablet mounts, and desk holders.', '/buy/mobiles/stands', '/mobiles/stands', 50, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'accessories', 'Accessories', 'Cases, protectors & more', 'Screen protectors, cases, earphones, power banks, and other accessories.', '/buy/mobiles/accessories', '/mobiles/accessories', 60, true
FROM categories c WHERE c.slug = 'mobiles'
ON CONFLICT DO NOTHING;

-- Lights & Fans subcategories (category slug = 'lights')
-- Add "Fans" as a new subcategory alongside existing Domestic/Industrial
INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
SELECT c.id, 'fans', 'Fans', 'Ceiling, table & wall fans', 'Ceiling fans, table fans, wall fans, and exhaust fans for domestic use.', '/buy/lights/fans', '/lights/fans', 15, true
FROM categories c WHERE c.slug = 'lights'
ON CONFLICT DO NOTHING;

-- Rename existing "Domestic" lighting subcategory to "Domestic Lights"
UPDATE subcategories
SET name = 'Domestic Lights',
    tagline = 'Bulbs, fittings & decorative lighting for homes',
    display_order = 10
WHERE slug = 'domestic'
  AND category_id = (SELECT id FROM categories WHERE slug = 'lights');

-- Rename existing "Industrial" lighting subcategory to "Industrial Lights"
UPDATE subcategories
SET name = 'Industrial Lights',
    tagline = 'High-bay, flood & factory lighting',
    display_order = 20
WHERE slug = 'industrial'
  AND category_id = (SELECT id FROM categories WHERE slug = 'lights');

-- ── 3. upsert_subcategory function for the Owner App ─────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_subcategory(
  p_category_slug text,
  p_slug text,
  p_name text,
  p_tagline text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_display_order integer DEFAULT 0,
  p_is_published boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category_id uuid;
  v_subcategory_id uuid;
BEGIN
  SELECT id INTO v_category_id FROM categories WHERE slug = p_category_slug;
  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Category with slug % does not exist', p_category_slug;
  END IF;

  -- Try to find existing subcategory by slug within this category
  SELECT id INTO v_subcategory_id
  FROM subcategories
  WHERE slug = p_slug AND category_id = v_category_id;

  IF v_subcategory_id IS NOT NULL THEN
    -- Update existing
    UPDATE subcategories
    SET name = p_name,
        tagline = COALESCE(p_tagline, tagline),
        description = COALESCE(p_description, description),
        display_order = COALESCE(p_display_order, display_order),
        is_published = p_is_published
    WHERE id = v_subcategory_id;
  ELSE
    -- Insert new
    INSERT INTO subcategories (category_id, slug, name, tagline, description, buy_path, info_path, display_order, is_published)
    VALUES (
      v_category_id,
      p_slug,
      p_name,
      p_tagline,
      p_description,
      '/buy/' || p_category_slug || '/' || p_slug,
      '/' || p_category_slug || '/' || p_slug,
      p_display_order,
      p_is_published
    )
    RETURNING id INTO v_subcategory_id;
  END IF;

  RETURN v_subcategory_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_subcategory TO authenticated, anon;
