-- Create proposal conditions table
CREATE TABLE IF NOT EXISTS public.proposal_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'distributor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.proposal_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposal_conditions_select" ON public.proposal_conditions;
CREATE POLICY "proposal_conditions_select" ON public.proposal_conditions 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "proposal_conditions_insert" ON public.proposal_conditions;
CREATE POLICY "proposal_conditions_insert" ON public.proposal_conditions 
  FOR INSERT TO authenticated WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin');

DROP POLICY IF EXISTS "proposal_conditions_update" ON public.proposal_conditions;
CREATE POLICY "proposal_conditions_update" ON public.proposal_conditions 
  FOR UPDATE TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin');

DROP POLICY IF EXISTS "proposal_conditions_delete" ON public.proposal_conditions;
CREATE POLICY "proposal_conditions_delete" ON public.proposal_conditions 
  FOR DELETE TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin');


-- Create generated proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_id TEXT,
  file_name TEXT NOT NULL,
  proposal_number INT NOT NULL,
  version_number INT NOT NULL,
  client_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposals_select" ON public.proposals;
CREATE POLICY "proposals_select" ON public.proposals 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = proposals.project_id 
      AND (projects.is_public = true OR projects.owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin')
    )
  );

DROP POLICY IF EXISTS "proposals_insert" ON public.proposals;
CREATE POLICY "proposals_insert" ON public.proposals 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = proposals.project_id 
      AND (projects.owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Editor')
    )
  );

DROP POLICY IF EXISTS "proposals_delete" ON public.proposals;
CREATE POLICY "proposals_delete" ON public.proposals 
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = proposals.project_id 
      AND (projects.owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin')
    )
  );
