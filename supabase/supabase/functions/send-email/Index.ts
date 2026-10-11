// supabase/functions/send-email/index.ts
// Transactional email sender. Uses Resend directly (no Lovable gateway).
// Required secret: RESEND_API_KEY
// Optional secret: RESEND_FROM_EMAIL, e.g. "Arvithex Capital Alliance <no-reply@yourdomain.com>"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload { to: string; subject: string; html: string; from?: string }

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  // Only trusted server code (other edge functions) may send email.
  // The public anon key is rejected, so this can't be used as an open mail relay.
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!SERVICE_KEY || token !== SERVICE_KEY) return reply({ error: "Unauthorized" }, 401);

  try {
    const { to, subject, html, from } = (await req.json()) as Payload;
    if (!to || !subject || !html) return reply({ error: "Missing to/subject/html" }, 400);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[send-email] RESEND_API_KEY is not set");
      return reply({ error: "Email provider not configured" }, 500);
    }

    const sender =
      from ||
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "Arvithex Capital Alliance <onboarding@resend.dev>";

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: sender, to: [to], subject, html }),
    });

    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Resend error", r.status, body);
      return reply({ error: "send failed", details: body }, 502);
    }
    return reply({ ok: true, id: body?.id });
  } catch (err) {
    console.error("send-email error", err);
    return reply({ error: String(err) }, 500);
  }
});
