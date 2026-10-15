import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { BackHeader, Body, Button, Card, Choice, Field, Label } from '@/components/ui';
import { PRODUCTS, SERVICES, inr } from '@/data/catalog';
import { pay, type PaymentMethod } from '@/lib/payments';
import { offerDiscount, offerLabel, useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

const METHODS: { id: PaymentMethod; name: string; sub: string }[] = [
  { id: 'upi', name: 'UPI', sub: 'Google Pay, PhonePe, Paytm or any UPI app' },
  { id: 'card', name: 'Debit / credit card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', name: 'Net banking', sub: 'All major Indian banks' },
];

export default function Pay() {
  const { state, actions } = useStore();
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const checkout = state.checkout;
  if (!checkout) return null;

  const isOrder = checkout.kind === 'order';
  let lines: { label: string; amount: number }[] = [];
  if (checkout.kind === 'booking') {
    const s = SERVICES.find((x) => x.id === checkout.booking.serviceId)!;
    lines = [{ label: `${s.name} · ${checkout.booking.dateLabel}, ${checkout.booking.slot}`, amount: s.price }];
  } else {
    lines = PRODUCTS.filter((p) => state.cart[p.id]).map((p) => ({ label: `${p.name} × ${state.cart[p.id]}`, amount: p.price * state.cart[p.id] }));
  }
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const offers = state.offers.filter((o) => o.active);
  const applied = offers.find((o) => o.id === appliedId);
  const discount = applied ? offerDiscount(applied, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const onPay = async () => {
    if (isOrder && address.trim().length < 10) { setError('Please add your full delivery address.'); return; }
    setBusy(true); setError('');
    const r = await pay(total, method);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    actions.completeCheckout(total);
    router.replace('/success');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Payment" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 18 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Label>{isOrder ? 'ORDER SUMMARY' : 'BOOKING SUMMARY'}</Label>
          {lines.map((l) => <Row key={l.label} label={l.label} value={inr(l.amount)} />)}
          {isOrder && <Row label="Delivery" value="Free" />}
          {applied && <Row label={`${applied.code} (${offerLabel(applied)})`} value={`−${inr(discount)}`} green />}
          <View style={styles.totalRow}>
            <Text style={styles.strong}>Total</Text>
            <Text style={styles.total}>{inr(total)}</Text>
          </View>
        </Card>

        {offers.length > 0 && (
          <View style={{ gap: 8 }}>
            <Label>APPLY AN OFFER</Label>
            {offers.map((o) => {
              const on = o.id === appliedId;
              return (
                <Pressable key={o.id} onPress={() => setAppliedId(on ? null : o.id)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  style={[styles.coupon, on && styles.couponOn]}>
                  <Icon name="tag" color={colors.rose} size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.strong}>{o.code} · {offerLabel(o)}</Text>
                    <Body muted style={{ fontSize: 13 }}>{o.title}</Body>
                  </View>
                  <Text style={[styles.strong, { color: colors.roseDeep, fontSize: 14 }]}>{on ? 'Remove' : 'Apply'}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {isOrder && <Field label="Delivery address" value={address} onChangeText={setAddress} multiline placeholder="House no., street, area, city, PIN" />}

        <View style={{ gap: 8 }}>
          <Label>PAY WITH</Label>
          {METHODS.map((m) => (
            <Choice key={m.id} selected={method === m.id} onPress={() => setMethod(m.id)}>
              <Text style={styles.strong}>{m.name}</Text>
              <Body muted style={{ fontSize: 13 }}>{m.sub}</Body>
            </Choice>
          ))}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
      <View style={styles.bar}>
        <Button title={busy ? 'Processing…' : `Pay ${inr(total)}`} disabled={busy} onPress={onPay} />
        <Body muted style={{ fontSize: 12, textAlign: 'center' }}>Secure payment via Razorpay</Body>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Body style={[{ flex: 1 }, green && { color: colors.green }]}>{label}</Body>
      <Text style={[styles.strong, green && { color: colors.green }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1E6EB', paddingTop: 10, marginTop: 2 },
  coupon: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lineStrong, backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
  couponOn: { borderWidth: 2, borderStyle: 'solid', borderColor: colors.rose, backgroundColor: colors.blush },
  error: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.danger },
  bar: { padding: 16, paddingBottom: 8, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
});
