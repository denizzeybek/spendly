import { useCallback, useState, useEffect } from 'react';
import { FlatList, RefreshControl, Alert, Modal, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Pressable,
  Heading,
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonGroup,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus, CreditCard, Trash2, Edit2, X, Calendar, CalendarClock } from 'lucide-react-native';
import { useCreditCardsStore, useThemeStore } from '../src/store';
import { colors } from '../src/constants/theme';
import { formatDate, getFirstDayOfMonth, addDays } from '../src/utils';
import {
  requestNotificationPermissions,
  scheduleCreditCardNotifications,
  cancelCreditCardNotifications,
} from '../src/services';
import type { CreditCard as CreditCardType } from '../src/client';

// Calculate payment due date (billing date + 10 days)
const getPaymentDueDate = (billingDate: Date): Date => {
  return addDays(billingDate, 10);
};

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [cardName, setCardName] = useState('');
  const [billingDate, setBillingDate] = useState<Date>(getFirstDayOfMonth());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Request notification permissions on mount
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
    setCardName('');
    setBillingDate(getFirstDayOfMonth());
    setShowModal(true);
  };

  const handleEditPress = (card: CreditCardType) => {
    setEditingCard(card);
    setCardName(card.name || '');
    setBillingDate(card.billingDate ? new Date(card.billingDate) : getFirstDayOfMonth());
    setShowModal(true);
  };

  const handleDeletePress = (card: CreditCardType) => {
    Alert.alert(
      t('creditCards.deleteTitle'),
      t('creditCards.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCreditCard(card.id || '');
              // Cancel notifications for this card
              await cancelCreditCardNotifications(card.id || '');
            } catch {
              // Error handled in store
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!cardName.trim()) return;

    try {
      const billingDateISO = billingDate.toISOString();
      let savedCardId: string;

      if (editingCard) {
        await updateCreditCard(editingCard.id || '', cardName.trim(), billingDateISO);
        savedCardId = editingCard.id || '';
      } else {
        await createCreditCard(cardName.trim(), billingDateISO);
        // Get the newly created card ID from the store
        const newCards = useCreditCardsStore.getState().creditCards;
        savedCardId = newCards[0]?.id || '';
      }

      // Schedule notifications if permissions are granted
      if (notificationsEnabled && savedCardId) {
        await scheduleCreditCardNotifications({
          cardId: savedCardId,
          cardName: cardName.trim(),
          billingDate: billingDate,
          titleDueDay: t('creditCards.notifications.dueDayTitle'),
          titleReminder: t('creditCards.notifications.reminderTitle'),
          bodyDueDay: t('creditCards.notifications.dueDayBody'),
          bodyReminder: t('creditCards.notifications.reminderBody'),
        });
      }

      setShowModal(false);
      setEditingCard(null);
      setCardName('');
      setBillingDate(getFirstDayOfMonth());
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
    setCardName('');
    setBillingDate(getFirstDayOfMonth());
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBillingDate(selectedDate);
    }
  };

  const renderCard = ({ item }: { item: CreditCardType }) => {
    const cardBillingDate = item.billingDate ? new Date(item.billingDate) : getFirstDayOfMonth();
    const paymentDueDate = getPaymentDueDate(cardBillingDate);

    return (
      <Box
        bg="$backgroundLight0"
        sx={{ _dark: { bg: '$backgroundDark900' } }}
        p="$4"
        borderRadius="$xl"
        mb="$3"
      >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack space="md" alignItems="flex-start" flex={1}>
            <Box
              w="$12"
              h="$12"
              borderRadius="$full"
              justifyContent="center"
              alignItems="center"
              bg={`${colors.primary}20`}
            >
              <CreditCard size={24} color={colors.primary} />
            </Box>
            <VStack flex={1}>
              <Text size="lg" fontWeight="$medium" numberOfLines={1}>
                {item.name}
              </Text>
              <HStack space="lg" mt="$1" flexWrap="wrap">
                <HStack space="xs" alignItems="center">
                  <Calendar size={14} color="#A3A3A3" />
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('creditCards.billingDay')}: {formatDate(cardBillingDate)}
                  </Text>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <CalendarClock size={14} color="#A3A3A3" />
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('creditCards.dueDay')}: {formatDate(paymentDueDate)}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
          <HStack space="sm">
            <Pressable
              onPress={() => handleEditPress(item)}
              p="$2"
              borderRadius="$full"
            >
              <Edit2 size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => handleDeletePress(item)}
              p="$2"
              borderRadius="$full"
            >
              <Trash2 size={20} color={colors.expense} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    );
  };

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';
  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';
  const borderColor = colorMode === 'dark' ? '#333333' : '#e0e0e0';

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
            renderItem={renderCard}
            keyExtractor={(item) => item.id || ''}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => fetchCreditCards()} />
            }
          />
        )}
      </Box>

      {/* Add/Edit Card Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <View style={styles.modalHeader}>
              <Heading size="lg" style={{ color: textColor }}>
                {editingCard ? t('creditCards.editCard') : t('creditCards.addCard')}
              </Heading>
              <Pressable onPress={handleCloseModal} p="$2">
                <X size={24} color={textColor} />
              </Pressable>
            </View>
            <VStack space="md" style={styles.modalBody}>
              <VStack space="xs">
                <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {t('creditCards.cardName')}
                </Text>
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder={t('creditCards.cardName')}
                    value={cardName}
                    onChangeText={setCardName}
                    autoFocus
                  />
                </Input>
              </VStack>
              <VStack space="xs">
                <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {t('creditCards.billingDay')}
                </Text>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <Box
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="$lg"
                    p="$3"
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>
                          {formatDate(billingDate)}
                        </Text>
                      </HStack>
                      <Text color="$textLight400">{t('creditCards.dueDay')}: {formatDate(getPaymentDueDate(billingDate))}</Text>
                    </HStack>
                  </Box>
                </Pressable>
                <Text size="xs" color="$textLight400" sx={{ _dark: { color: '$textDark500' } }}>
                  {t('creditCards.dueDayInfo')}
                </Text>
              </VStack>

              {/* iOS inline date picker */}
              {Platform.OS === 'ios' && showDatePicker && (
                <Box mt="$2">
                  <DateTimePicker
                    value={billingDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    themeVariant={colorMode === 'dark' ? 'dark' : 'light'}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setShowDatePicker(false)}
                    mt="$2"
                  >
                    <ButtonText>{t('common.done')}</ButtonText>
                  </Button>
                </Box>
              )}
            </VStack>
            <ButtonGroup space="md" style={styles.modalFooter}>
              <Button
                flex={1}
                variant="outline"
                action="secondary"
                onPress={handleCloseModal}
              >
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button
                flex={1}
                onPress={handleSave}
                isDisabled={(isCreating || isUpdating) || !cardName.trim()}
              >
                {(isCreating || isUpdating) && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={billingDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
