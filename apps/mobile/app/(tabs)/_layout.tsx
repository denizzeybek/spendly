import { Tabs, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeftRight, PlusCircle, PieChart, Settings } from 'lucide-react-native';
import { useThemeStore, useAuthStore } from '../../src/store';
import { colors } from '../../src/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isDark = colorMode === 'dark';
  const bgColor = isDark ? '#171717' : '#FFFFFF';
  const textColor = isDark ? '#FAFAFA' : '#171717';
  const inactiveColor = isDark ? '#737373' : '#A3A3A3';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: isDark ? '#262626' : '#E5E5E5',
        },
        headerStyle: {
          backgroundColor: bgColor,
        },
        headerTintColor: textColor,
        sceneStyle: {
          backgroundColor: isDark ? '#0A0A0A' : '#FAFAFA',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.title'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('transactions.title'),
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('transactions.add'),
          tabBarIcon: ({ size }) => <PlusCircle size={size + 8} color={colors.primary} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('reports.title'),
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
