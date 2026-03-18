CREATE TABLE IF NOT EXISTS public.pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT NOT NULL,
  description TEXT,
  type TEXT,
  currency TEXT,
  quantity NUMERIC,
  unit_cost NUMERIC,
  pis NUMERIC,
  cofins NUMERIC,
  difal NUMERIC,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON public.pricing_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert" ON public.pricing_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update" ON public.pricing_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete" ON public.pricing_items
  FOR DELETE TO authenticated USING (true);
