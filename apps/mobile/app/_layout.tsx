import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { gluestackConfig } from '../src/constants/theme';
import { useThemeStore } from '../src/store';
import { OpenAPI } from '../src/client';
import '../src/locales/i18n';

// Configure API base URL from environment variable
OpenAPI.BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function RootLayout() {
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
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="credit-cards"
          options={{
            headerShown: true,
            presentation: 'modal',
            headerStyle: { backgroundColor: headerBgColor },
            headerTintColor: headerTextColor,
            contentStyle: { backgroundColor: bgColor },
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
