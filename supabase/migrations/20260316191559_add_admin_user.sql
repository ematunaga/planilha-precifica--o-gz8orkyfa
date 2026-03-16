DO $DO$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'enio.matunaga@leapit.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'enio.matunaga@leapit.com.br',
      crypt('z7B?j6m5Yb5b?H&N', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Enio Matunaga", "role": "Admin", "status": "Authorized"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $DO$;

-- Ensure profile is explicitly created and authorized if trigger was skipped or to enforce status
DO $DO$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'enio.matunaga@leapit.com.br';
  
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
      INSERT INTO public.profiles (id, email, name, role, status)
      VALUES (v_user_id, 'enio.matunaga@leapit.com.br', 'Enio Matunaga', 'Admin', 'Authorized');
    ELSE
      UPDATE public.profiles SET role = 'Admin', status = 'Authorized' WHERE id = v_user_id;
    END IF;
  END IF;
END $DO$;
