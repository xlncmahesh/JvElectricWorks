/*
# Validate customer contact details on new submissions

1. Purpose
- Enforce the same email and Indian mobile formats at the database boundary as in the forms.
- Preserve existing historical records, including older records that use a different format.

2. Modified tables
- `orders`: validates non-empty phone and optional email on INSERT.
- `service_requests`: validates optional phone and email on INSERT.

3. Validation rules
- Mobile numbers must be stored as `+91` followed by a valid 10-digit Indian number beginning with 6, 7, 8, or 9.
- Emails must have non-whitespace text before and after `@`, plus a two-character-or-longer domain suffix.
- NULL remains allowed where the existing workflow treats the contact field as optional.

4. Security and data safety
- No existing rows are changed.
- The trigger runs before new rows are saved, including requests made directly through the Data API.
*/

CREATE OR REPLACE FUNCTION public.validate_customer_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone !~ '^\\+91[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid mobile number';
  END IF;

  IF NEW.email IS NOT NULL AND NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_orders_customer_contact ON public.orders;
CREATE TRIGGER validate_orders_customer_contact
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_customer_contact();

DROP TRIGGER IF EXISTS validate_service_requests_customer_contact ON public.service_requests;
CREATE TRIGGER validate_service_requests_customer_contact
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_customer_contact();
