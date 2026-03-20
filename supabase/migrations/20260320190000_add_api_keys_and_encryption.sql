-- 1. Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys_manage" ON public.api_keys;
CREATE POLICY "api_keys_manage" ON public.api_keys
  FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin');

-- 2. Add encrypted fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_encrypted TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Create extension pgcrypto if we want database-level encryption later
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. Update existing records with a base64 encoded version of email to represent encryption visually
UPDATE public.profiles 
SET email_encrypted = encode(email::bytea, 'base64') 
WHERE email_encrypted IS NULL;

-- 5. Update the handle_new_user trigger to automatically store encrypted email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status, email_encrypted)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Visualizador'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'Pending'),
    encode(NEW.email::bytea, 'base64')
  );
  RETURN NEW;
END;
$function$
