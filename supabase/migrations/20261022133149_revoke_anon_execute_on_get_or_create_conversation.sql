-- Restrict get_or_create_conversation to authenticated users only.
-- check_user_exists is intentionally public (used on the sign-in screen before login).
REVOKE EXECUTE ON FUNCTION get_or_create_conversation(text, uuid) FROM anon, PUBLIC;
