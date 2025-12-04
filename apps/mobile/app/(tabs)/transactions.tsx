import { useCallback, useState, useEffect } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Pressable,
  Badge,
  BadgeText,
  Fab,
  FabIcon,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonGroup,
  Switch,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { Search, Plus, Receipt, Trash2, ChevronDown } from 'lucide-react-native';
import { useAuthStore, useTransactionsStore, useFilteredTransactions, useCategoriesStore } from '../../src/store';
import { formatCurrency } from '../../src/utils';
import { colors } from '../../src/constants/theme';

type FilterType = 'all' | 'INCOME' | 'EXPENSE';
type TransactionType = 'INCOME' | 'EXPENSE';

interface TransactionItem {
  id?: string;
  type?: TransactionType;
  title?: string;
  amount?: number;
  date?: string;
  isShared?: boolean;
  isRecurring?: boolean;
  categoryId?: {
    _id: string;
    name: string;
    icon: string;
    color: string;
  };
}

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
    searchQuery
  } = useTransactionsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const transactions = useFilteredTransactions();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [editType, setEditType] = useState<TransactionType>('EXPENSE');
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIsShared, setEditIsShared] = useState(false);
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Refetch transactions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      fetchCategories();
    }, [fetchTransactions, fetchCategories])
  );

  const currency = home?.currency || 'TRY';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'INCOME', label: t('transactions.income') },
    { key: 'EXPENSE', label: t('transactions.expense') },
  ];

  const filteredCategories = categories.filter(
    (cat) => cat.type === editType || cat.type === 'BOTH'
  );

  const handleEditPress = (item: TransactionItem) => {
    setEditingTransaction(item);
    setEditType(item.type || 'EXPENSE');
    setEditTitle(item.title || '');
    setEditAmount(String(item.amount || ''));
    setEditIsShared(item.isShared || false);
    setEditIsRecurring(item.isRecurring || false);

    // Find matching category
    const matchingCategory = categories.find(c => c.id === item.categoryId?._id);
    setSelectedCategory(matchingCategory || null);

    setShowEditModal(true);
  };

  const handleDeletePress = (item: TransactionItem) => {
    Alert.alert(
      t('transactions.deleteTitle'),
      t('transactions.deleteConfirm'),
      [
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
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction?.id || !editTitle || !editAmount) return;

    try {
      await updateTransaction(editingTransaction.id, {
        type: editType,
        title: editTitle,
        amount: parseFloat(editAmount),
        categoryId: selectedCategory?.id,
        isShared: editIsShared,
        isRecurring: editIsRecurring,
      });
      setShowEditModal(false);
      setEditingTransaction(null);
    } catch {
      // Error handled in store
    }
  };

  // Reset category when type changes in edit modal
  useEffect(() => {
    if (showEditModal && editingTransaction) {
      const currentCategoryType = selectedCategory?.type;
      if (currentCategoryType !== 'BOTH' && currentCategoryType !== editType) {
        setSelectedCategory(null);
      }
    }
  }, [editType, showEditModal, editingTransaction, selectedCategory?.type]);

  const renderTransaction = ({ item }: { item: TransactionItem }) => (
    <Pressable onPress={() => handleEditPress(item)}>
      <Box
        bg="$backgroundLight0"
        sx={{ _dark: { bg: '$backgroundDark900' } }}
        p="$4"
        borderRadius="$xl"
        mb="$2"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="md" alignItems="center" flex={1}>
            <Box
              w="$12"
              h="$12"
              borderRadius="$full"
              justifyContent="center"
              alignItems="center"
              bg={`${item.categoryId?.color}20`}
            >
              <Text size="xl">{item.categoryId?.icon || '💰'}</Text>
            </Box>
            <VStack flex={1}>
              <Text size="md" fontWeight="$medium" numberOfLines={1}>
                {item.title}
              </Text>
              <HStack space="xs" alignItems="center">
                <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {formatDate(item.date || '')}
                </Text>
                {item.isShared && (
                  <Badge size="sm" variant="outline" action="warning">
                    <BadgeText size="2xs">{t('transactions.shared')}</BadgeText>
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
          <HStack space="md" alignItems="center">
            <Text
              size="lg"
              fontWeight="$bold"
              color={item.type === 'INCOME' ? '$success500' : '$error500'}
            >
              {item.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(item.amount || 0, currency)}
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePress(item);
              }}
              p="$2"
            >
              <Trash2 size={20} color={colors.expense} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
      {/* Header */}
      <VStack space="md" p="$4" pb="$2">
        <Input size="lg" variant="outline">
          <InputSlot pl="$3">
            <InputIcon as={Search} color="$textLight400" />
          </InputSlot>
          <InputField
            placeholder={t('common.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>

        <HStack space="sm">
          {filters.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              bg={filter === f.key ? '$primary500' : '$backgroundLight100'}
              sx={{
                _dark: { bg: filter === f.key ? '$primary500' : '$backgroundDark800' },
              }}
              px="$4"
              py="$2"
              borderRadius="$full"
            >
              <Text
                size="sm"
                color={filter === f.key ? '$white' : '$textLight700'}
                sx={{ _dark: { color: filter === f.key ? '$white' : '$textDark300' } }}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </VStack>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Receipt size={64} color="#A3A3A3" />
          <Text mt="$4" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
            {t('transactions.noTransactions')}
          </Text>
        </Box>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => fetchTransactions()} />
          }
        />
      )}

      {/* FAB */}
      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => router.push('/(tabs)/add')}
      >
        <FabIcon as={Plus} color="$white" />
      </Fab>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t('transactions.editTransaction')}</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              {/* Type Selector */}
              <ButtonGroup space="sm">
                <Button
                  flex={1}
                  variant={editType === 'EXPENSE' ? 'solid' : 'outline'}
                  action={editType === 'EXPENSE' ? 'negative' : 'secondary'}
                  onPress={() => setEditType('EXPENSE')}
                >
                  <ButtonText>{t('transactions.expense')}</ButtonText>
                </Button>
                <Button
                  flex={1}
                  variant={editType === 'INCOME' ? 'solid' : 'outline'}
                  action={editType === 'INCOME' ? 'positive' : 'secondary'}
                  onPress={() => setEditType('INCOME')}
                >
                  <ButtonText>{t('transactions.income')}</ButtonText>
                </Button>
              </ButtonGroup>

              {/* Title */}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder={t('transactions.description')}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </Input>

              {/* Amount */}
              <Input size="lg" variant="outline">
                <InputSlot pl="$3">
                  <Text size="lg" color="$textLight500">₺</Text>
                </InputSlot>
                <InputField
                  placeholder={t('transactions.amount')}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                />
              </Input>

              {/* Category Selector */}
              <Pressable onPress={() => setShowCategoryModal(true)}>
                <Box
                  borderWidth={1}
                  borderColor="$borderLight300"
                  sx={{ _dark: { borderColor: '$borderDark700' } }}
                  borderRadius="$lg"
                  p="$4"
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                      {selectedCategory && (
                        <Text size="xl">{selectedCategory.icon}</Text>
                      )}
                      <Text color={selectedCategory ? '$textLight900' : '$textLight500'}>
                        {selectedCategory ? t(selectedCategory.name || '') : t('transactions.category')}
                      </Text>
                    </HStack>
                    <ChevronDown size={20} color="#A3A3A3" />
                  </HStack>
                </Box>
              </Pressable>

              {/* Shared Switch (Expense only) */}
              {editType === 'EXPENSE' && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="md">{t('transactions.shared')}</Text>
                  <Switch value={editIsShared} onValueChange={setEditIsShared} />
                </HStack>
              )}

              {/* Recurring Switch (Both Income and Expense) */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="md">{t('transactions.recurring')}</Text>
                <Switch value={editIsRecurring} onValueChange={setEditIsRecurring} />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup space="md" flex={1}>
              <Button
                flex={1}
                variant="outline"
                action="secondary"
                onPress={() => setShowEditModal(false)}
              >
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button
                flex={1}
                onPress={handleSaveEdit}
                isDisabled={isUpdating || !editTitle || !editAmount}
              >
                {isUpdating && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t('transactions.category')}</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="sm">
              {filteredCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryModal(false);
                  }}
                  py="$3"
                >
                  <HStack space="md" alignItems="center">
                    <Text size="xl">{cat.icon}</Text>
                    <Text size="md">{t(cat.name || '')}</Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
