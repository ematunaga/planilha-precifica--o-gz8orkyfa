CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  folder_id TEXT,
  template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Admins can do everything, owners can manage their own, everyone can read public
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated
  USING (
    is_public = true
    OR owner_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO authenticated
  USING (
    owner_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

-- Link pricing_items to the new projects table
-- We truncate to avoid cast errors since old IDs were strings (Date.now())
TRUNCATE TABLE public.pricing_items;

ALTER TABLE public.pricing_items 
  DROP COLUMN IF EXISTS project_id;

ALTER TABLE public.pricing_items 
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Update pricing_items RLS to enforce project visibility
DROP POLICY IF EXISTS "authenticated_select" ON public.pricing_items;

CREATE POLICY "pricing_items_select" ON public.pricing_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pricing_items.project_id
      AND (
        projects.is_public = true
        OR projects.owner_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
      )
    )
  );
