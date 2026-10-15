// Supabase Edge Function: send a WhatsApp broadcast (text + optional image) to opted-in customers.
//
// Deploy:  supabase functions deploy send-broadcast
// Secrets: supabase secrets set WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... \
//            WHATSAPP_TEMPLATE=promo_with_image WHATSAPP_TEMPLATE_LANG=en WHATSAPP_API_VERSION=v23.0
//
// The template must be approved in WhatsApp Manager first, e.g. "promo_with_image":
//   Header: IMAGE    Body: "Hi from GlamWithJeni! {{1}}"    Button: "Open the app" (URL)
// A text-only broadcast uses a second template without the image header (WHATSAPP_TEMPLATE_TEXT).
//
// Request body (JSON), sent by the admin app with the admin's session token:
//   { "audience": "all" | "nails" | "makeup" | "lapsed", "body": "message text", "imagePath": "broadcast-images/<file>" | null }
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const version = Deno.env.get('WHATSAPP_API_VERSION') ?? 'v23.0';
  const lang = Deno.env.get('WHATSAPP_TEMPLATE_LANG') ?? 'en';
  if (!token || !phoneNumberId) return json({ error: 'WhatsApp is not configured' }, 500);

  // 1. Only Jeni (role = admin) may broadcast. Check the caller's own token.
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: isAdmin } = await caller.rpc('is_admin');
  if (!isAdmin) return json({ error: 'Admins only' }, 403);
  const { data: { user } } = await caller.auth.getUser();

  const { audience, body, imagePath } = await req.json() as { audience: string; body: string; imagePath?: string | null };
  if (!body?.trim()) return json({ error: 'Message is empty' }, 400);

  const admin = createClient(url, serviceKey);

  // 2. Pick recipients. Everyone must have opted in to WhatsApp messages.
  let query = admin.from('profiles').select('id, phone').eq('role', 'customer').eq('whatsapp_opt_in', true).not('phone', 'is', null);
  if (audience === 'nails' || audience === 'makeup') {
    // Customers who booked a matching service. Adjust the name filter to your service names.
    const pattern = audience === 'nails' ? '%nail%' : '%makeup%';
    const { data: rows } = await admin.from('bookings').select('customer_id, services!inner(name)').ilike('services.name', pattern);
    query = query.in('id', [...new Set((rows ?? []).map((r) => r.customer_id))]);
  } else if (audience === 'lapsed') {
    const since = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
    const { data: recent } = await admin.from('bookings').select('customer_id').gte('starts_at', since);
    const recentIds = [...new Set((recent ?? []).map((r) => r.customer_id))];
    if (recentIds.length) query = query.not('id', 'in', `(${recentIds.join(',')})`);
  }
  const { data: recipients, error } = await query;
  if (error) return json({ error: error.message }, 500);

  // 3. A short-lived signed link lets WhatsApp fetch the image from the private bucket.
  let imageLink: string | null = null;
  if (imagePath) {
    const [bucket, ...rest] = imagePath.split('/');
    const { data } = await admin.storage.from(bucket).createSignedUrl(rest.join('/'), 60 * 60);
    imageLink = data?.signedUrl ?? null;
  }
  const template = imageLink ? Deno.env.get('WHATSAPP_TEMPLATE') ?? 'promo_with_image' : Deno.env.get('WHATSAPP_TEMPLATE_TEXT') ?? 'promo_text';

  // 4. Send one template message per customer (Cloud API has no bulk endpoint).
  let sent = 0, failed = 0;
  for (const r of recipients ?? []) {
    const components: unknown[] = [{ type: 'body', parameters: [{ type: 'text', text: body.trim() }] }];
    if (imageLink) components.unshift({ type: 'header', parameters: [{ type: 'image', image: { link: imageLink } }] });
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: String(r.phone).replace(/^\+/, ''),
        type: 'template',
        template: { name: template, language: { code: lang }, components },
      }),
    });
    if (res.ok) sent++; else failed++;
    await new Promise((ok) => setTimeout(ok, 60)); // stay well under rate limits
  }

  await admin.from('broadcasts').insert({
    audience, body: body.trim(), image_path: imagePath ?? null, template_name: template,
    recipients: recipients?.length ?? 0, sent, failed, created_by: user?.id ?? null,
  });

  return json({ recipients: recipients?.length ?? 0, sent, failed });
});
