import { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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
import { X, Calendar } from 'lucide-react-native';
import { colors } from '../../../constants/theme';
import { formatDate, addDays, getFirstDayOfMonth } from '../../../utils';
import type { CreditCard } from '../../../client';

interface CreditCardFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, billingDate: Date) => Promise<void>;
  editingCard: CreditCard | null;
  isLoading: boolean;
  colorMode: 'light' | 'dark';
}

const getPaymentDueDate = (billingDate: Date): Date => {
  return addDays(billingDate, 10);
};

export function CreditCardFormModal({
  visible,
  onClose,
  onSave,
  editingCard,
  isLoading,
  colorMode,
}: CreditCardFormModalProps) {
  const { t } = useTranslation();

  const [cardName, setCardName] = useState('');
  const [billingDate, setBillingDate] = useState<Date>(getFirstDayOfMonth());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingCard) {
        setCardName(editingCard.name || '');
        setBillingDate(editingCard.billingDate ? new Date(editingCard.billingDate) : getFirstDayOfMonth());
      } else {
        resetForm();
      }
    }
  }, [visible, editingCard]);

  const resetForm = () => {
    setCardName('');
    setBillingDate(getFirstDayOfMonth());
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!cardName.trim()) return;
    await onSave(cardName.trim(), billingDate);
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBillingDate(selectedDate);
    }
  };

  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';
  const borderColor = colorMode === 'dark' ? '#333333' : '#e0e0e0';

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={onClose} />
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <View style={styles.modalHeader}>
              <Heading size="lg" style={{ color: textColor }}>
                {editingCard ? t('creditCards.editCard') : t('creditCards.addCard')}
              </Heading>
              <Pressable onPress={onClose} p="$2">
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
                  <Box borderWidth={1} borderColor={borderColor} borderRadius="$lg" p="$3">
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>{formatDate(billingDate)}</Text>
                      </HStack>
                      <Text color="$textLight400">
                        {t('creditCards.dueDay')}: {formatDate(getPaymentDueDate(billingDate))}
                      </Text>
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
                  <Button size="sm" variant="outline" onPress={() => setShowDatePicker(false)} mt="$2">
                    <ButtonText>{t('common.done')}</ButtonText>
                  </Button>
                </Box>
              )}
            </VStack>
            <ButtonGroup space="md" style={styles.modalFooter}>
              <Button flex={1} variant="outline" action="secondary" onPress={onClose}>
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button flex={1} onPress={handleSave} isDisabled={isLoading || !cardName.trim()}>
                {isLoading && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker value={billingDate} mode="date" display="default" onChange={handleDateChange} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalBody: { padding: 16 },
  modalFooter: { paddingHorizontal: 16, paddingTop: 8 },
});
