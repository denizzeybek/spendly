import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Box, Spinner } from '@gluestack-ui/themed';
import { useAuthStore } from '../src/store';

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
        <Spinner size="large" />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
