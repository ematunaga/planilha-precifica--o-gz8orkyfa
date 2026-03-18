ALTER TABLE public.pricing_items
ADD COLUMN manufacturer TEXT,
ADD COLUMN distributor TEXT;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT UNIQUE NOT NULL,
  description TEXT,
  manufacturer TEXT,
  distributor TEXT,
  current_unit_cost NUMERIC,
  currency TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_products" ON public.products
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_delete_products" ON public.products
  FOR DELETE TO authenticated USING (true);

CREATE TABLE public.product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  unit_cost NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_history" ON public.product_price_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_history" ON public.product_price_history
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_history" ON public.product_price_history
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_delete_history" ON public.product_price_history
  FOR DELETE TO authenticated USING (true);
