import { Allura_400Regular } from '@expo-google-fonts/allura';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '@/lib/store';
import { colors } from '@/theme';

function RootNavigator() {
  const { state } = useStore();
  const role = state.session?.role;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {/* Signed out: phone number + OTP */}
      <Stack.Protected guard={!role}>
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
      </Stack.Protected>

      {/* Customers */}
      <Stack.Protected guard={role === 'customer'}>
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="offers" />
        <Stack.Screen name="pay" />
        <Stack.Screen name="success" options={{ gestureEnabled: false }} />
      </Stack.Protected>

      {/* Jeni (admin). The server enforces this too: see supabase/schema.sql */}
      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="thread/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Allura_400Regular, Outfit_600SemiBold, Outfit_700Bold, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold,
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
