import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/theme';

export function AdminHeader({ title }: { title: string }) {
  const { actions } = useStore();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.ink }}>
      <View style={styles.bar}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessible accessibilityLabel="GlamWithJeni admin">
            <Text style={styles.kicker}>GLAM WITH</Text>
            <Text style={styles.script}>Jeni</Text>
            <Text style={styles.badge}>ADMIN</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
        <Pressable onPress={actions.signOut} accessibilityRole="button" style={styles.logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 3, color: '#D9C2D4' },
  script: { fontFamily: fonts.script, fontSize: 28, lineHeight: 30, color: '#F2C4D3' },
  badge: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, color: colors.ink, backgroundColor: '#D9C2D4', borderRadius: 6, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  title: { fontFamily: fonts.display, fontSize: 22, color: '#fff' },
  logout: { height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: '#6B5468', borderRadius: 10, justifyContent: 'center' },
  logoutText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' },
});
