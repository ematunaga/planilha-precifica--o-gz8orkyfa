-- Secure user_invitations RLS policies strictly for authenticated users
DROP POLICY IF EXISTS "Invitations can be inserted by everyone" ON public.user_invitations;
CREATE POLICY "Invitations can be inserted by authenticated users" ON public.user_invitations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Invitations are viewable by everyone" ON public.user_invitations;
CREATE POLICY "Invitations are viewable by authenticated users" ON public.user_invitations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Invitations can be updated by everyone" ON public.user_invitations;
CREATE POLICY "Invitations can be updated by authenticated users" ON public.user_invitations FOR UPDATE TO authenticated USING (true);
