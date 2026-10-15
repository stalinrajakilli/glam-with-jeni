import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Button, Choice, Field, H1, Label } from '@/components/ui';
import { SERVICES, SLOTS, inr, upcomingDays } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

// Sample: one slot shown as fully booked. Real availability comes from the bookings table.
const BOOKED = new Set(['1:00 PM']);

export default function Book() {
  const { actions } = useStore();
  const days = useMemo(() => upcomingDays(7), []);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const service = SERVICES.find((s) => s.id === serviceId);
  const day = days[dayIdx];
  const ready = !!service && !!slot;

  const toPay = () => {
    if (!service || !slot) return;
    actions.startCheckout({ kind: 'booking', booking: { serviceId: service.id, dateLabel: `${day.weekday} ${day.day} ${day.month}`, slot, notes } });
    router.push('/pay');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }}>
        <H1>Book appointment</H1>

        <View style={{ gap: 10 }}>
          <Label>1 · CHOOSE A SERVICE</Label>
          {SERVICES.map((s) => (
            <Choice key={s.id} selected={s.id === serviceId} onPress={() => setServiceId(s.id)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.strong}>{s.name}</Text>
                  <Body muted style={{ fontSize: 13 }}>{s.duration}</Body>
                </View>
                <Text style={styles.strong}>{inr(s.price)}</Text>
              </View>
            </Choice>
          ))}
        </View>

        <View style={{ gap: 10 }}>
          <Label>2 · PICK A DATE</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d, i) => {
              const on = i === dayIdx;
              return (
                <Pressable key={d.key} onPress={() => setDayIdx(i)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                  accessibilityLabel={d.date.toDateString()} style={[styles.day, on ? styles.dayOn : null]}>
                  <Text style={[styles.dayW, on && { color: '#fff' }]}>{d.weekday}</Text>
                  <Text style={[styles.dayN, on && { color: '#fff' }]}>{d.day}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ gap: 10 }}>
          <Label>3 · PICK A TIME</Label>
          <View style={styles.slots}>
            {SLOTS.map((t) => {
              const booked = BOOKED.has(t);
              const on = slot === t;
              return (
                <Pressable key={t} disabled={booked} onPress={() => setSlot(t)} accessibilityRole="radio"
                  accessibilityState={{ checked: on, disabled: booked }} accessibilityLabel={booked ? `${t}, fully booked` : t}
                  style={[styles.slot, on && styles.slotOn, booked && styles.slotBooked]}>
                  <Text style={[styles.slotText, on && { color: colors.roseDeep }, booked && { color: '#9C8A95', textDecorationLine: 'line-through' }]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Field label="Notes for the artist (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Skin type, nail length, design ideas…" />
      </ScrollView>

      <View style={styles.bar}>
        <View style={{ flex: 1 }}>
          <Body muted style={{ fontSize: 12 }}>{service ? (slot ? `${service.name} · ${day.weekday} ${day.day}, ${slot}` : `${service.name} · pick a time`) : 'Choose a service'}</Body>
          <Text style={styles.total}>{service ? inr(service.price) : '₹0'}</Text>
        </View>
        <Button title="Continue to pay" disabled={!ready} onPress={toPay} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  strong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  day: { width: 56, height: 68, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayW: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink },
  dayN: { fontFamily: fonts.bodyBold, fontSize: 19, color: colors.ink },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '31.5%', height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  slotOn: { borderWidth: 2, borderColor: colors.rose, backgroundColor: colors.blush },
  slotBooked: { borderStyle: 'dashed', borderColor: colors.lineStrong, backgroundColor: 'transparent' },
  slotText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
});
