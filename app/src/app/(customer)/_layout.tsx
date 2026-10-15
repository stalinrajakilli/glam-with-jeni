import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} color={String(color)} />,
});

export default function CustomerTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={tab('Home', 'home')} />
      <Tabs.Screen name="book" options={tab('Book', 'calendar')} />
      <Tabs.Screen name="shop" options={tab('Shop', 'bag')} />
      <Tabs.Screen name="history" options={tab('History', 'clock')} />
      <Tabs.Screen name="chat" options={tab('Chat', 'chat')} />
    </Tabs>
  );
}
