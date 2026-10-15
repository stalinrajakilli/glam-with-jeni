import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/Icon';
import { NailSet } from '@/components/NailSet';
import { Body, Button, EmptyState, H2, Screen } from '@/components/ui';
import { PRODUCTS, inr } from '@/data/catalog';
import { offerLabel, useStore } from '@/lib/store';
import { colors, fonts, radius } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
}

export default function Home() {
  const { state, actions, customers } = useStore();
  const me = customers[state.session?.customerId ?? 'priya'];
  const offers = state.offers.filter((o) => o.active);
  const next = state.appointments.find((a) => a.customerId === me.id && a.status !== 'Completed');

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Body muted style={{ fontSize: 14 }}>{greeting()}</Body>
          <Text style={styles.name}>{me.name.split(' ')[0]}</Text>
        </View>
        <Button title="Log out" variant="secondary" small onPress={actions.signOut} />
      </View>

      {next && (
        <View style={styles.next}>
          <Text style={styles.nextKicker}>YOUR NEXT APPOINTMENT</Text>
          <Text style={styles.nextTitle}>{next.title}</Text>
          <Text style={styles.nextWhen}>{next.when}</Text>
          <Pressable onPress={() => router.push('/history')} accessibilityRole="button" style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>View details</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <QuickAction icon="calendar" title="Book appointment" sub="Makeup & nails" onPress={() => router.push('/book')} />
        <QuickAction icon="bag" title="Shop press-ons" sub="Delivered home" onPress={() => router.push('/shop')} />
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHead}>
          <H2>Offers for you</H2>
          <Pressable onPress={() => router.push('/offers')} accessibilityRole="link" hitSlop={10}><Text style={styles.link}>See all</Text></Pressable>
        </View>
        {offers.length === 0 ? (
          <EmptyState text="No offers right now. We'll message you on WhatsApp when the next one goes live." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} style={{ marginHorizontal: -20 }} contentInset={{ left: 20, right: 20 }}>
            <View style={{ width: 8 }} />
            {offers.map((o) => (
              <View key={o.id} style={styles.offer}>
                <Text style={styles.offerBig}>{offerLabel(o)}</Text>
                <Text style={styles.offerTitle}>{o.title}</Text>
                <Body muted style={{ fontSize: 13, lineHeight: 18 }}>{o.details}</Body>
                <Text style={styles.code}>{o.code}</Text>
              </View>
            ))}
            <View style={{ width: 8 }} />
          </ScrollView>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHead}>
          <H2>New press-on drops</H2>
          <Pressable onPress={() => router.push('/shop')} accessibilityRole="link" hitSlop={10}><Text style={styles.link}>Shop</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {PRODUCTS.slice(0, 2).map((p) => (
            <Pressable key={p.id} onPress={() => router.push('/shop')} style={[styles.quick, { padding: 10 }]} accessibilityRole="button" accessibilityLabel={`${p.name}, ${inr(p.price)}`}>
              <NailSet colors={p.colors} height={96} />
              <Text style={styles.quickTitle}>{p.name}</Text>
              <Body muted style={{ fontSize: 13 }}>{inr(p.price)}</Body>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function QuickAction({ icon, title, sub, onPress }: { icon: 'calendar' | 'bag'; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quick} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.quickIcon}><Icon name={icon} color={colors.rose} size={22} /></View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Body muted style={{ fontSize: 13 }}>{sub}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  next: { backgroundColor: colors.plum, borderRadius: radius.xl, padding: 18, gap: 4 },
  nextKicker: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.4, color: '#EBD5E0' },
  nextTitle: { fontFamily: fonts.displaySemi, fontSize: 21, color: '#fff', marginTop: 6 },
  nextWhen: { fontFamily: fonts.body, fontSize: 14, color: '#EBD5E0' },
  nextBtn: { alignSelf: 'flex-start', marginTop: 10, height: 40, paddingHorizontal: 16, borderWidth: 1, borderColor: '#A783A6', borderRadius: 12, justifyContent: 'center' },
  nextBtnText: { fontFamily: fonts.bodySemi, fontSize: 14, color: '#fff' },
  quick: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 6 },
  quickIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.rose },
  offer: { width: 240, backgroundColor: colors.blush, borderRadius: radius.lg, padding: 16, gap: 6 },
  offerBig: { fontFamily: fonts.display, fontSize: 22, color: colors.roseDeep },
  offerTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  code: { alignSelf: 'flex-start', marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.rose, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.roseDeep, letterSpacing: 0.5 },
});
