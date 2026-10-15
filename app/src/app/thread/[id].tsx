import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatView } from '@/components/ChatView';
import { BackHeader } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

/** Admin view of one customer's chat. */
export default function Thread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions, customers } = useStore();
  const customer = customers[id];
  if (!customer) return null;
  const phone = `${customer.phone.slice(0, 5)} ${customer.phone.slice(5)}`;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.adminBg }}>
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <BackHeader title={customer.name} />
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginLeft: 58, marginTop: -8, marginBottom: 8 }}>+91 {phone}</Text>
      </View>
      <ChatView
        messages={state.threads[id] ?? []}
        viewerIsCustomer={false}
        otherName={customer.name.split(' ')[0]}
        placeholder="Reply or send a photo…"
        onSend={(text, uri) => actions.sendMessage(id, false, text, uri)}
      />
    </SafeAreaView>
  );
}
