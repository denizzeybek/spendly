import { useCallback, useState, useEffect } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, Pressable, Button, ButtonText } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus, CreditCard } from 'lucide-react-native';
import { useCreditCardsStore, useThemeStore } from '../../store';
import { colors } from '../../constants/theme';
import {
  requestNotificationPermissions,
  scheduleCreditCardNotifications,
  cancelCreditCardNotifications,
} from '../../services';
import { CreditCardItem, CreditCardFormModal } from './_components';
import type { CreditCard as CreditCardType } from '../../client';

export default function CreditCardsScreen() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const {
    creditCards,
    isLoading,
    isCreating,
    isUpdating,
    fetchCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
  } = useCreditCardsStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      const granted = await requestNotificationPermissions();
      setNotificationsEnabled(granted);
    };
    initNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCreditCards();
    }, [fetchCreditCards])
  );

  const handleAddPress = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleEditPress = (card: CreditCardType) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleDeletePress = (card: CreditCardType) => {
    Alert.alert(t('creditCards.deleteTitle'), t('creditCards.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCreditCard(card.id || '');
            await cancelCreditCardNotifications(card.id || '');
          } catch {
            // Error handled in store
          }
        },
      },
    ]);
  };

  const handleSave = async (name: string, billingDate: Date) => {
    try {
      const billingDateISO = billingDate.toISOString();
      let savedCardId: string;

      if (editingCard) {
        await updateCreditCard(editingCard.id || '', name, billingDateISO);
        savedCardId = editingCard.id || '';
      } else {
        await createCreditCard(name, billingDateISO);
        const newCards = useCreditCardsStore.getState().creditCards;
        savedCardId = newCards[0]?.id || '';
      }

      if (notificationsEnabled && savedCardId) {
        await scheduleCreditCardNotifications({
          cardId: savedCardId,
          cardName: name,
          billingDate: billingDate,
          titleDueDay: t('creditCards.notifications.dueDayTitle'),
          titleReminder: t('creditCards.notifications.reminderTitle'),
          bodyDueDay: t('creditCards.notifications.dueDayBody'),
          bodyReminder: t('creditCards.notifications.reminderBody'),
        });
      }

      setShowModal(false);
      setEditingCard(null);
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
  };

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen
        options={{
          title: t('creditCards.title'),
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={handleAddPress} style={{ marginRight: 16 }}>
              <Plus size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
        {creditCards.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <CreditCard size={64} color="#A3A3A3" />
            <Text mt="$4" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {t('creditCards.noCards')}
            </Text>
            <Button mt="$4" onPress={handleAddPress}>
              <ButtonText>{t('creditCards.addCard')}</ButtonText>
            </Button>
          </Box>
        ) : (
          <FlatList
            data={creditCards}
            renderItem={({ item }) => (
              <CreditCardItem item={item} onEdit={handleEditPress} onDelete={handleDeletePress} />
            )}
            keyExtractor={(item) => item.id || ''}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchCreditCards()} />}
          />
        )}
      </Box>

      <CreditCardFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingCard={editingCard}
        isLoading={isCreating || isUpdating}
        colorMode={colorMode}
      />
    </SafeAreaView>
  );
}
