import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppIcon, Body, Button, Logo, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Login() {
  const { actions } = useStore();
  const [phone, setPhone] = useState('');
  const valid = phone.length === 10;

  const sendOtp = () => {
    actions.requestOtp(phone);
    router.push('/otp');
  };

  return (
    <Screen contentStyle={{ paddingTop: 48, paddingHorizontal: 28, gap: 26 }}>
      <View style={{ gap: 14 }}>
        <AppIcon />
        <Logo />
        <Body muted style={{ fontSize: 16 }}>Makeup, nail art and press-on nails. Log in with your mobile number to book and order.</Body>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.label}>Mobile number</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.cc}>+91</Text>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
            keyboardType="number-pad" textContentType="telephoneNumber" autoComplete="tel"
            placeholder="98765 43210" placeholderTextColor="#9C8A95" accessibilityLabel="Mobile number"
            style={styles.phoneInput}
          />
        </View>
        <Body muted style={{ fontSize: 13 }}>We'll text you a one-time code.</Body>
      </View>

      <Button title="Send OTP" onPress={sendOtp} disabled={!valid} />

      <Body muted style={{ fontSize: 12, textAlign: 'center' }}>
        By continuing you agree to receive booking updates and offers on WhatsApp. You can opt out anytime.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  phoneRow: { flexDirection: 'row', alignItems: 'center', height: 56, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, backgroundColor: colors.surface, overflow: 'hidden' },
  cc: { paddingHorizontal: 14, fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink, borderRightWidth: 1, borderRightColor: colors.line, height: '100%', textAlignVertical: 'center', lineHeight: 54 },
  phoneInput: { flex: 1, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 17, color: colors.ink },
});
