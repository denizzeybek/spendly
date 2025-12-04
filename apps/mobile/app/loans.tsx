import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Alert, Modal, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus, Landmark, Trash2, Edit2, X, Calendar, CheckCircle, CircleDollarSign } from 'lucide-react-native';
import { useLoansStore, useThemeStore, useAuthStore } from '../src/store';
import { colors } from '../src/constants/theme';
import { formatDate, formatCurrency, getFirstDayOfMonth } from '../src/utils';
import type { Loan } from '../src/client';

export default function LoansScreen() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const home = useAuthStore((state) => state.home);
  const currency = home?.currency || 'TRY';
  const {
    loans,
    isLoading,
    isCreating,
    isUpdating,
    isPaying,
    fetchLoans,
    createLoan,
    updateLoan,
    payInstallment,
    deleteLoan,
  } = useLoansStore();

  const [showModal, setShowModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Form state
  const [loanName, setLoanName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [startDate, setStartDate] = useState<Date>(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState<Date>(getFirstDayOfMonth());

  // Calculate total installments from date range (months between start and end)
  const calculateTotalInstallments = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    return Math.max(1, months);
  };

  // Calculate interest rate from principal and total amount
  const calculateInterestRate = () => {
    const principal = parseFloat(principalAmount) || 0;
    const total = parseFloat(totalAmount) || 0;
    if (principal <= 0 || total <= principal) return 0;
    const totalInstallments = calculateTotalInstallments();
    // Simple interest rate calculation: ((total - principal) / principal) * (12 / months) * 100
    const interestAmount = total - principal;
    const annualRate = (interestAmount / principal) * (12 / totalInstallments) * 100;
    return Math.round(annualRate * 100) / 100; // Round to 2 decimal places
  };

  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [fetchLoans])
  );

  const resetForm = () => {
    setLoanName('');
    setPrincipalAmount('');
    setTotalAmount('');
    setMonthlyPayment('');
    setPaidInstallments('0');
    setStartDate(getFirstDayOfMonth());
    setEndDate(getFirstDayOfMonth());
  };

  const handleAddPress = () => {
    setEditingLoan(null);
    resetForm();
    setShowModal(true);
  };

  const handleEditPress = (loan: Loan) => {
    setEditingLoan(loan);
    setLoanName(loan.name || '');
    setPrincipalAmount(String(loan.principalAmount || ''));
    setTotalAmount(String(loan.totalAmount || ''));
    setMonthlyPayment(String(loan.monthlyPayment || ''));
    setPaidInstallments(String(loan.paidInstallments || 0));
    setStartDate(loan.startDate ? new Date(loan.startDate) : getFirstDayOfMonth());
    setEndDate(loan.endDate ? new Date(loan.endDate) : getFirstDayOfMonth());
    setShowModal(true);
  };

  const handleDeletePress = (loan: Loan) => {
    Alert.alert(
      t('loans.deleteTitle'),
      t('loans.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(loan.id || '');
            } catch {
              // Error handled in store
            }
          },
        },
      ]
    );
  };

  const handlePayInstallment = (loan: Loan) => {
    if ((loan.paidInstallments || 0) >= (loan.totalInstallments || 0)) {
      Alert.alert(t('loans.loanCompleted'));
      return;
    }

    Alert.alert(
      t('loans.payInstallment'),
      t('loans.payInstallmentConfirm', { count: 1 }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await payInstallment(loan.id || '', 1);
            } catch {
              // Error handled in store
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!loanName.trim() || !principalAmount || !totalAmount || !monthlyPayment) {
      return;
    }

    try {
      const input = {
        name: loanName.trim(),
        principalAmount: parseFloat(principalAmount),
        totalAmount: parseFloat(totalAmount),
        monthlyPayment: parseFloat(monthlyPayment),
        totalInstallments: calculateTotalInstallments(),
        paidInstallments: parseInt(paidInstallments || '0', 10),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        interestRate: calculateInterestRate() || undefined,
      };

      if (editingLoan) {
        await updateLoan(editingLoan.id || '', input);
      } else {
        await createLoan(input);
      }

      setShowModal(false);
      setEditingLoan(null);
      resetForm();
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLoan(null);
    resetForm();
  };

  const handleStartDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderLoan = ({ item }: { item: Loan }) => {
    const paid = item.paidInstallments || 0;
    const total = item.totalInstallments || 1;
    const progress = item.progressPercentage || Math.round((paid / total) * 100);
    const isCompleted = paid >= total;

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
              bg={isCompleted ? `${colors.income}20` : `${colors.primary}20`}
            >
              {isCompleted ? (
                <CheckCircle size={24} color={colors.income} />
              ) : (
                <Landmark size={24} color={colors.primary} />
              )}
            </Box>
            <VStack flex={1}>
              <Text size="lg" fontWeight="$medium" numberOfLines={1}>
                {item.name}
              </Text>
              <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                {t('loans.installmentProgress', { paid, total })}
              </Text>

              {/* Progress bar */}
              <Box mt="$2">
                <Progress value={progress} size="sm" bg="$backgroundLight200" sx={{ _dark: { bg: '$backgroundDark700' } }}>
                  <ProgressFilledTrack bg={isCompleted ? colors.income : colors.primary} />
                </Progress>
              </Box>

              {/* Details */}
              <HStack space="lg" mt="$2" flexWrap="wrap">
                <VStack>
                  <Text size="xs" color="$textLight400" sx={{ _dark: { color: '$textDark500' } }}>
                    {t('loans.monthlyPayment')}
                  </Text>
                  <Text size="sm" fontWeight="$medium">
                    {formatCurrency(item.monthlyPayment || 0, currency)}
                  </Text>
                </VStack>
                <VStack>
                  <Text size="xs" color="$textLight400" sx={{ _dark: { color: '$textDark500' } }}>
                    {t('loans.remainingAmount')}
                  </Text>
                  <Text size="sm" fontWeight="$medium" color={isCompleted ? '$success500' : '$error500'}>
                    {formatCurrency(item.remainingAmount || 0, currency)}
                  </Text>
                </VStack>
              </HStack>

              {/* Next payment date */}
              {!isCompleted && item.nextPaymentDate && (
                <HStack space="xs" alignItems="center" mt="$2">
                  <Calendar size={14} color="#A3A3A3" />
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.nextPayment')}: {formatDate(new Date(item.nextPaymentDate))}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          <VStack space="sm">
            {!isCompleted && (
              <Pressable
                onPress={() => handlePayInstallment(item)}
                p="$2"
                borderRadius="$full"
                bg={`${colors.income}20`}
              >
                <CircleDollarSign size={20} color={colors.income} />
              </Pressable>
            )}
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
          </VStack>
        </HStack>
      </Box>
    );
  };

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';
  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';
  const borderColor = colorMode === 'dark' ? '#333333' : '#e0e0e0';

  const isFormValid = loanName.trim() && principalAmount && totalAmount && monthlyPayment;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen
        options={{
          title: t('loans.title'),
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={handleAddPress} style={{ marginRight: 16 }}>
              <Plus size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
        {loans.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Landmark size={64} color="#A3A3A3" />
            <Text mt="$4" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {t('loans.noLoans')}
            </Text>
            <Button mt="$4" onPress={handleAddPress}>
              <ButtonText>{t('loans.addLoan')}</ButtonText>
            </Button>
          </Box>
        ) : (
          <FlatList
            data={loans}
            renderItem={renderLoan}
            keyExtractor={(item) => item.id || ''}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => fetchLoans()} />
            }
          />
        )}
      </Box>

      {/* Add/Edit Loan Modal */}
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
                {editingLoan ? t('loans.editLoan') : t('loans.addLoan')}
              </Heading>
              <Pressable onPress={handleCloseModal} p="$2">
                <X size={24} color={textColor} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <VStack space="md" pb="$4">
                {/* Loan Name */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.loanName')} *
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder={t('loans.loanName')}
                      value={loanName}
                      onChangeText={setLoanName}
                    />
                  </Input>
                </VStack>

                {/* Principal Amount */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.principalAmount')} *
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="0"
                      value={principalAmount}
                      onChangeText={setPrincipalAmount}
                      keyboardType="numeric"
                    />
                  </Input>
                </VStack>

                {/* Total Amount */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.totalAmount')} *
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="0"
                      value={totalAmount}
                      onChangeText={setTotalAmount}
                      keyboardType="numeric"
                    />
                  </Input>
                </VStack>

                {/* Monthly Payment */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.monthlyPayment')} *
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="0"
                      value={monthlyPayment}
                      onChangeText={setMonthlyPayment}
                      keyboardType="numeric"
                    />
                  </Input>
                </VStack>

                {/* Paid Installments (only for edit) */}
                {editingLoan && (
                  <VStack space="xs">
                    <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                      {t('loans.paidInstallments')}
                    </Text>
                    <Input size="lg" variant="outline">
                      <InputField
                        placeholder="0"
                        value={paidInstallments}
                        onChangeText={setPaidInstallments}
                        keyboardType="numeric"
                      />
                    </Input>
                  </VStack>
                )}

                {/* Start Date */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.startDate')} *
                  </Text>
                  <Pressable onPress={() => setShowStartDatePicker(true)}>
                    <Box
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="$lg"
                      p="$3"
                    >
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>
                          {formatDate(startDate)}
                        </Text>
                      </HStack>
                    </Box>
                  </Pressable>
                </VStack>

                {/* iOS inline start date picker */}
                {Platform.OS === 'ios' && showStartDatePicker && (
                  <Box>
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="spinner"
                      onChange={handleStartDateChange}
                      themeVariant={colorMode === 'dark' ? 'dark' : 'light'}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => setShowStartDatePicker(false)}
                      mt="$2"
                    >
                      <ButtonText>{t('common.done')}</ButtonText>
                    </Button>
                  </Box>
                )}

                {/* End Date */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('loans.endDate')} *
                  </Text>
                  <Pressable onPress={() => setShowEndDatePicker(true)}>
                    <Box
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="$lg"
                      p="$3"
                    >
                      <HStack space="md" alignItems="center">
                        <Calendar size={20} color={colors.primary} />
                        <Text style={{ color: textColor }}>
                          {formatDate(endDate)}
                        </Text>
                      </HStack>
                    </Box>
                  </Pressable>
                </VStack>

                {/* iOS inline end date picker */}
                {Platform.OS === 'ios' && showEndDatePicker && (
                  <Box>
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="spinner"
                      onChange={handleEndDateChange}
                      themeVariant={colorMode === 'dark' ? 'dark' : 'light'}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => setShowEndDatePicker(false)}
                      mt="$2"
                    >
                      <ButtonText>{t('common.done')}</ButtonText>
                    </Button>
                  </Box>
                )}

              </VStack>
            </ScrollView>
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
                isDisabled={(isCreating || isUpdating || isPaying) || !isFormValid}
              >
                {(isCreating || isUpdating) && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Android Start Date Picker */}
      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {/* Android End Date Picker */}
      {Platform.OS === 'android' && showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
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
    maxHeight: '90%',
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
    maxHeight: 500,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
