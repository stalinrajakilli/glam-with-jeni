import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { Body, Button, Label } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

// Sample day. In production: select from bookings where date = today, joined with profiles.
const TODAY = [
  { id: 't1', time: '11:30 AM', dur: '45 min', name: 'Ananya K.', service: 'Gel manicure', paid: 'Paid' },
  { id: 't2', time: '1:00 PM', dur: '90 min', name: 'Meera S.', service: 'Gel extensions', paid: 'Paid' },
  { id: 't3', time: '4:00 PM', dur: '90 min', name: 'Riya P.', service: 'Party makeup', paid: 'Pay at studio' },
  { id: 't4', time: '5:30 PM', dur: '60 min', name: 'Sneha D.', service: 'Nail art (full set)', paid: 'Paid' },
];

export default function Today() {
  const { state } = useStore();
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const toShip = state.orders.filter((o) => o.status === 'Paid').length;
  const live = state.offers.filter((o) => o.active).length;

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Today" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat n={TODAY.length} label="Bookings today" />
          <Stat n={toShip} label="Orders to ship" />
          <Stat n={live} label="Offers live" />
        </View>
        <Label>TODAY'S APPOINTMENTS</Label>
        {TODAY.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={{ width: 66 }}>
              <Text style={styles.strong}>{a.time}</Text>
              <Body muted style={{ fontSize: 12 }}>{a.dur}</Body>
            </View>
            <View style={styles.mid}>
              <Text style={styles.strong}>{a.name}</Text>
              <Body muted style={{ fontSize: 13 }}>{a.service} · {a.paid}</Body>
            </View>
            {/* Production: Edge Function sends the approved "appointment_reminder" WhatsApp template. */}
            <Button small variant={reminded[a.id] ? 'secondary' : 'green'} title={reminded[a.id] ? 'Reminded' : 'Remind'}
              disabled={reminded[a.id]} onPress={() => setReminded({ ...reminded, [a.id]: true })} accessibilityLabel={`Send WhatsApp reminder to ${a.name}`} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>{n}</Text>
      <Body muted style={{ fontSize: 12, lineHeight: 16 }}>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 12, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 14 },
  mid: { flex: 1, borderLeftWidth: 1, borderLeftColor: colors.line, paddingLeft: 12, gap: 2 },
  strong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
});
