import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatView } from '@/components/ChatView';
import { Icon } from '@/components/Icon';
import { Body, Button, Field, H1, Screen, Segmented } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors } from '@/theme';

export default function Chat() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { state, actions } = useStore();
  const [tab, setTab] = useState<'messages' | 'feedback'>(params.tab === 'feedback' ? 'feedback' : 'messages');
  useEffect(() => { if (params.tab === 'feedback') setTab('feedback'); }, [params.tab]);
  const me = state.session?.customerId ?? 'priya';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 20, paddingBottom: 12, gap: 14, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <H1>Talk to us</H1>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'messages', label: 'Messages' }, { value: 'feedback', label: 'Feedback' }]} />
      </View>
      {tab === 'messages' ? (
        <ChatView
          messages={state.threads[me] ?? []}
          viewerIsCustomer
          otherName="Jeni"
          placeholder="Message or photo for Jeni…"
          onSend={(text, uri) => actions.sendMessage(me, true, text, uri)}
        />
      ) : (
        <FeedbackForm onSubmit={actions.submitFeedback} />
      )}
    </SafeAreaView>
  );
}

function FeedbackForm({ onSubmit }: { onSubmit: (stars: number, text: string) => void }) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <Screen edges={[]} contentStyle={{ alignItems: 'center', paddingTop: 48 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" color={colors.green} size={36} />
        </View>
        <H1>Thank you!</H1>
        <Body muted style={{ textAlign: 'center' }}>Your feedback goes straight to Jeni. She reads every note.</Body>
      </Screen>
    );
  }
  return (
    <Screen edges={[]}>
      <Body style={{ fontSize: 17, fontWeight: '700' }}>How was your last visit?</Body>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => setStars(i)} accessibilityRole="radio" accessibilityState={{ checked: stars === i }}
            accessibilityLabel={`${i} ${i === 1 ? 'star' : 'stars'}`} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={34} color={i <= stars ? colors.rose : '#B9A6B0'} fill={i <= stars ? colors.rose : 'none'} strokeWidth={1.6} />
          </Pressable>
        ))}
      </View>
      <Field label="Tell us more (optional)" value={text} onChangeText={setText} multiline placeholder="What did you love? What could be better?" />
      <Button title="Submit feedback" disabled={stars === 0} onPress={() => { onSubmit(stars, text.trim()); setSent(true); }} />
    </Screen>
  );
}
