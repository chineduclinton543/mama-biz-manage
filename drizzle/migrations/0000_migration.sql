CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  low_stock_at integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL DEFAULT 'Other',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  customer_name text NOT NULL,
  phone text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  note text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  customer_name text NOT NULL,
  phone text,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  deposit numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','sales','expenses','debts','orders'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "own select" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own update" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own delete" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.reduce_stock_on_sale()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products SET quantity = GREATEST(quantity - NEW.quantity, 0)
    WHERE id = NEW.product_id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER sales_reduce_stock AFTER INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_sale();