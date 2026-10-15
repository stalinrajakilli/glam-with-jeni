import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AdminHeader } from '@/components/AdminHeader';
import { Body, Button, Card, EmptyState, Field, IconButton, Label } from '@/components/ui';
import { offerLabel, useStore, type Offer } from '@/lib/store';
import { colors, fonts } from '@/theme';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete offer', style: 'destructive', onPress: onYes }]);
}

export default function ManageOffers() {
  const { state, actions } = useStore();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState<Offer['type']>('pct');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [validTill, setValidTill] = useState('');
  const [formError, setFormError] = useState('');
  const [published, setPublished] = useState<Offer | null>(null);
  const [deleted, setDeleted] = useState<{ offer: Offer; index: number } | null>(null);

  const publish = () => {
    const v = parseInt(value, 10);
    if (!title.trim() || !v) { setFormError('Add a title and a discount amount to publish.'); return; }
    if (type === 'pct' && v > 90) { setFormError('Percentage discounts can be at most 90%.'); return; }
    const offer = actions.addOffer({
      title: title.trim(),
      details: details.trim() || 'Limited-time offer from Jeni.',
      type, value: v,
      code: (code.trim() || title.replace(/[^A-Za-z]/g, '').slice(0, 8) + v).toUpperCase(),
      validTill: validTill.trim() || 'end of month',
    });
    setPublished(offer);
    setTitle(''); setDetails(''); setValue(''); setCode(''); setValidTill(''); setFormError('');
  };

  const remove = (o: Offer, index: number) =>
    confirm('Delete this offer?', 'It disappears from the app and checkout. Customers who already used it keep their discount.', () => {
      actions.deleteOffer(o.id);
      setDeleted({ offer: o, index });
      if (published?.id === o.id) setPublished(null);
    });

  const announce = (o: Offer) =>
    router.push({ pathname: '/broadcast', params: { message: `${o.title}: ${offerLabel(o)}! ${o.details} Use code ${o.code} in the GlamWithJeni app. Valid till ${o.validTill}.` } });

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Offers" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Create an offer</Text>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Weekend nail art" />
          <Field label="Details customers see" value={details} onChangeText={setDetails} placeholder="e.g. On any nail art set this Sat & Sun" />
          <View style={{ gap: 6 }}>
            <Text style={styles.fieldLabel}>Discount</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.toggle}>
                {(['pct', 'flat'] as const).map((t) => (
                  <Pressable key={t} onPress={() => setType(t)} accessibilityRole="radio" accessibilityState={{ checked: type === t }}
                    accessibilityLabel={t === 'pct' ? 'Percent off' : 'Rupees off'} style={[styles.toggleItem, type === t && styles.toggleOn]}>
                    <Text style={styles.toggleText}>{t === 'pct' ? '%' : '₹'}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Amount" value={value} onChangeText={(t) => setValue(t.replace(/[^0-9]/g, '').slice(0, 5))} keyboardType="number-pad" placeholder={type === 'pct' ? 'e.g. 10' : 'e.g. 300'} />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Coupon code" value={code} onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ''))} autoCapitalize="characters" placeholder="NAILART10" /></View>
            <View style={{ flex: 1 }}><Field label="Valid till" value={validTill} onChangeText={setValidTill} placeholder="25 Oct" /></View>
          </View>
          {!!formError && <Text style={styles.error}>{formError}</Text>}
          <Button title="Publish to app" onPress={publish} />
        </Card>

        {published && (
          <View style={styles.success}>
            <Body style={{ flex: 1, fontSize: 13, color: '#1F4D37' }}>"{published.title}" is live in the app now.</Body>
            <Button small variant="green" title="Announce on WhatsApp" onPress={() => announce(published)} />
          </View>
        )}
        {deleted && (
          <View style={styles.undo}>
            <Text style={{ flex: 1, color: '#fff', fontFamily: fonts.body, fontSize: 13 }}>Deleted "{deleted.offer.title}".</Text>
            <Pressable onPress={() => { actions.restoreOffer(deleted.offer, deleted.index); setDeleted(null); }} accessibilityRole="button" style={styles.undoBtn}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink }}>Undo</Text>
            </Pressable>
          </View>
        )}

        <Label>ALL OFFERS · SWITCH ON TO SHOW IN APP</Label>
        {state.offers.length === 0 && <EmptyState text="No offers yet. Create one above." />}
        {state.offers.map((o, i) => (
          <View key={o.id} style={styles.row}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.strong}>{o.title}</Text>
              <Body muted style={{ fontSize: 13 }}>{o.code} · {offerLabel(o)} · till {o.validTill}</Body>
              <Text style={[styles.state, { color: o.active ? colors.green : colors.disabledText }]}>{o.active ? 'Showing in app' : 'Hidden from customers'}</Text>
            </View>
            <Switch value={o.active} onValueChange={() => actions.toggleOffer(o.id)} trackColor={{ true: colors.green, false: '#C9B9C3' }}
              accessibilityLabel={`${o.title} ${o.active ? 'is live' : 'is paused'}`} />
            <IconButton icon="trash" label={`Delete ${o.title}`} color={colors.danger} onPress={() => remove(o, i)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedStrong },
  toggle: { flexDirection: 'row', backgroundColor: colors.segment, borderRadius: 12, padding: 3, alignSelf: 'flex-end', height: 48 },
  toggleItem: { width: 52, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.surface },
  toggleText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  error: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.danger },
  success: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.greenBg, borderRadius: 14, padding: 12 },
  undo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.ink, borderRadius: 14, padding: 10, paddingLeft: 14 },
  undoBtn: { height: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F2C4D3', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 14 },
  strong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  state: { fontFamily: fonts.bodyBold, fontSize: 12 },
});
