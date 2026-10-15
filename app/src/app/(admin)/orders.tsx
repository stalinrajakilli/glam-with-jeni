import { ScrollView, Text, View } from 'react-native';
import { AdminHeader } from '@/components/AdminHeader';
import { Body, Button, Card, Pill } from '@/components/ui';
import { inr } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Orders() {
  const { state, actions, customers } = useStore();
  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Orders" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {state.orders.map((o) => (
          <Card key={o.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink }}>{o.id} · {customers[o.customerId]?.name ?? 'Customer'}</Text>
              <Pill text={o.status} tone={o.status === 'Paid' ? 'amber' : 'green'} />
            </View>
            <Body style={{ fontSize: 14, color: colors.mutedStrong }}>{o.items}</Body>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.ink }}>{inr(o.total)}</Text>
              {o.status === 'Paid' && <Button small variant="dark" title="Mark shipped" onPress={() => actions.shipOrder(o.id)} />}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
