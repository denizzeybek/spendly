import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, Pressable, Button, ButtonText } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus, Landmark } from 'lucide-react-native';
import { useLoansStore, useThemeStore, useAuthStore } from '../../store';
import { colors } from '../../constants/theme';
import { LoanItem, LoanFormModal, LoanFormData } from './_components';
import type { Loan } from '../../client';

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
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [fetchLoans])
  );

  const handleAddPress = () => {
    setEditingLoan(null);
    setShowModal(true);
  };

  const handleEditPress = (loan: Loan) => {
    setEditingLoan(loan);
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

  const handleSave = async (data: LoanFormData) => {
    try {
      if (editingLoan) {
        await updateLoan(editingLoan.id || '', data);
      } else {
        await createLoan(data);
      }
      setShowModal(false);
      setEditingLoan(null);
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLoan(null);
  };

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';

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
            renderItem={({ item }) => (
              <LoanItem
                item={item}
                currency={currency}
                onEdit={handleEditPress}
                onDelete={handleDeletePress}
                onPayInstallment={handlePayInstallment}
              />
            )}
            keyExtractor={(item) => item.id || ''}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => fetchLoans()} />
            }
          />
        )}
      </Box>

      <LoanFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingLoan={editingLoan}
        isLoading={isCreating || isUpdating || isPaying}
        colorMode={colorMode}
      />
    </SafeAreaView>
  );
}
