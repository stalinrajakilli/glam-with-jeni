import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Message } from '@/lib/store';
import { pickImage } from '@/lib/pickImage';
import { colors, fonts } from '@/theme';
import { Icon } from './Icon';
import { IconButton } from './ui';

type Props = {
  messages: Message[];
  /** true when the person using this screen is the customer */
  viewerIsCustomer: boolean;
  otherName: string;
  placeholder: string;
  onSend: (text: string, imageUri?: string) => void;
};

/** Shared chat thread with photo attachments, used by customers and by the admin inbox. */
export function ChatView({ messages, viewerIsCustomer, otherName, placeholder, onSend }: Props) {
  const [draft, setDraft] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<string | undefined>();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  const attach = async () => {
    const r = await pickImage(10);
    if (r.error) setError(r.error);
    if (r.image) { setPhoto(r.image.uri); setError(''); }
  };
  const send = () => {
    const text = draft.trim();
    if (!text && !photo) return;
    onSend(text, photo);
    setDraft(''); setPhoto(undefined); setError('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
        {messages.length === 0 && <Text style={styles.empty}>No messages yet. Say hello or send a photo.</Text>}
        {messages.map((m) => {
          const mine = viewerIsCustomer ? m.fromCustomer : !m.fromCustomer;
          return (
            <View key={m.id} style={[styles.row, { alignSelf: mine ? 'flex-end' : 'flex-start', alignItems: mine ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs, m.imageUri ? { padding: 4 } : null]}>
                {m.imageUri && (
                  <Pressable onPress={() => setViewing(m.imageUri)} accessibilityRole="imagebutton" accessibilityLabel="View photo full screen">
                    <Image source={{ uri: m.imageUri }} style={styles.photo} accessibilityIgnoresInvertColors />
                  </Pressable>
                )}
                {!!m.text && <Text style={[styles.text, { color: mine ? '#fff' : colors.ink }, m.imageUri ? { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 4 } : null]}>{m.text}</Text>}
              </View>
              <Text style={styles.meta}>{mine ? 'You' : otherName} · {m.at}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        {photo && (
          <View style={styles.pending}>
            <Image source={{ uri: photo }} style={styles.thumb} accessibilityLabel="Photo ready to send" />
            <Text style={styles.pendingText}>Photo attached. Add a note or tap send.</Text>
            <IconButton icon="close" label="Remove photo" color={colors.danger} onPress={() => setPhoto(undefined)} />
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.inputRow}>
          <IconButton icon="image" label="Attach a photo" bg={colors.segment} color={colors.plum} size={46} onPress={attach} />
          <TextInput
            value={draft} onChangeText={setDraft} placeholder={placeholder} placeholderTextColor="#9C8A95"
            accessibilityLabel="Type a message" style={styles.input} onSubmitEditing={send} returnKeyType="send"
          />
          <Pressable onPress={send} accessibilityRole="button" accessibilityLabel="Send" style={styles.send}>
            <Icon name="send" color="#fff" size={20} />
          </Pressable>
        </View>
      </View>

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(undefined)}>
        <SafeAreaView style={styles.viewer}>
          <View style={{ alignItems: 'flex-end', padding: 12 }}>
            <IconButton icon="close" label="Close photo" color="#fff" bg="rgba(255,255,255,0.14)" onPress={() => setViewing(undefined)} />
          </View>
          {viewing && <Image source={{ uri: viewing }} style={{ flex: 1, margin: 16 }} resizeMode="contain" accessibilityLabel="Photo shared in chat" />}
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { margin: 'auto', textAlign: 'center', color: colors.muted, fontFamily: fonts.body, fontSize: 14, padding: 24 },
  row: { maxWidth: '80%', gap: 4 },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  mine: { backgroundColor: colors.plum, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 4 },
  text: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  photo: { width: 220, height: 220, borderRadius: 14 },
  meta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, paddingHorizontal: 4 },
  composer: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 10 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  pendingText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedStrong },
  error: { paddingHorizontal: 14, paddingTop: 8, fontFamily: fonts.bodySemi, fontSize: 13, color: colors.danger },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  input: { flex: 1, height: 46, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 23, paddingHorizontal: 16, fontFamily: fonts.body, fontSize: 15, backgroundColor: colors.bg, color: colors.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  viewer: { flex: 1, backgroundColor: 'rgba(20,12,22,0.94)' },
});
