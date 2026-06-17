
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, country, gender, phone, account_type, preferred_currency, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'account_type')::public.account_type, 'crypto_mining'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_currency', NEW.raw_user_meta_data->>'currency', 'USD'),
    COALESCE(NEW.raw_user_meta_data->>'currency', NEW.raw_user_meta_data->>'preferred_currency', 'USD')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.sync_profile_legacy_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.total_balance := COALESCE(NEW.total_balance, NEW.balance, 0);
    NEW.balance := COALESCE(NEW.balance, NEW.total_balance, 0);
    NEW.deposit := COALESCE(NEW.deposit, NEW.total_deposit, 0);
    NEW.total_deposit := COALESCE(NEW.total_deposit, NEW.deposit, 0);
    NEW.withdrawal := COALESCE(NEW.withdrawal, NEW.total_withdraw, 0);
    NEW.total_withdraw := COALESCE(NEW.total_withdraw, NEW.withdrawal, 0);
    NEW.currency := COALESCE(NEW.currency, NEW.preferred_currency, 'USD');
    NEW.preferred_currency := COALESCE(NEW.preferred_currency, NEW.currency, 'USD');
    NEW.assigned_trader_id := COALESCE(NEW.assigned_trader_id, NEW.manager_id);
    NEW.manager_id := COALESCE(NEW.manager_id, NEW.assigned_trader_id);
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

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
CREATE TRIGGER trg_sync_profile_cols BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_profile_legacy_columns();
