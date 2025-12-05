import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { gluestackConfig } from '../src/constants/theme';
import { useThemeStore } from '../src/store';
import { OpenAPI } from '../src/client';
import '../src/locales/i18n';

// Configure API base URL from environment variable
OpenAPI.BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function RootLayout() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? '#0A0A0A' : '#FAFAFA';
  const headerBgColor = isDark ? '#171717' : '#FFFFFF';
  const headerTextColor = isDark ? '#FAFAFA' : '#171717';

  return (
    <GluestackUIProvider config={gluestackConfig} colorMode={colorMode}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bgColor },
          headerStyle: { backgroundColor: headerBgColor },
          headerTintColor: headerTextColor,
          headerBackTitleVisible: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="categories"
          options={{
            headerShown: true,
            title: t('categories.title'),
            headerBackTitle: t('settings.title'),
          }}
        />
        <Stack.Screen
          name="credit-cards"
          options={{
            headerShown: true,
            title: t('creditCards.title'),
            headerBackTitle: t('settings.title'),
          }}
        />
        <Stack.Screen
          name="loans"
          options={{
            headerShown: true,
            title: t('loans.title'),
            headerBackTitle: t('settings.title'),
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
