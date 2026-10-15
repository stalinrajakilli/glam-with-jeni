import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} color={String(color)} />,
});

export default function AdminTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.adminBg },
      }}
    >
      <Tabs.Screen name="today" options={tab('Today', 'calendar')} />
      <Tabs.Screen name="orders" options={tab('Orders', 'bag')} />
      <Tabs.Screen name="broadcast" options={tab('Broadcast', 'megaphone')} />
      <Tabs.Screen name="manage-offers" options={tab('Offers', 'tag')} />
      <Tabs.Screen name="inbox" options={tab('Inbox', 'chat')} />
    </Tabs>
  );
}
