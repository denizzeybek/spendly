import { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
import { formatDate, getFirstDayOfMonth } from '../../../utils';
import type { Loan } from '../../../client';

interface LoanFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: LoanFormData) => Promise<void>;
  editingLoan: Loan | null;
  isLoading: boolean;
  colorMode: 'light' | 'dark';
}

export interface LoanFormData {
  name: string;
  principalAmount: number;
  totalAmount: number;
  monthlyPayment: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: string;
  endDate: string;
  interestRate?: number;
}

export function LoanFormModal({
  visible,
  onClose,
  onSave,
  editingLoan,
  isLoading,
  colorMode,
}: LoanFormModalProps) {
  const { t } = useTranslation();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Form state
  const [loanName, setLoanName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [startDate, setStartDate] = useState<Date>(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState<Date>(getFirstDayOfMonth());

  // Reset or populate form when modal opens
  useEffect(() => {
    if (visible) {
      if (editingLoan) {
        setLoanName(editingLoan.name || '');
        setPrincipalAmount(String(editingLoan.principalAmount || ''));
        setTotalAmount(String(editingLoan.totalAmount || ''));
        setMonthlyPayment(String(editingLoan.monthlyPayment || ''));
        setPaidInstallments(String(editingLoan.paidInstallments || 0));
        setStartDate(editingLoan.startDate ? new Date(editingLoan.startDate) : getFirstDayOfMonth());
        setEndDate(editingLoan.endDate ? new Date(editingLoan.endDate) : getFirstDayOfMonth());
      } else {
        resetForm();
      }
    }
  }, [visible, editingLoan]);

  const resetForm = () => {
    setLoanName('');
    setPrincipalAmount('');
    setTotalAmount('');
    setMonthlyPayment('');
    setPaidInstallments('0');
    setStartDate(getFirstDayOfMonth());
    setEndDate(getFirstDayOfMonth());
  };

  const calculateTotalInstallments = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    return Math.max(1, months);
  };

  const calculateInterestRate = () => {
    const principal = parseFloat(principalAmount) || 0;
    const total = parseFloat(totalAmount) || 0;
    if (principal <= 0 || total <= principal) return 0;
    const totalInstallments = calculateTotalInstallments();
    const interestAmount = total - principal;
    const annualRate = (interestAmount / principal) * (12 / totalInstallments) * 100;
    return Math.round(annualRate * 100) / 100;
  };

  const handleSave = async () => {
    if (!loanName.trim() || !principalAmount || !totalAmount || !monthlyPayment) return;

    await onSave({
      name: loanName.trim(),
      principalAmount: parseFloat(principalAmount),
      totalAmount: parseFloat(totalAmount),
      monthlyPayment: parseFloat(monthlyPayment),
      totalInstallments: calculateTotalInstallments(),
      paidInstallments: parseInt(paidInstallments || '0', 10),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      interestRate: calculateInterestRate() || undefined,
    });
  };

  const handleStartDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';
  const borderColor = colorMode === 'dark' ? '#333333' : '#e0e0e0';
  const isFormValid = loanName.trim() && principalAmount && totalAmount && monthlyPayment;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={onClose} />
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <View style={styles.modalHeader}>
              <Heading size="lg" style={{ color: textColor }}>
                {editingLoan ? t('loans.editLoan') : t('loans.addLoan')}
              </Heading>
              <Pressable onPress={onClose} p="$2">
                <X size={24} color={textColor} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <VStack space="md" pb="$4">
                {/* Loan Name */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.loanName')} *</Text>
                  <Input size="lg" variant="outline">
                    <InputField placeholder={t('loans.loanName')} value={loanName} onChangeText={setLoanName} />
                  </Input>
                </VStack>

                {/* Principal Amount */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.principalAmount')} *</Text>
                  <Input size="lg" variant="outline">
                    <InputField placeholder="0" value={principalAmount} onChangeText={setPrincipalAmount} keyboardType="numeric" />
                  </Input>
                </VStack>

                {/* Total Amount */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.totalAmount')} *</Text>
                  <Input size="lg" variant="outline">
                    <InputField placeholder="0" value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" />
                  </Input>
                </VStack>

                {/* Monthly Payment */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.monthlyPayment')} *</Text>
                  <Input size="lg" variant="outline">
                    <InputField placeholder="0" value={monthlyPayment} onChangeText={setMonthlyPayment} keyboardType="numeric" />
                  </Input>
                </VStack>

                {/* Paid Installments (only for edit) */}
                {editingLoan && (
                  <VStack space="xs">
                    <Text size="sm" color="$textLight500">{t('loans.paidInstallments')}</Text>
                    <Input size="lg" variant="outline">
                      <InputField placeholder="0" value={paidInstallments} onChangeText={setPaidInstallments} keyboardType="numeric" />
                    </Input>
                  </VStack>
                )}

                {/* Start Date */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.startDate')} *</Text>
                  <Pressable onPress={() => setShowStartDatePicker(true)}>
                    <Box borderWidth={1} borderColor={borderColor} borderRadius="$lg" p="$3">
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>{formatDate(startDate)}</Text>
                      </HStack>
                    </Box>
                  </Pressable>
                </VStack>

                {Platform.OS === 'ios' && showStartDatePicker && (
                  <Box>
                    <DateTimePicker value={startDate} mode="date" display="spinner" onChange={handleStartDateChange} themeVariant={colorMode} />
                    <Button size="sm" variant="outline" onPress={() => setShowStartDatePicker(false)} mt="$2">
                      <ButtonText>{t('common.done')}</ButtonText>
                    </Button>
                  </Box>
                )}

                {/* End Date */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('loans.endDate')} *</Text>
                  <Pressable onPress={() => setShowEndDatePicker(true)}>
                    <Box borderWidth={1} borderColor={borderColor} borderRadius="$lg" p="$3">
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>{formatDate(endDate)}</Text>
                      </HStack>
                    </Box>
                  </Pressable>
                </VStack>

                {Platform.OS === 'ios' && showEndDatePicker && (
                  <Box>
                    <DateTimePicker value={endDate} mode="date" display="spinner" onChange={handleEndDateChange} themeVariant={colorMode} />
                    <Button size="sm" variant="outline" onPress={() => setShowEndDatePicker(false)} mt="$2">
                      <ButtonText>{t('common.done')}</ButtonText>
                    </Button>
                  </Box>
                )}
              </VStack>
            </ScrollView>
            <ButtonGroup space="md" style={styles.modalFooter}>
              <Button flex={1} variant="outline" action="secondary" onPress={onClose}>
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button flex={1} onPress={handleSave} isDisabled={isLoading || !isFormValid}>
                {isLoading && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Android Date Pickers */}
      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
      )}
      {Platform.OS === 'android' && showEndDatePicker && (
        <DateTimePicker value={endDate} mode="date" display="default" onChange={handleEndDateChange} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128, 128, 128, 0.2)' },
  modalBody: { padding: 16, maxHeight: 500 },
  modalFooter: { paddingHorizontal: 16, paddingTop: 8 },
});
