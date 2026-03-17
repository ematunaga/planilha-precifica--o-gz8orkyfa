-- Allow Admins to delete profiles
-- Note: User deletion is handled by the admin Edge Function which deletes from auth.users (cascading to profiles),
-- but this policy explicitly grants the DELETE permission on public.profiles to Admins via RLS as requested.
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );
