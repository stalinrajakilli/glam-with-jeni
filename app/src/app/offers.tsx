import { useState } from 'react';
import { Text, View } from 'react-native';
import { BackHeader, Body, Button, Card, EmptyState, Screen } from '@/components/ui';
import { offerLabel, useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Offers() {
  const { state } = useStore();
  const [copied, setCopied] = useState<string | null>(null);
  const offers = state.offers.filter((o) => o.active);

  return (
    <Screen contentStyle={{ paddingTop: 4 }}>
      <View style={{ marginHorizontal: -16 }}><BackHeader title="Offers & discounts" /></View>
      <View style={{ gap: 14 }}>
        {offers.length === 0 && <EmptyState text="No offers right now. Check back soon." />}
        {offers.map((o) => (
          <Card key={o.id} style={{ padding: 18, gap: 10 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.roseDeep }}>{offerLabel(o)}</Text>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink }}>{o.title}</Text>
            <Body muted>{o.details}</Body>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1E6EB', paddingTop: 12 }}>
              <View>
                <Text style={{ fontFamily: fonts.bodyBold, letterSpacing: 0.6, color: colors.ink }}>{o.code}</Text>
                <Body muted style={{ fontSize: 12 }}>Valid till {o.validTill}</Body>
              </View>
              {/* For a real clipboard copy add expo-clipboard: Clipboard.setStringAsync(o.code) */}
              <Button title={copied === o.id ? 'Copied' : 'Copy code'} variant="secondary" small onPress={() => setCopied(o.id)} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
