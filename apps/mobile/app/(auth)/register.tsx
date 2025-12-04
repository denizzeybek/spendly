import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
  ButtonGroup,
  FormControl,
  FormControlError,
  FormControlErrorText,
  Pressable,
  HStack,
} from '@gluestack-ui/themed';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User, Home, Hash } from 'lucide-react-native';
import { useAuthStore } from '../../src/store';

type RegisterMode = 'create' | 'join';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<RegisterMode>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeName, setHomeName] = useState('');
  const [homeCode, setHomeCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (mode === 'create' && !homeName) return;
    if (mode === 'join' && !homeCode) return;

    try {
      await register({
        name,
        email,
        password,
        ...(mode === 'create' ? { homeName } : { homeCode: homeCode.toUpperCase() }),
      });
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Box
          flex={1}
          bg="$backgroundLight50"
          sx={{ _dark: { bg: '$backgroundDark950' } }}
          justifyContent="center"
          px="$6"
          py="$8"
        >
          <VStack space="xl">
            <VStack space="xs" alignItems="center" mb="$6">
              <Heading size="3xl" color="$primary500">
                Spendly
              </Heading>
              <Text size="lg" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                {t('auth.register')}
              </Text>
            </VStack>

            <FormControl isInvalid={!!error}>
              <VStack space="md">
                <Input size="xl" variant="outline">
                  <InputSlot pl="$3">
                    <InputIcon as={User} color="$textLight400" />
                  </InputSlot>
                  <InputField
                    placeholder={t('auth.name')}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      clearError();
                    }}
                  />
                </Input>

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

                <ButtonGroup space="sm" mt="$2">
                  <Button
                    flex={1}
                    variant={mode === 'create' ? 'solid' : 'outline'}
                    onPress={() => setMode('create')}
                  >
                    <ButtonText>{t('auth.createHome')}</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    variant={mode === 'join' ? 'solid' : 'outline'}
                    onPress={() => setMode('join')}
                  >
                    <ButtonText>{t('auth.joinHome')}</ButtonText>
                  </Button>
                </ButtonGroup>

                {mode === 'create' ? (
                  <Input size="xl" variant="outline">
                    <InputSlot pl="$3">
                      <InputIcon as={Home} color="$textLight400" />
                    </InputSlot>
                    <InputField
                      placeholder={t('auth.homeName')}
                      value={homeName}
                      onChangeText={(text) => {
                        setHomeName(text);
                        clearError();
                      }}
                    />
                  </Input>
                ) : (
                  <Input size="xl" variant="outline">
                    <InputSlot pl="$3">
                      <InputIcon as={Hash} color="$textLight400" />
                    </InputSlot>
                    <InputField
                      placeholder={t('auth.homeCode')}
                      value={homeCode}
                      onChangeText={(text) => {
                        setHomeCode(text.toUpperCase());
                        clearError();
                      }}
                      maxLength={6}
                      autoCapitalize="characters"
                    />
                  </Input>
                )}

                {error && (
                  <FormControlError>
                    <FormControlErrorText>{error}</FormControlErrorText>
                  </FormControlError>
                )}

                <Button
                  size="xl"
                  onPress={handleRegister}
                  isDisabled={isLoading}
                  mt="$2"
                >
                  {isLoading && <ButtonSpinner mr="$2" />}
                  <ButtonText>{t('auth.register')}</ButtonText>
                </Button>
              </VStack>
            </FormControl>

            <HStack justifyContent="center" space="xs">
              <Text color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                {t('auth.hasAccount')}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text color="$primary500" fontWeight="$semibold">
                    {t('auth.login')}
                  </Text>
                </Pressable>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
