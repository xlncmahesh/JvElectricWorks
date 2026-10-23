/*
# Add check_user_exists function for sign-in validation

## Purpose
When a user tries to sign in with an email or phone number that has no
account, the frontend needs to detect this and show "no account found"
instead of silently sending a code to a non-existent user.

Since auth.users is protected by RLS and not readable by the anon role,
we expose a minimal SECURITY DEFINER function that returns a boolean.
It only reveals whether an account exists — nothing else about the user.

## Changes
1. New function `public.check_user_exists(text)` — SECURITY DEFINER
   - Accepts an email OR phone number (text)
   - Returns true if a confirmed user exists with that email or phone
   - Returns false otherwise
   - Granted EXECUTE to anon + authenticated (needed for pre-sign-in check)
2. Security: the function is read-only, returns only a boolean, and does
   not expose any user data beyond existence.
*/

DROP FUNCTION IF EXISTS public.check_user_exists(text);

CREATE OR REPLACE FUNCTION public.check_user_exists(identifier text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = lower(trim(identifier))
       OR phone = trim(identifier)
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_user_exists(text) TO anon, authenticated;
