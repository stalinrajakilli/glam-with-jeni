import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AdminHeader } from '@/components/AdminHeader';
import { Icon } from '@/components/Icon';
import { Body, Button, Field, H1, IconButton, Label } from '@/components/ui';
import { pickImage } from '@/lib/pickImage';
import { colors, fonts } from '@/theme';

const AUDIENCES = [
  { id: 'all', label: 'All customers', text: 'all opted-in customers' },
  { id: 'nails', label: 'Nail clients', text: 'nail clients' },
  { id: 'makeup', label: 'Makeup clients', text: 'makeup clients' },
  { id: 'lapsed', label: 'Not seen in 60 days', text: 'customers not seen in 60 days' },
];
const TEMPLATES = [
  { id: 'festive', label: 'Festive sale', msg: 'Diwali glow is here! Get 20% off party makeup and bridal trials booked before 7 Nov. Use code DIWALI20 in the GlamWithJeni app.' },
  { id: 'drop', label: 'New press-on drop', msg: 'New press-on sets just dropped: Lilac Daisy and Gold Leaf. Buy any two and get 15% off with code PRESS15.' },
  { id: 'slots', label: 'Open slots', msg: 'A few slots just opened up this weekend for nail art and gel extensions. Book yours in the app before they go!' },
];

export default function Broadcast() {
  const params = useLocalSearchParams<{ message?: string }>();
  const [audience, setAudience] = useState('all');
  const [template, setTemplate] = useState<string | null>('festive');
  const [message, setMessage] = useState(TEMPLATES[0].msg);
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const audienceText = AUDIENCES.find((a) => a.id === audience)!.text;

  // Prefilled from "Announce on WhatsApp" on the Offers screen.
  useEffect(() => {
    if (params.message) { setMessage(params.message); setTemplate(null); setSent(false); }
  }, [params.message]);

  const addImage = async () => {
    const r = await pickImage(5); // WhatsApp's image limit
    if (r.error) setError(r.error);
    if (r.image) { setImage(r.image.uri); setError(''); }
  };

  // Production: call the `send-broadcast` Edge Function (supabase/functions/send-broadcast),
  // which uploads the image to WhatsApp and sends the approved template to each opted-in customer.
  const send = () => setSent(true);

  if (sent) {
    return (
      <View style={{ flex: 1 }}>
        <AdminHeader title="WhatsApp broadcast" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" color={colors.green} size={36} />
          </View>
          <H1>Broadcast queued</H1>
          <Body muted style={{ textAlign: 'center' }}>Sending {image ? 'your image and message' : 'your message'} to {audienceText}. Delivery and read counts will show here.</Body>
          <Button title="New broadcast" variant="secondary" onPress={() => { setSent(false); setImage(undefined); }} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="WhatsApp broadcast" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 10 }}>
          <Label>SEND TO</Label>
          <View style={styles.wrap}>
            {AUDIENCES.map((a) => (
              <Pressable key={a.id} onPress={() => setAudience(a.id)} accessibilityRole="radio" accessibilityState={{ checked: audience === a.id }}
                style={[styles.chip, audience === a.id && styles.chipOn]}>
                <Text style={[styles.chipText, audience === a.id && { color: '#fff' }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Label>START FROM A TEMPLATE</Label>
          <View style={styles.wrap}>
            {TEMPLATES.map((t) => (
              <Pressable key={t.id} onPress={() => { setTemplate(t.id); setMessage(t.msg); }} accessibilityRole="button" accessibilityState={{ selected: template === t.id }}
                style={[styles.tpl, template === t.id && styles.tplOn]}>
                <Text style={[styles.chipText, template === t.id && { color: colors.roseDeep }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Field label="Message" value={message} onChangeText={setMessage} multiline style={{ height: 120 }} />

        <View style={{ gap: 8 }}>
          <Label>IMAGE (OPTIONAL)</Label>
          {image ? (
            <View style={styles.imgRow}>
              <Image source={{ uri: image }} style={{ width: 64, height: 64, borderRadius: 10 }} accessibilityLabel="Selected broadcast image" />
              <Body style={{ flex: 1, fontSize: 13 }}>Image attached</Body>
              <Button small variant="secondary" title="Change" onPress={addImage} />
              <IconButton icon="trash" label="Remove image" color={colors.danger} onPress={() => setImage(undefined)} />
            </View>
          ) : (
            <Pressable onPress={addImage} accessibilityRole="button" style={styles.drop}>
              <Icon name="image" color={colors.mutedStrong} />
              <Text style={[styles.chipText, { fontSize: 14 }]}>Add a photo or offer poster</Text>
            </Pressable>
          )}
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Body muted style={{ fontSize: 12 }}>JPG or PNG, up to 5 MB. Square images look best in WhatsApp.</Body>
        </View>

        <View style={{ gap: 8 }}>
          <Label>PREVIEW ON WHATSAPP</Label>
          <View style={styles.waBg}>
            <View style={styles.waBubble}>
              {image && <Image source={{ uri: image }} style={{ width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />}
              <Body style={{ fontSize: 14 }}>{message}</Body>
              <Text style={styles.waCta}>Open the app</Text>
            </View>
          </View>
          <Body muted style={{ fontSize: 12 }}>Only customers who opted in get this. Marketing messages must use a template approved in your WhatsApp Business account; an image-header template lets you attach a new picture each time.</Body>
        </View>
      </ScrollView>
      <View style={styles.bar}>
        <Button variant="green" title={`Send to ${audienceText}`} disabled={!message.trim()} onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  tpl: { height: 40, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, justifyContent: 'center' },
  tplOn: { borderWidth: 2, borderColor: colors.rose, backgroundColor: colors.blush },
  drop: { height: 96, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B9A6B0', borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  imgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 10 },
  error: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.danger },
  waBg: { backgroundColor: '#ECE5DD', borderRadius: 16, padding: 14 },
  waBubble: { maxWidth: '88%', backgroundColor: '#fff', borderRadius: 14, borderTopLeftRadius: 4, padding: 10, gap: 8 },
  waCta: { borderTopWidth: 1, borderTopColor: '#EEE7EA', paddingTop: 8, textAlign: 'center', color: '#1F6FB2', fontFamily: fonts.bodyBold, fontSize: 14 },
  bar: { padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
});
