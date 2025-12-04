import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Alert, Modal, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Plus, CreditCard, Trash2, Edit2, X } from 'lucide-react-native';
import { useCreditCardsStore, useThemeStore } from '../src/store';
import { colors } from '../src/constants/theme';
import type { CreditCard as CreditCardType } from '../src/client';

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
  const [cardName, setCardName] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchCreditCards();
    }, [fetchCreditCards])
  );

  const handleAddPress = () => {
    setEditingCard(null);
    setCardName('');
    setShowModal(true);
  };

  const handleEditPress = (card: CreditCardType) => {
    setEditingCard(card);
    setCardName(card.name || '');
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
      if (editingCard) {
        await updateCreditCard(editingCard.id || '', cardName.trim());
      } else {
        await createCreditCard(cardName.trim());
      }
      setShowModal(false);
      setEditingCard(null);
      setCardName('');
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
    setCardName('');
  };

  const renderCard = ({ item }: { item: CreditCardType }) => (
    <Box
      bg="$backgroundLight0"
      sx={{ _dark: { bg: '$backgroundDark900' } }}
      p="$4"
      borderRadius="$xl"
      mb="$3"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="md" alignItems="center" flex={1}>
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
          <Text size="lg" fontWeight="$medium" numberOfLines={1} flex={1}>
            {item.name}
          </Text>
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

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';
  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';

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
              <Input size="lg" variant="outline">
                <InputField
                  placeholder={t('creditCards.cardName')}
                  value={cardName}
                  onChangeText={setCardName}
                  autoFocus
                />
              </Input>
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
