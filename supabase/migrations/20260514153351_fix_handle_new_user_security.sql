/*
  # Fix security issues with handle_new_user function

  1. Changes
    - Set `search_path = ''` on the function to prevent search path manipulation attacks
    - Revoke EXECUTE from `anon` and `authenticated` roles (this is a trigger function
      called by the database, not via the REST API)
    - Revoke EXECUTE from `PUBLIC` to remove the default grant

  2. Security
    - The function remains SECURITY DEFINER (required for trigger to insert into
      user_profiles regardless of caller permissions)
    - By setting search_path to empty, the function is immune to search path injection
    - By revoking execute from anon/authenticated, the function cannot be called via
      /rest/v1/rpc/handle_new_user
*/

-- Fix 1: Set immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix 2: Revoke EXECUTE from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
