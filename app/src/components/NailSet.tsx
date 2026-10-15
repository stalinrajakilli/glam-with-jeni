import { View } from 'react-native';
import type { Product } from '@/data/catalog';

/** Simple illustration of a press-on set until real product photos are added. */
export function NailSet({ colors: c, height = 104 }: { colors: Product['colors']; height?: number }) {
  const nail = (h: number, w: number, bg: string) => (
    <View style={{ width: w, height: h, backgroundColor: bg, borderWidth: 1, borderColor: c.edge, borderTopLeftRadius: w / 2, borderTopRightRadius: w / 2, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
  );
  return (
    <View accessible accessibilityLabel="Press-on nail set illustration"
      style={{ height, borderRadius: 12, backgroundColor: c.bg, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingBottom: 14 }}>
      {nail(height * 0.5, 22, c.nail)}
      {nail(height * 0.6, 24, c.accent)}
      {nail(height * 0.5, 22, c.nail)}
    </View>
  );
}
