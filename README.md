# GlamWithJeni

A mobile app for Jeni's makeup and nail art studio. Customers log in with their mobile number, book appointments, order press-on nails, use offers, see their history and chat with Jeni (photos included). Jeni signs in to the same app with her number and gets the admin side: today's bookings, orders, offers, WhatsApp broadcasts and an inbox.

## What's in this repo

| Folder | What it is |
| --- | --- |
| [`prototype/`](prototype/) | The clickable design prototype. Open `prototype/index.html` in a browser, no install needed. Logo directions are in `prototype/logos.html`. |
| [`design/`](design/) | Source files for the prototype screens and logos. `tools/build-prototype.mjs` turns them into `prototype/`. |
| [`app/`](app/) | The real app: Expo (React Native, TypeScript, Expo Router) for Android and iPhone. Runs today on sample data. |
| [`supabase/`](supabase/) | Database schema with row-level security, storage buckets, and the WhatsApp broadcast Edge Function. |

## Try the prototype

Open `prototype/index.html`. On the login screen, tap **Use Jeni's number** to see the admin side, or type any other number to see the customer side. Offers Jeni creates appear for customers after logging out and back in, and chat photos travel both ways.

## Run the app

```bash
cd app
npm install
npx expo start          # then press a (Android), i (iOS simulator) or w (web)
```

Sign in with any 10-digit number for the customer side, or `9999999999` for the admin side (set `EXPO_PUBLIC_ADMIN_PHONES` in `app/.env.local` to change it). Any 6-digit OTP works until Supabase is connected.

Useful commands: `npm run typecheck`, `npx expo-doctor`.

### How the app is organised

```
app/src/
  app/                 Expo Router screens (file = route)
    login.tsx, otp.tsx       phone sign-in
    (customer)/              tabs: Home, Book, Shop, History, Chat
    offers.tsx, pay.tsx, success.tsx
    (admin)/                 tabs: Today, Orders, Broadcast, Offers, Inbox
    thread/[id].tsx          admin view of one customer chat
  components/          UI kit, chat with photos, icons
  lib/store.tsx        in-memory data + actions (each marked with the Supabase call that replaces it)
  lib/supabase.ts      Supabase client (reads EXPO_PUBLIC_SUPABASE_* env vars)
  lib/payments.ts      payment seam (simulated today; Razorpay flow documented inside)
  theme.ts             brand colours and fonts (logo A: Allura script + Outfit + Manrope)
```

Role-based access uses `Stack.Protected` in `src/app/_layout.tsx`: signed-out users only see login, customers only see customer screens, admins only see admin screens.

## Wiring up the backend

1. **Supabase project.** Create one, then run `supabase/schema.sql` in the SQL editor. Copy the URL and anon key into `app/.env.local` (see `app/.env.example`).
2. **Phone login.** In Supabase → Authentication → Providers, enable Phone with an SMS provider that delivers in India (e.g. MSG91 or Twilio Verify; Indian SMS needs DLT registration). Then replace `requestOtp` / `verifyOtp` in `lib/store.tsx` with `supabase.auth.signInWithOtp` / `verifyOtp`.
3. **Make Jeni admin.** After she signs in once: `update public.profiles set role = 'admin' where phone = '+91XXXXXXXXXX';`
4. **Move each action to Supabase.** Each action in `lib/store.tsx` names its query. Chat photos go to the private `chat-photos` bucket under `<customer_id>/`; use `supabase.channel()` on `messages` for live chat.
5. **Payments (Razorpay).** Add two Edge Functions: `create-payment` (recomputes the amount and offer discount server-side, creates a Razorpay order) and `verify-payment` (checks the signature with the secret key, then inserts the booking or order). `react-native-razorpay` needs a development build (`npx expo run:android` or `eas build --profile development`), not Expo Go. Details in `app/src/lib/payments.ts`.
6. **WhatsApp broadcasts.** Set up the WhatsApp Business Platform (Cloud API) for the studio's number, get two marketing templates approved (one with an image header), then deploy `supabase/functions/send-broadcast` with the secrets listed at the top of that file. Customers must have opted in; the login screen states this.

### Security model

All protection is enforced in the database, not just by hiding screens. The policies in `schema.sql` were tested against Postgres with Supabase-style auth:

- customers see only live, unexpired offers, their own bookings, orders and chat thread, and can upload photos only into their own chat folder;
- customers cannot create or change offers, cannot make themselves admin, and cannot insert bookings or orders directly (only the payment function can, after verifying payment);
- the admin role can read and manage everything.

## Before launch

- Replace sample services, prices and press-on products with Jeni's real menu (`app/src/data/catalog.ts`, then the `services` / `products` tables).
- Real product photos in the `product-images` bucket.
- App icon and splash from logo A (`app/assets/`), privacy policy URL, and store listings (Google Play one-time fee, Apple Developer yearly fee).
- Build and submit with EAS: `npx eas-cli@latest build` and `npx eas-cli@latest submit`.

## Rebuilding the prototype

Edit files in `design/`, then run `node tools/build-prototype.mjs`. The pages use a small runtime (`prototype/dc-lite.js`) built on Preact (MIT, vendored in `prototype/vendor/`).
