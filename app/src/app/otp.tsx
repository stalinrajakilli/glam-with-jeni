import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { BackHeader, Body, Button, H1, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Otp() {
  const { state, actions } = useStore();
  const [code, setCode] = useState('');
  const phone = state.pendingPhone;

  return (
    <Screen contentStyle={{ paddingHorizontal: 28, gap: 22 }}>
      <View style={{ marginLeft: -20 }}><BackHeader title="" /></View>
      <View style={{ gap: 8 }}>
        <H1 style={{ fontSize: 30 }}>Enter code</H1>
        <Body muted>Sent by SMS to +91 {phone.slice(0, 5)} {phone.slice(5)}</Body>
      </View>
      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" autoFocus
        placeholder="••••••" placeholderTextColor="#9C8A95" accessibilityLabel="6-digit code"
        style={{ height: 60, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, backgroundColor: colors.surface, paddingHorizontal: 18, fontSize: 26, letterSpacing: 14, fontFamily: fonts.bodySemi, color: colors.ink }}
      />
      <Body muted style={{ fontSize: 13 }}>Starter build: any 6 digits work. Supabase phone auth sends a real code.</Body>
      {/* Stack.Protected in _layout moves the user to the right home screen once the session exists. */}
      <Button title="Verify & continue" disabled={code.length !== 6} onPress={() => actions.verifyOtp(code)} />
    </Screen>
  );
}
