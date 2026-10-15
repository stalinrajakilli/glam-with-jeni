/**
 * App state for the starter. Everything lives in memory with sample data so the
 * app runs without a backend. Each action is marked with the Supabase call that
 * replaces it (see supabase/schema.sql and README "Wiring up Supabase").
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, SERVICES, inr } from '@/data/catalog';

export type Role = 'customer' | 'admin';
export type Session = { phone: string; role: Role; customerId?: string };

export type Offer = {
  id: string;
  title: string;
  details: string;
  type: 'pct' | 'flat';
  value: number;
  code: string;
  validTill: string;
  active: boolean;
};

export type Message = { id: string; fromCustomer: boolean; text?: string; imageUri?: string; at: string };
export type Customer = { id: string; name: string; phone: string };
export type Appointment = { id: string; customerId: string; title: string; when: string; status: 'Confirmed' | 'Upcoming' | 'Completed' };
export type Order = { id: string; customerId: string; items: string; total: number; date: string; status: 'Paid' | 'Shipped' | 'Delivered' };
export type Feedback = { id: string; customerId: string; stars: number; text: string; at: string };

export type BookingDraft = { serviceId: string; dateLabel: string; slot: string; notes: string };
export type Checkout = { kind: 'booking'; booking: BookingDraft } | { kind: 'order' };
export type CheckoutResult = { heading: string; title: string; detail: string };

// Numbers listed here sign in as admin in the starter. In production the role
// comes from the `profiles.role` column, checked by row-level security.
const ADMIN_PHONES: string[] = String(process.env.EXPO_PUBLIC_ADMIN_PHONES ?? '9999999999')
  .split(',')
  .map((s: string) => s.trim());

export const offerLabel = (o: Pick<Offer, 'type' | 'value'>) => (o.type === 'pct' ? `${o.value}% off` : `${inr(o.value)} off`);
export const offerDiscount = (o: Offer, subtotal: number) =>
  Math.min(subtotal, o.type === 'pct' ? (subtotal * o.value) / 100 : o.value);

let seq = 100;
const uid = (p: string) => `${p}${++seq}`;
const nowLabel = () => new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const CUSTOMERS: Record<string, Customer> = {
  priya: { id: 'priya', name: 'Priya M.', phone: '9876543210' },
  kavya: { id: 'kavya', name: 'Kavya R.', phone: '9820011223' },
  riya: { id: 'riya', name: 'Riya P.', phone: '9987045612' },
  neha: { id: 'neha', name: 'Neha G.', phone: '9769033018' },
};

type State = {
  session: Session | null;
  pendingPhone: string;
  offers: Offer[];
  threads: Record<string, Message[]>;
  seen: Record<string, number>;
  appointments: Appointment[];
  orders: Order[];
  feedback: Feedback[];
  cart: Record<string, number>;
  checkout: Checkout | null;
  lastResult: CheckoutResult | null;
};

const initialState: State = {
  session: null,
  pendingPhone: '',
  offers: [
    { id: 'o1', title: 'Diwali glow', details: 'Party and bridal-trial makeup booked before Diwali.', type: 'pct', value: 20, code: 'DIWALI20', validTill: '7 Nov', active: true },
    { id: 'o2', title: 'Buy 2 press-on sets', details: 'Mix any two designs in one order.', type: 'pct', value: 15, code: 'PRESS15', validTill: '31 Oct', active: true },
    { id: 'o3', title: 'Welcome to the studio', details: 'Your first booking or order in the app.', type: 'flat', value: 200, code: 'WELCOME200', validTill: '31 Dec', active: false },
  ],
  threads: {
    priya: [
      { id: 'm1', fromCustomer: false, text: 'Hi Priya! Your gel extensions are booked for Sat 24 Oct at 4 PM. Message us here if you need to reschedule.', at: '10:12 AM' },
      { id: 'm2', fromCustomer: true, text: 'Thank you! Can I bring a reference picture for the design?', at: '10:20 AM' },
      { id: 'm3', fromCustomer: false, text: 'Of course! Send the photo right here in chat.', at: '10:24 AM' },
    ],
    kavya: [{ id: 'm4', fromCustomer: true, text: 'Do the press-ons come in extra-small sizes?', at: 'Mon' }],
  },
  seen: { priya: 3 },
  appointments: [
    { id: 'a1', customerId: 'priya', title: 'Gel extensions', when: 'Sat 24 Oct, 4:00 PM', status: 'Upcoming' },
    { id: 'a2', customerId: 'priya', title: 'Party makeup', when: 'Sun 28 Sep, 5:30 PM', status: 'Completed' },
    { id: 'a3', customerId: 'priya', title: 'Nail art (full set)', when: 'Fri 12 Sep, 2:30 PM', status: 'Completed' },
  ],
  orders: [
    { id: '#1044', customerId: 'kavya', items: 'Midnight Chrome × 1, Gold Leaf × 1', total: 1898, date: 'Today', status: 'Paid' },
    { id: '#1043', customerId: 'priya', items: 'Blush French × 2', total: 1398, date: 'Yesterday', status: 'Paid' },
    { id: '#1042', customerId: 'priya', items: 'Blush French × 1', total: 699, date: '3 Oct', status: 'Delivered' },
  ],
  feedback: [
    { id: 'f1', customerId: 'riya', stars: 5, text: 'Loved my party makeup, it stayed perfect all night!', at: 'Yesterday' },
    { id: 'f2', customerId: 'neha', stars: 3, text: 'Nails look great but I waited 20 minutes past my slot.', at: 'Mon' },
  ],
  cart: {},
  checkout: null,
  lastResult: null,
};

function useAppState() {
  const [state, setState] = useState<State>(initialState);
  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(
    () => ({
      // ---- auth --------------------------------------------------------
      // Supabase: supabase.auth.signInWithOtp({ phone: '+91' + phone })
      requestOtp: (phone: string) => patch(() => ({ pendingPhone: phone })),
      // Supabase: supabase.auth.verifyOtp({ phone, token, type: 'sms' }), then read profiles.role
      verifyOtp: (_code: string) =>
        patch((s) => {
          const phone = s.pendingPhone;
          const isAdmin = ADMIN_PHONES.includes(phone);
          const known = Object.values(CUSTOMERS).find((c) => c.phone === phone);
          return { session: { phone, role: isAdmin ? 'admin' : 'customer', customerId: isAdmin ? undefined : known?.id ?? 'priya' } };
        }),
      signOut: () => patch(() => ({ session: null, pendingPhone: '', cart: {}, checkout: null })),

      // ---- offers (admin writes, customers read active ones) -------------
      // Supabase: insert into offers
      addOffer: (o: Omit<Offer, 'id' | 'active'>) => {
        const offer: Offer = { ...o, id: uid('o'), active: true };
        patch((s) => ({ offers: [offer, ...s.offers] }));
        return offer;
      },
      // Supabase: update offers set active = not active
      toggleOffer: (id: string) => patch((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, active: !o.active } : o)) })),
      // Supabase: delete from offers where id = ...
      deleteOffer: (id: string) => patch((s) => ({ offers: s.offers.filter((o) => o.id !== id) })),
      restoreOffer: (offer: Offer, index: number) =>
        patch((s) => {
          const next = [...s.offers];
          next.splice(Math.min(index, next.length), 0, offer);
          return { offers: next };
        }),

      // ---- shop & checkout ---------------------------------------------
      setQty: (productId: string, qty: number) =>
        patch((s) => {
          const cart = { ...s.cart };
          if (qty <= 0) delete cart[productId];
          else cart[productId] = qty;
          return { cart };
        }),
      startCheckout: (c: Checkout) => patch(() => ({ checkout: c })),
      // Supabase + Razorpay: create the order server-side (Edge Function), open
      // Razorpay checkout, then verify the payment signature server-side before
      // inserting the booking / order row. See src/lib/payments.ts.
      completeCheckout: (total: number) =>
        patch((s) => {
          const customerId = s.session?.customerId ?? 'priya';
          if (s.checkout?.kind === 'booking') {
            const b = s.checkout.booking;
            const service = SERVICES.find((x) => x.id === b.serviceId)!;
            const when = `${b.dateLabel}, ${b.slot}`;
            return {
              appointments: [{ id: uid('a'), customerId, title: service.name, when, status: 'Confirmed' }, ...s.appointments],
              checkout: null,
              lastResult: { heading: 'Booking confirmed', title: `${service.name} · ${when}`, detail: 'You’ll get a WhatsApp reminder the day before. Need to change it? Message us in Chat.' },
            };
          }
          const id = '#' + (1045 + s.orders.length);
          const items = Object.entries(s.cart)
            .map(([pid, q]) => `${PRODUCTS.find((p) => p.id === pid)?.name} × ${q}`)
            .join(', ');
          return {
            orders: [{ id, customerId, items, total, date: 'Today', status: 'Paid' }, ...s.orders],
            cart: {},
            checkout: null,
            lastResult: { heading: 'Order placed', title: `Order ${id} · ${inr(total)} paid`, detail: 'We’ll message you when your press-ons ship. Usual delivery: 3–5 days.' },
          };
        }),
      // Supabase: update orders set status = 'Shipped' (+ WhatsApp shipping update)
      shipOrder: (id: string) => patch((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'Shipped' } : o)) })),

      // ---- chat ----------------------------------------------------------
      // Supabase: upload the photo to the private `chat-photos` bucket, then
      // insert into messages; subscribe with supabase.channel() for live updates.
      sendMessage: (customerId: string, fromCustomer: boolean, text: string, imageUri?: string) =>
        patch((s) => {
          const list = [...(s.threads[customerId] ?? []), { id: uid('m'), fromCustomer, text: text || undefined, imageUri, at: nowLabel() }];
          return { threads: { ...s.threads, [customerId]: list }, seen: fromCustomer ? s.seen : { ...s.seen, [customerId]: list.length } };
        }),
      markSeen: (customerId: string) =>
        patch((s) => ({ seen: { ...s.seen, [customerId]: (s.threads[customerId] ?? []).length }, threads: s.threads[customerId] ? s.threads : { ...s.threads, [customerId]: [] } })),
      // Supabase: insert into feedback
      submitFeedback: (stars: number, text: string) =>
        patch((s) => ({ feedback: [{ id: uid('f'), customerId: s.session?.customerId ?? 'priya', stars, text, at: 'Just now' }, ...s.feedback] })),
    }),
    [patch],
  );

  return { state, actions, customers: CUSTOMERS };
}

type Store = ReturnType<typeof useAppState>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAppState();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
