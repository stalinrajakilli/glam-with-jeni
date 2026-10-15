import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, EmptyState, H1, Pill, Screen, Segmented } from '@/components/ui';
import { inr } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function History() {
  const { state } = useStore();
  const [tab, setTab] = useState<'appts' | 'orders'>('appts');
  const me = state.session?.customerId;
  const appts = state.appointments.filter((a) => a.customerId === me);
  const orders = state.orders.filter((o) => o.customerId === me);

  return (
    <Screen>
      <H1>My history</H1>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'appts', label: 'Appointments' }, { value: 'orders', label: 'Orders' }]} />
      {tab === 'appts' && (appts.length === 0 ? <EmptyState text="No appointments yet." /> : appts.map((a) => (
        <Card key={a.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink }}>{a.title}</Text>
              <Body muted style={{ fontSize: 14 }}>{a.when}</Body>
            </View>
            <Pill text={a.status} tone={a.status === 'Completed' ? 'grey' : 'green'} />
          </View>
          {a.status === 'Completed' && (
            <Button title="Rate this visit" variant="secondary" small style={{ alignSelf: 'flex-start' }} onPress={() => router.push({ pathname: '/chat', params: { tab: 'feedback' } })} />
          )}
        </Card>
      )))}
      {tab === 'orders' && (orders.length === 0 ? <EmptyState text="No orders yet." /> : orders.map((o) => (
        <Card key={o.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink }}>Order {o.id}</Text>
            <Pill text={o.status === 'Paid' ? 'Paid · packing' : o.status} tone={o.status === 'Delivered' ? 'grey' : 'green'} />
          </View>
          <Body style={{ color: colors.mutedStrong, fontSize: 14 }}>{o.items}</Body>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Body muted style={{ fontSize: 13 }}>{o.date}</Body>
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.ink }}>{inr(o.total)}</Text>
          </View>
        </Card>
      )))}
    </Screen>
  );
}
