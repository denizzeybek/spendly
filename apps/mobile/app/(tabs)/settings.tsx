import { ScrollView, Share, Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ButtonText,
  ButtonIcon,
  Pressable,
  Divider,
  Avatar,
  AvatarFallbackText,
  Switch,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  Share2,
  Globe,
  DollarSign,
  Users,
  Info,
  LogOut,
  Moon,
  ChevronRight,
  CreditCard,
} from 'lucide-react-native';
import { useAuthStore, useThemeStore } from '../../src/store';
import i18n from '../../src/locales/i18n';
import { colors } from '../../src/constants/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, home, logout } = useAuthStore();
  const { colorMode, toggleColorMode } = useThemeStore();

  const handleShareCode = async () => {
    if (!home?.code) return;

    try {
      await Share.share({
        message: `${t('settings.homeCode')}: ${home.code}\n\nSpendly ile ev bütçeni yönet!`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleChangeLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Box
        flex={1}
        bg="$backgroundLight50"
        sx={{ _dark: { bg: '$backgroundDark950' } }}
      >
        {/* User Card */}
        <Box
          bg="$backgroundLight0"
          sx={{ _dark: { bg: '$backgroundDark900' } }}
          p="$4"
          m="$4"
          borderRadius="$xl"
        >
          <HStack space="md" alignItems="center">
            <Avatar size="lg" bg="$primary500">
              <AvatarFallbackText>{user?.name}</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Heading size="md">{user?.name}</Heading>
              <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                {user?.email}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Home Code Card */}
        <Box
          bg="$backgroundLight0"
          sx={{ _dark: { bg: '$backgroundDark900' } }}
          p="$4"
          mx="$4"
          mb="$4"
          borderRadius="$xl"
        >
          <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
            {t('settings.homeCode')}
          </Text>
          <HStack justifyContent="space-between" alignItems="center" mt="$2">
            <Heading size="xl" fontFamily="$mono" letterSpacing="$xl">
              {home?.code}
            </Heading>
            <Button variant="outline" size="sm" onPress={handleShareCode}>
              <ButtonIcon as={Share2} mr="$2" />
              <ButtonText>{t('settings.shareCode')}</ButtonText>
            </Button>
          </HStack>
          <Text size="xs" color="$textLight500" mt="$2" sx={{ _dark: { color: '$textDark400' } }}>
            {home?.name}
          </Text>
        </Box>

        {/* Settings List */}
        <Box
          bg="$backgroundLight0"
          sx={{ _dark: { bg: '$backgroundDark900' } }}
          mx="$4"
          mb="$4"
          borderRadius="$xl"
          overflow="hidden"
        >
          <Text
            size="xs"
            fontWeight="$semibold"
            color="$textLight500"
            sx={{ _dark: { color: '$textDark400' } }}
            p="$4"
            pb="$2"
          >
            {t('settings.title').toUpperCase()}
          </Text>

          {/* Dark Mode Toggle */}
          <Pressable p="$4">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <Moon size={22} color={colors.primary} />
                <Text size="md">Dark Mode</Text>
              </HStack>
              <Switch value={colorMode === 'dark'} onValueChange={toggleColorMode} />
            </HStack>
          </Pressable>

          <Divider />

          {/* Language */}
          <Pressable p="$4" onPress={handleChangeLanguage}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <Globe size={22} color={colors.primary} />
                <Text size="md">{t('settings.language')}</Text>
              </HStack>
              <HStack space="sm" alignItems="center">
                <Text size="sm" color="$textLight500">
                  {i18n.language === 'tr' ? 'Türkçe' : 'English'}
                </Text>
                <ChevronRight size={20} color="#A3A3A3" />
              </HStack>
            </HStack>
          </Pressable>

          <Divider />

          {/* Currency */}
          <Pressable p="$4">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <DollarSign size={22} color={colors.primary} />
                <Text size="md">{t('settings.currency')}</Text>
              </HStack>
              <HStack space="sm" alignItems="center">
                <Text size="sm" color="$textLight500">
                  {home?.currency || 'TRY'}
                </Text>
                <ChevronRight size={20} color="#A3A3A3" />
              </HStack>
            </HStack>
          </Pressable>

          <Divider />

          {/* Credit Cards */}
          <Pressable p="$4" onPress={() => router.push('/credit-cards')}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <CreditCard size={22} color={colors.primary} />
                <Text size="md">{t('settings.creditCards')}</Text>
              </HStack>
              <ChevronRight size={20} color="#A3A3A3" />
            </HStack>
          </Pressable>

          <Divider />

          {/* Members */}
          <Pressable p="$4">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <Users size={22} color={colors.primary} />
                <Text size="md">{t('settings.members')}</Text>
              </HStack>
              <ChevronRight size={20} color="#A3A3A3" />
            </HStack>
          </Pressable>
        </Box>

        {/* About */}
        <Box
          bg="$backgroundLight0"
          sx={{ _dark: { bg: '$backgroundDark900' } }}
          mx="$4"
          mb="$4"
          borderRadius="$xl"
          overflow="hidden"
        >
          <Text
            size="xs"
            fontWeight="$semibold"
            color="$textLight500"
            sx={{ _dark: { color: '$textDark400' } }}
            p="$4"
            pb="$2"
          >
            {t('settings.about').toUpperCase()}
          </Text>

          <HStack p="$4" justifyContent="space-between" alignItems="center">
            <HStack space="md" alignItems="center">
              <Info size={22} color={colors.primary} />
              <Text size="md">Version</Text>
            </HStack>
            <Text size="sm" color="$textLight500">
              1.0.0
            </Text>
          </HStack>
        </Box>

        {/* Logout Button */}
        <Box px="$4" pb="$8">
          <Button
            variant="outline"
            action="negative"
            size="lg"
            onPress={handleLogout}
          >
            <ButtonIcon as={LogOut} mr="$2" />
            <ButtonText>{t('auth.logout')}</ButtonText>
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
}
