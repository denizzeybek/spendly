import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { Box, VStack, Input, InputField, InputSlot, InputIcon, Fab, FabIcon } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { Search, Plus, Receipt } from 'lucide-react-native';
import { useAuthStore, useTransactionsStore, useFilteredTransactions, useCategoriesStore } from '../../store';
import { AddCategoryModal, EmptyState, FilterChips } from '../../components';
import { TransactionItem, EditTransactionModal } from './_components';
import { TransactionItem as TransactionItemType, FilterType } from '../../types';

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const { home } = useAuthStore();
  const {
    filter,
    isLoading,
    isUpdating,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
    setFilter,
    setSearchQuery,
    searchQuery,
  } = useTransactionsStore();
  const { categories, fetchCategories, createCategory, isCreating: isCreatingCategory } = useCategoriesStore();
  const transactions = useFilteredTransactions();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItemType | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      fetchCategories();
    }, [fetchTransactions, fetchCategories])
  );

  const currency = home?.currency || 'TRY';

  const filterOptions = [
    { key: 'all' as const, label: t('common.all') },
    { key: 'INCOME' as const, label: t('transactions.income') },
    { key: 'EXPENSE' as const, label: t('transactions.expense') },
    { key: 'TRANSFER' as const, label: t('transactions.transfer') },
  ];

  const handleEditPress = (item: TransactionItemType) => {
    setEditingTransaction(item);
    setShowEditModal(true);
  };

  const handleDeletePress = (item: TransactionItemType) => {
    Alert.alert(t('transactions.deleteTitle'), t('transactions.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(item.id || '');
          } catch {
            // Error handled in store
          }
        },
      },
    ]);
  };

  const handleSaveEdit = async (data: {
    type: 'INCOME' | 'EXPENSE';
    title: string;
    amount: number;
    categoryId?: string;
    isShared: boolean;
    isRecurring: boolean;
  }) => {
    if (!editingTransaction?.id) return;
    try {
      await updateTransaction(editingTransaction.id, data);
      setShowEditModal(false);
      setEditingTransaction(null);
    } catch {
      // Error handled in store
    }
  };

  const handleSaveNewCategory = async (category: {
    name: string;
    icon: string;
    color: string;
    type: 'INCOME' | 'EXPENSE' | 'BOTH';
  }) => {
    try {
      await createCategory(category);
      setShowAddCategoryModal(false);
    } catch {
      // Error handled in store
    }
  };

  return (
    <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
      <VStack space="md" p="$4" pb="$2">
        <Input size="lg" variant="outline">
          <InputSlot pl="$3">
            <InputIcon as={Search} color="$textLight400" />
          </InputSlot>
          <InputField placeholder={t('common.search')} value={searchQuery} onChangeText={setSearchQuery} />
        </Input>

        <FilterChips options={filterOptions} selected={filter} onSelect={setFilter} />
      </VStack>

      {transactions.length === 0 ? (
        <EmptyState icon={Receipt} message={t('transactions.noTransactions')} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <TransactionItem item={item} currency={currency} onPress={handleEditPress} onDelete={handleDeletePress} />
          )}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchTransactions()} />}
        />
      )}

      <Fab size="lg" placement="bottom right" onPress={() => router.push('/(tabs)/add')}>
        <FabIcon as={Plus} color="$white" />
      </Fab>

      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        categories={categories}
        onSave={handleSaveEdit as (data: { type: 'INCOME' | 'EXPENSE' | 'TRANSFER'; title: string; amount: number; categoryId?: string; isShared: boolean; isRecurring: boolean; }) => Promise<void>}
        onOpenAddCategory={() => setShowAddCategoryModal(true)}
        isLoading={isUpdating}
      />

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSave={handleSaveNewCategory}
        isLoading={isCreatingCategory}
        defaultType={editingTransaction?.type === 'TRANSFER' ? 'EXPENSE' : editingTransaction?.type || 'EXPENSE'}
      />
    </Box>
  );
}
