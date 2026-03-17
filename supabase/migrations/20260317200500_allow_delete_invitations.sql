-- Add DELETE policy to user_invitations so authenticated users can delete them
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_invitations'
          AND policyname = 'Invitations can be deleted by authenticated users'
    ) THEN
        CREATE POLICY "Invitations can be deleted by authenticated users"
        ON public.user_invitations
        FOR DELETE
        TO authenticated
        USING (true);
    END IF;
END
$$;
