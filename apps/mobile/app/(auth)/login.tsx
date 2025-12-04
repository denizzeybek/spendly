import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Button,
  ButtonText,
  ButtonSpinner,
  FormControl,
  FormControlError,
  FormControlErrorText,
  Pressable,
  HStack,
} from '@gluestack-ui/themed';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../src/store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box
        flex={1}
        bg="$backgroundLight50"
        sx={{ _dark: { bg: '$backgroundDark950' } }}
        justifyContent="center"
        px="$6"
      >
        <VStack space="xl">
          <VStack space="xs" alignItems="center" mb="$8">
            <Heading size="3xl" color="$primary500">
              Spendly
            </Heading>
            <Text size="lg" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {t('auth.login')}
            </Text>
          </VStack>

          <FormControl isInvalid={!!error}>
            <VStack space="lg">
              <Input size="xl" variant="outline">
                <InputSlot pl="$3">
                  <InputIcon as={Mail} color="$textLight400" />
                </InputSlot>
                <InputField
                  placeholder={t('auth.email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>

              <Input size="xl" variant="outline">
                <InputSlot pl="$3">
                  <InputIcon as={Lock} color="$textLight400" />
                </InputSlot>
                <InputField
                  placeholder={t('auth.password')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                />
                <InputSlot pr="$3" onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon as={showPassword ? EyeOff : Eye} color="$textLight400" />
                </InputSlot>
              </Input>

              {error && (
                <FormControlError>
                  <FormControlErrorText>{error}</FormControlErrorText>
                </FormControlError>
              )}

              <Button
                size="xl"
                onPress={handleLogin}
                isDisabled={isLoading || !email || !password}
              >
                {isLoading && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('auth.login')}</ButtonText>
              </Button>
            </VStack>
          </FormControl>

          <HStack justifyContent="center" space="xs">
            <Text color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {t('auth.noAccount')}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text color="$primary500" fontWeight="$semibold">
                  {t('auth.register')}
                </Text>
              </Pressable>
            </Link>
          </HStack>
        </VStack>
      </Box>
    </KeyboardAvoidingView>
  );
}
