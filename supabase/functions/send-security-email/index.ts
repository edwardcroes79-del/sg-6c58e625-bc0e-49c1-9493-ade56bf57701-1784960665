import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailPayload {
  email: string;
  eventType: string;
  details?: Record<string, any>;
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, eventType, details = {} } = (await req.json()) as EmailPayload;

    if (!email || !eventType) {
      return new Response(JSON.stringify({ error: "Missing email or eventType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Placeholder: integrate with SendGrid, Mailgun, or Amazon SES here.
    // Example:
    // const res = await fetch("https://api.sendgrid.com/v3/mail/send", { ... });
    // if (!res.ok) throw new Error(await res.text());

    console.log(`Security email queued: ${eventType} -> ${email}`, details);

    return new Response(JSON.stringify({ sent: true, note: "Email provider not configured" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});