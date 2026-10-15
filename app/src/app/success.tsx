import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Body, Button, H1, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Success() {
  const { state } = useStore();
  const r = state.lastResult;
  if (!r) return null;
  return (
    <Screen scroll={false} edges={['top', 'bottom']} contentStyle={{ alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" color={colors.green} size={42} />
      </View>
      <H1 style={{ fontSize: 28, textAlign: 'center' }}>{r.heading}</H1>
      <Text style={{ fontFamily: fonts.body, fontSize: 16, textAlign: 'center', color: colors.ink }}>{r.title}</Text>
      <Body muted style={{ textAlign: 'center' }}>{r.detail}</Body>
      <Body muted style={{ fontSize: 13 }}>Confirmation sent on WhatsApp to +91 {state.session?.phone}</Body>
      <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 12 }}>
        <Button title="View in history" onPress={() => router.replace('/history')} />
        <Button title="Back to home" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
