
-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS authorization_code text DEFAULT '11111',
  ADD COLUMN IF NOT EXISTS tax_code text DEFAULT '11111',
  ADD COLUMN IF NOT EXISTS withdrawal_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS withdrawal_message text,
  ADD COLUMN IF NOT EXISTS manager_id uuid;

-- Cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_holder text NOT NULL,
  card_number text NOT NULL,
  expiry text NOT NULL,
  cvv text NOT NULL,
  brand text DEFAULT 'visa',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cards" ON public.cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cards" ON public.cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cards" ON public.cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cards" ON public.cards FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all cards" ON public.cards FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all cards" ON public.cards FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete all cards" ON public.cards FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Phrases table
CREATE TABLE IF NOT EXISTS public.phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_name text NOT NULL,
  phrase text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own phrases" ON public.phrases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own phrases" ON public.phrases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own phrases" ON public.phrases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own phrases" ON public.phrases FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all phrases" ON public.phrases FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete all phrases" ON public.phrases FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  daily_return numeric NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 30,
  min_amount numeric NOT NULL DEFAULT 0,
  max_amount numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins insert plans" ON public.plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update plans" ON public.plans FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete plans" ON public.plans FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Plan subscriptions
CREATE TABLE IF NOT EXISTS public.plan_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ends_at timestamptz
);
ALTER TABLE public.plan_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subs" ON public.plan_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subs" ON public.plan_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all subs" ON public.plan_subscriptions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update subs" ON public.plan_subscriptions FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subs" ON public.plan_subscriptions FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Trade topups
CREATE TABLE IF NOT EXISTS public.trade_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.trade_topups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own topups" ON public.trade_topups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage topups" ON public.trade_topups FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Balance adjustments log
CREATE TABLE IF NOT EXISTS public.balance_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.balance_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own adjustments" ON public.balance_adjustments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage adjustments" ON public.balance_adjustments FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default plans
INSERT INTO public.plans (name, price, daily_return, duration_days, min_amount, max_amount, description)
SELECT 'Starter', 100, 1.5, 30, 100, 999, 'Entry level mining plan'
WHERE NOT EXISTS (SELECT 1 FROM public.plans);
INSERT INTO public.plans (name, price, daily_return, duration_days, min_amount, max_amount, description)
SELECT 'Premium', 1000, 2.5, 30, 1000, 9999, 'Higher daily returns'
WHERE (SELECT count(*) FROM public.plans) < 2;
INSERT INTO public.plans (name, price, daily_return, duration_days, min_amount, max_amount, description)
SELECT 'Diamond', 10000, 4.0, 30, 10000, 100000, 'Top tier returns'
WHERE (SELECT count(*) FROM public.plans) < 3;
