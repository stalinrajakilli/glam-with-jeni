import type { ReactNode } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, radius } from '@/theme';
import { Icon } from './Icon';

export function Screen({ children, scroll = true, bg = colors.bg, edges = ['top'], contentStyle }: {
  children: ReactNode; scroll?: boolean; bg?: string; edges?: Edge[]; contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.scroll, contentStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Logo({ size = 84, color = colors.rose, kicker = colors.plum }: { size?: number; color?: string; kicker?: string }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="GlamWithJeni">
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: size / 6, letterSpacing: size / 12, color: kicker }}>GLAM WITH</Text>
      <Text style={{ fontFamily: fonts.script, fontSize: size, lineHeight: size * 1.1, color, marginTop: -size / 14 }}>Jeni</Text>
    </View>
  );
}

export function AppIcon({ size = 64 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 4, backgroundColor: colors.plum, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.script, fontSize: size * 0.88, color: '#fff', lineHeight: size, marginTop: size * 0.12 }}>J</Text>
    </View>
  );
}

export const H1 = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text accessibilityRole="header" style={[styles.h1, style]}>{children}</Text>
);
export const H2 = ({ children }: { children: ReactNode }) => <Text accessibilityRole="header" style={styles.h2}>{children}</Text>;
export const Label = ({ children }: { children: ReactNode }) => <Text style={styles.label}>{children}</Text>;
export const Body = ({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.body, muted && { color: colors.muted }, style]}>{children}</Text>
);

type ButtonProps = {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'dark' | 'green' | 'danger';
  disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
};
export function Button({ title, onPress, variant = 'primary', disabled, small, style, accessibilityLabel }: ButtonProps) {
  const v = disabled ? styles.btnDisabled : styles[`btn_${variant}`];
  const t = disabled ? { color: colors.disabledText } : variant === 'secondary' ? { color: colors.ink } : { color: '#fff' };
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.btn, small && styles.btnSmall, v, pressed && !disabled && { opacity: 0.85 }, style]}
    >
      <Text style={[styles.btnText, small && { fontSize: 13 }, t]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, color = colors.ink, bg = 'transparent', size = 44 }: {
  icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void; color?: string; bg?: string; size?: number;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} color={color} size={size * 0.5} />
    </Pressable>
  );
}

export function BackHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.backHeader}>
      <IconButton icon="back" label="Back" onPress={onBack ?? (() => router.back())} />
      <Text accessibilityRole="header" style={styles.backTitle}>{title}</Text>
    </View>
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[styles.card, style]}>{children}</View>;

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View style={styles.segment} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={[styles.segItem, on && styles.segOn]}>
            <Text style={[styles.segText, { color: on ? colors.ink : colors.mutedStrong }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, style, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor="#9C8A95" style={[styles.input, input.multiline && { height: 96, paddingTop: 12, textAlignVertical: 'top' }, style]} {...input} />
    </View>
  );
}

export function Pill({ text, tone }: { text: string; tone: 'green' | 'grey' | 'amber' | 'rose' }) {
  const map = {
    green: { bg: colors.greenBg, fg: colors.green },
    grey: { bg: '#F1ECEF', fg: colors.mutedStrong },
    amber: { bg: colors.amberBg, fg: colors.amber },
    rose: { bg: colors.blush, fg: colors.roseDeep },
  }[tone];
  return <Text style={[styles.pill, { backgroundColor: map.bg, color: map.fg }]}>{text}</Text>;
}

export function Choice({ selected, onPress, children, style }: { selected: boolean; onPress: () => void; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={[styles.choice, selected ? styles.choiceOn : null, style]}>
      <View style={[styles.dot, selected && styles.dotOn]} />
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

export const EmptyState = ({ text }: { text: string }) => (
  <View style={styles.empty}><Text style={[styles.body, { color: colors.muted, textAlign: 'center' }]}>{text}</Text></View>
);

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 32, gap: 20 },
  h1: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  h2: { fontFamily: fonts.displaySemi, fontSize: 19, color: colors.ink },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4, color: colors.mutedStrong },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  btn: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnSmall: { height: 40, borderRadius: radius.sm, paddingHorizontal: 14 },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 15 },
  btn_primary: { backgroundColor: colors.rose },
  btn_secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong },
  btn_dark: { backgroundColor: colors.ink },
  btn_green: { backgroundColor: colors.green },
  btn_danger: { backgroundColor: colors.danger },
  btnDisabled: { backgroundColor: colors.disabledBg },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6 },
  backTitle: { fontFamily: fonts.displaySemi, fontSize: 21, color: colors.ink },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 8 },
  segment: { flexDirection: 'row', backgroundColor: colors.segment, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.surface, shadowColor: colors.ink, shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontFamily: fonts.bodyBold, fontSize: 14 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedStrong },
  input: { height: 48, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 12, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.ink, backgroundColor: colors.surface },
  pill: { fontFamily: fonts.bodyBold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
  choiceOn: { borderColor: colors.rose, backgroundColor: colors.blush },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#B9A6B0', backgroundColor: '#fff' },
  dotOn: { borderWidth: 6, borderColor: colors.rose },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lineStrong, borderRadius: radius.lg, padding: 18 },
});
