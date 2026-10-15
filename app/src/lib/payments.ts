/**
 * Payment seam. The starter simulates a successful payment so the flow can be
 * clicked through. Production flow with Razorpay:
 *
 * 1. App calls the `create-payment` Edge Function with the booking/order draft.
 *    The function recomputes the amount and offer discount server-side (never
 *    trust the amount from the app) and creates a Razorpay order.
 * 2. App opens Razorpay Checkout with that order id (react-native-razorpay needs
 *    a development build: `npx expo run:android` or `eas build --profile development`).
 * 3. Razorpay returns payment_id + signature; the app sends them to the
 *    `verify-payment` Edge Function, which checks the signature with the secret
 *    key and only then inserts the booking / order row.
 * 4. A Razorpay webhook (payment.captured) is the backup path if the app closes mid-payment.
 */
export type PaymentMethod = 'upi' | 'card' | 'netbanking';

export async function pay(_amountInRupees: number, _method: PaymentMethod): Promise<{ ok: true } | { ok: false; error: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
