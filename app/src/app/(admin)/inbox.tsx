import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AdminHeader } from '@/components/AdminHeader';
import { Body, Button, Card, Segmented } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export default function Inbox() {
  const { state, actions, customers } = useStore();
  const [tab, setTab] = useState<'chats' | 'feedback'>('chats');

  const open = (customerId: string) => {
    actions.markSeen(customerId);
    router.push({ pathname: '/thread/[id]', params: { id: customerId } });
  };

  const chats = Object.entries(state.threads).map(([id, list]) => {
    const last = list[list.length - 1];
    const unread = !!last && last.fromCustomer && (state.seen[id] ?? 0) < list.length;
    const body = !last ? 'No messages yet' : last.imageUri ? (last.text ? `Photo · ${last.text}` : 'Photo') : last.text ?? '';
    return { id, name: customers[id]?.name ?? 'Customer', time: last?.at ?? '', unread, preview: last && !last.fromCustomer ? `You: ${body}` : body };
  });

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Inbox" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'chats', label: 'Chats' }, { value: 'feedback', label: 'Feedback' }]} />
        {tab === 'chats' && chats.map((c) => (
          <Pressable key={c.id} onPress={() => open(c.id)} accessibilityRole="button" accessibilityLabel={`Chat with ${c.name}${c.unread ? ', unread' : ''}`} style={styles.chat}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{c.name[0]}</Text></View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.strong}>{c.name}</Text>
                <Body muted style={{ fontSize: 12 }}>{c.time}</Body>
              </View>
              <Text numberOfLines={1} style={[styles.preview, c.unread && { color: colors.ink, fontFamily: fonts.bodyBold }]}>{c.preview}</Text>
            </View>
            {c.unread && <View style={styles.dot} />}
          </Pressable>
        ))}
        {tab === 'feedback' && state.feedback.map((f) => (
          <Card key={f.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.strong}>{customers[f.customerId]?.name ?? 'Customer'}</Text>
              <Text accessibilityLabel={`${f.stars} out of 5 stars`} style={{ color: colors.roseDeep, fontFamily: fonts.bodyBold, letterSpacing: 1 }}>{'★'.repeat(f.stars)}{'☆'.repeat(5 - f.stars)}</Text>
            </View>
            {!!f.text && <Body style={{ fontSize: 14 }}>{f.text}</Body>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Body muted style={{ fontSize: 12 }}>{f.at}</Body>
              <Button small variant="secondary" title="Reply in chat" onPress={() => open(f.customerId)} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chat: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 12, paddingHorizontal: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blushLine, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bodyBold, color: colors.plum, fontSize: 16 },
  strong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  preview: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.rose },
});
