// supabase/functions/password-reset/index.ts
// Server-side password reset: code generation, hashing, expiry, attempt limits,
// emailing, and the password update all happen here with the service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BRAND = "Arvithex Capital Alliance";
const CODE_TTL_MIN = 15;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 5;
const RESEND_COOLDOWN_SEC = 30;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (error: string) => json({ ok: false, error });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PEPPER = Deno.env.get("RESET_CODE_PEPPER") ?? "";
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const sha256 = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};
const hashCode = (email: string, code: string) => sha256(`${email}:${code}:${PEPPER}`);

// Cryptographically secure 6-digit code
const makeCode = () => {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
};

// Uses your existing send-email function, called with the service key (not the public anon key).
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) {
    console.error("send-email failed", e);
  }
};

// Finds the profile for an email. Adjust table/columns if yours differ.
const findProfile = async (email: string) => {
  const pattern = email.replace(/[\\%_]/g, "\\$&");
  const { data } = await admin.from("profiles").select("*").ilike("email", pattern).limit(1).maybeSingle();
  if (!data) return null;
  const userId = (data as any).user_id ?? (data as any).id;
  return userId ? { userId: userId as string, firstName: ((data as any).first_name as string) || "" } : null;
};

const checkCode = async (email: string, code: string) => {
  const { data: row } = await admin
    .from("password_reset_codes")
    .select("*")
    .eq("email", email)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row || row.attempts >= MAX_ATTEMPTS) return null;
  if (row.code_hash !== (await hashCode(email, code))) {
    await admin.from("password_reset_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return null;
  }
  return row;
};

const emailShell = (inner: string) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f4f6f8;padding:40px 12px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;">
      ${inner}
      <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;">— ${BRAND} Security</p>
    </div>
  </div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("Method not allowed.");

  let body: any;
  try { body = await req.json(); } catch { return fail("Invalid request."); }

  const action = String(body?.action ?? "");
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail("Enter a valid email address.");

  try {
    // 1) REQUEST — always responds the same, so account existence is never revealed.
    if (action === "request") {
      const profile = await findProfile(email);
      if (profile) {
        const now = Date.now();
        const hourAgo = new Date(now - 3600_000).toISOString();
        const { data: recent } = await admin
          .from("password_reset_codes").select("created_at").eq("email", email)
          .gt("created_at", hourAgo).order("created_at", { ascending: false });
        const tooMany = (recent?.length ?? 0) >= MAX_CODES_PER_HOUR;
        const tooSoon = recent?.[0] && now - new Date(recent[0].created_at).getTime() < RESEND_COOLDOWN_SEC * 1000;

        if (!tooMany && !tooSoon) {
          const code = makeCode();
          await admin.from("password_reset_codes").update({ used: true }).eq("email", email).eq("used", false);
          await admin.from("password_reset_codes").insert({
            email,
            code_hash: await hashCode(email, code),
            expires_at: new Date(now + CODE_TTL_MIN * 60_000).toISOString(),
          });
          await sendEmail(
            email,
            `Your password reset code — ${BRAND}`,
            emailShell(`
              <h1 style="margin:0 0 12px;color:#1f2937;font-size:22px;">Hello ${esc(profile.firstName || "there")},</h1>
              <p style="color:#475569;font-size:14px;margin:0;">Your password reset code is:</p>
              <div style="font-size:40px;letter-spacing:10px;font-weight:800;color:#3d7d92;text-align:center;padding:24px;border:2px dashed #d5dde3;border-radius:14px;margin:18px 0;">${code}</div>
              <p style="color:#64748b;font-size:13px;margin:0;">This code expires in ${CODE_TTL_MIN} minutes. If you didn't request it, you can safely ignore this email.</p>`),
          );
        }
      }
      return json({ ok: true });
    }

    // 2) VERIFY — checks the code (does not consume it)
    if (action === "verify") {
      const code = String(body?.code ?? "");
      if (!/^\d{6}$/.test(code)) return fail("Enter the 6-digit code.");
      const row = await checkCode(email, code);
      return row ? json({ ok: true }) : fail("Invalid or expired code.");
    }

    // 3) COMPLETE — re-verifies the code, changes the password, consumes the code
    if (action === "complete") {
      const code = String(body?.code ?? "");
      const newPassword = String(body?.newPassword ?? "");
      if (!/^\d{6}$/.test(code)) return fail("Enter the 6-digit code.");
      if (newPassword.length < 8 || newPassword.length > 72) return fail("Password must be 8–72 characters.");

      const row = await checkCode(email, code);
      if (!row) return fail("Invalid or expired code. Please request a new one.");
      const profile = await findProfile(email);
      if (!profile) return fail("Invalid or expired code. Please request a new one.");

      const { error } = await admin.auth.admin.updateUserById(profile.userId, { password: newPassword });
      if (error) return fail(error.message || "Couldn't change the password.");

      await admin.from("password_reset_codes").update({ used: true }).eq("email", email);
      await sendEmail(
        email,
        `Your password was changed — ${BRAND}`,
        emailShell(`
          <h1 style="margin:0 0 12px;color:#1f2937;font-size:22px;">Hi ${esc(profile.firstName || "there")},</h1>
          <p style="color:#475569;font-size:14px;margin:0;">Your ${BRAND} password was just changed. If this wasn't you, contact support immediately.</p>`),
      );
      return json({ ok: true });
    }

    return fail("Unknown action.");
  } catch (e) {
    console.error("password-reset error", e);
    return fail("Something went wrong. Please try again.");
  }
});
