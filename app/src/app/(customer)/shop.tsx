import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NailSet } from '@/components/NailSet';
import { Body, Button, H1 } from '@/components/ui';
import { PRODUCTS, inr } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Shop() {
  const { state, actions } = useStore();
  const count = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const total = PRODUCTS.reduce((sum, p) => sum + (state.cart[p.id] ?? 0) * p.price, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <H1>Press-on nails</H1>
          <Body muted style={{ fontSize: 13 }}>Sizing kit included</Body>
        </View>
        <View style={styles.grid}>
          {PRODUCTS.map((p) => {
            const qty = state.cart[p.id] ?? 0;
            return (
              <View key={p.id} style={styles.card}>
                <NailSet colors={p.colors} />
                <Text style={styles.name}>{p.name}</Text>
                <Body muted style={{ fontSize: 12 }}>{p.shape}</Body>
                <View style={styles.row}>
                  <Text style={styles.name}>{inr(p.price)}</Text>
                  {qty === 0 ? (
                    <Button title="Add" variant="dark" small onPress={() => actions.setQty(p.id, 1)} accessibilityLabel={`Add ${p.name}`} />
                  ) : (
                    <View style={styles.stepper}>
                      <Pressable onPress={() => actions.setQty(p.id, qty - 1)} accessibilityLabel={`Remove one ${p.name}`} style={styles.step}><Text style={styles.stepText}>−</Text></Pressable>
                      <Text style={styles.qty}>{qty}</Text>
                      <Pressable onPress={() => actions.setQty(p.id, qty + 1)} accessibilityLabel={`Add one ${p.name}`} style={styles.step}><Text style={styles.stepText}>+</Text></Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {count > 0 && (
        <View style={styles.bar}>
          <View style={{ flex: 1 }}>
            <Body muted style={{ fontSize: 12 }}>{count} {count === 1 ? 'set' : 'sets'} in cart</Body>
            <Text style={styles.total}>{inr(total)}</Text>
          </View>
          <Button title="Checkout" onPress={() => { actions.startCheckout({ kind: 'order' }); router.push('/pay'); }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 10, gap: 4 },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.blush, borderRadius: 12 },
  step: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.roseDeep },
  qty: { minWidth: 16, textAlign: 'center', fontFamily: fonts.bodyBold, color: colors.ink },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
});
