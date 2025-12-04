import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store';

export default function AuthLayout() {
  const colorMode = useThemeStore((state) => state.colorMode);
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? '#0A0A0A' : '#FAFAFA';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bgColor },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
