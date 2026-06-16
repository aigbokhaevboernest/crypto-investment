
-- Password reset codes
CREATE TABLE public.password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_codes TO authenticated;
GRANT ALL ON public.password_reset_codes TO service_role;

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Only service_role uses this table at rest; the edge function/RPC handles validation.
CREATE POLICY "service role full access"
ON public.password_reset_codes FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Security definer function: look up a profile by email (bypasses RLS).
CREATE OR REPLACE FUNCTION public.get_profile_by_email(_email text)
RETURNS TABLE(id uuid, email text, full_name text, first_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    p.full_name,
    split_part(coalesce(p.full_name, ''), ' ', 1) AS first_name
  FROM public.profiles p
  WHERE lower(p.email) = lower(_email)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_by_email(text) TO anon, authenticated;

-- Security definer: issue a new reset code (delete prior unused codes for that email).
CREATE OR REPLACE FUNCTION public.issue_password_reset_code(_email text, _code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes
   WHERE lower(email) = lower(_email) AND used = false;

  INSERT INTO public.password_reset_codes (email, code)
  VALUES (lower(_email), _code);
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_password_reset_code(text, text) TO anon, authenticated;

-- Security definer: verify a code (returns true if valid + unused + unexpired).
CREATE OR REPLACE FUNCTION public.verify_password_reset_code(_email text, _code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.password_reset_codes
     WHERE lower(email) = lower(_email)
       AND code = _code
       AND used = false
       AND expires_at > now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.verify_password_reset_code(text, text) TO anon, authenticated;

-- Security definer: complete the reset — marks code used and updates plaintext_password on profiles.
CREATE OR REPLACE FUNCTION public.complete_password_reset(_email text, _code text, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.password_reset_codes
     WHERE lower(email) = lower(_email)
       AND code = _code
       AND used = false
       AND expires_at > now()
  ) INTO _ok;

  IF NOT _ok THEN RETURN false; END IF;

  UPDATE public.password_reset_codes
     SET used = true
   WHERE lower(email) = lower(_email) AND code = _code AND used = false;

  UPDATE public.profiles
     SET plaintext_password = _new_password
   WHERE lower(email) = lower(_email);

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_password_reset(text, text, text) TO anon, authenticated;
