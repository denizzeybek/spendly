import { useCallback, useState, useEffect, useRef } from 'react';
import { FlatList, RefreshControl, Alert, Animated, ScrollView as RNScrollView } from 'react-native';
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
  ScrollView,
  Divider,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { Search, Plus, Receipt, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useAuthStore, useTransactionsStore, useFilteredTransactions, useCategoriesStore } from '../../src/store';
import { formatCurrency } from '../../src/utils';
import { colors } from '../../src/constants/theme';

type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

const PRESET_COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD',
  '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
  '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65',
];

const PRESET_ICONS = [
  '🏠', '🚗', '🍔', '🛒', '💊', '🎬', '🎮', '📱',
  '💡', '💧', '🔥', '🌐', '🏋️', '📺', '🎵', '📚',
  '✈️', '🎁', '👕', '💰', '💳', '🏦', '📊', '🎯',
];

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
  const { categories, fetchCategories, createCategory, isCreating: isCreatingCategory } = useCategoriesStore();
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  // Add category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>('EXPENSE');
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState(PRESET_ICONS[0]);

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

  const toggleCategoryDropdown = () => {
    const toValue = showCategoryDropdown ? 0 : 1;
    setShowCategoryDropdown(!showCategoryDropdown);
    Animated.timing(dropdownAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeCategoryDropdown = () => {
    setShowCategoryDropdown(false);
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const dropdownMaxHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const handleSelectCategory = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    closeCategoryDropdown();
  };

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

  const handleOpenAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryType(editType); // Default to current transaction type
    setNewCategoryColor(PRESET_COLORS[0]);
    setNewCategoryIcon(PRESET_ICONS[0]);
    closeCategoryDropdown();
    setShowAddCategoryModal(true);
  };

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: newCategoryColor,
        type: newCategoryType,
      });
      setShowAddCategoryModal(false);
    } catch {
      // Error handled in store
    }
  };

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
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); closeCategoryDropdown(); }} size="lg">
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
              <Box>
                <Pressable onPress={toggleCategoryDropdown}>
                  <Box
                    borderWidth={1}
                    borderColor={showCategoryDropdown ? '$primary500' : '$borderLight300'}
                    borderRadius="$lg"
                    borderBottomLeftRadius={showCategoryDropdown ? 0 : '$lg'}
                    borderBottomRightRadius={showCategoryDropdown ? 0 : '$lg'}
                    p="$4"
                    bg="$backgroundLight0"
                    sx={{ _dark: { borderColor: showCategoryDropdown ? '$primary500' : '$borderDark700', bg: '$backgroundDark900' } }}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="md" alignItems="center">
                        {selectedCategory && (
                          <Box
                            w="$8"
                            h="$8"
                            borderRadius="$full"
                            justifyContent="center"
                            alignItems="center"
                            bg={`${selectedCategory.color}20`}
                          >
                            <Text size="lg">{selectedCategory.icon}</Text>
                          </Box>
                        )}
                        <Text color={selectedCategory ? '$textLight900' : '$textLight500'} sx={{ _dark: { color: selectedCategory ? '$textDark100' : '$textDark500' } }}>
                          {selectedCategory?.name || t('transactions.category')}
                        </Text>
                      </HStack>
                      {showCategoryDropdown ? (
                        <ChevronUp size={20} color={colors.primary} />
                      ) : (
                        <ChevronDown size={20} color="#A3A3A3" />
                      )}
                    </HStack>
                  </Box>
                </Pressable>

                {/* Dropdown Content */}
                <Animated.View
                  style={{
                    maxHeight: dropdownMaxHeight,
                    overflow: 'hidden',
                    borderWidth: showCategoryDropdown ? 1 : 0,
                    borderTopWidth: 0,
                    borderColor: colors.primary,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <Box
                    bg="$backgroundLight0"
                    sx={{ _dark: { bg: '$backgroundDark900' } }}
                  >
                    {/* Add New Category - Fixed at top */}
                    <Pressable
                      onPress={handleOpenAddCategory}
                      py="$3"
                      px="$4"
                      bg="$backgroundLight50"
                      sx={{ _dark: { bg: '$backgroundDark800' } }}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          w="$8"
                          h="$8"
                          borderRadius="$full"
                          justifyContent="center"
                          alignItems="center"
                          bg={`${colors.primary}20`}
                        >
                          <Plus size={18} color={colors.primary} />
                        </Box>
                        <Text size="md" color="$primary500" fontWeight="$medium">
                          {t('categories.addCategory')}
                        </Text>
                      </HStack>
                    </Pressable>
                    <Divider />

                    {/* Category List */}
                    <RNScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                      {filteredCategories.length === 0 ? (
                        <Box py="$4" px="$4">
                          <Text color="$textLight500" textAlign="center">
                            {t('categories.noCategories')}
                          </Text>
                        </Box>
                      ) : (
                        filteredCategories.map((cat) => (
                          <Pressable
                            key={cat.id}
                            onPress={() => handleSelectCategory(cat)}
                            py="$3"
                            px="$4"
                            bg={selectedCategory?.id === cat.id ? '$backgroundLight100' : '$backgroundLight0'}
                            sx={{ _dark: { bg: selectedCategory?.id === cat.id ? '$backgroundDark800' : '$backgroundDark900' } }}
                          >
                            <HStack space="md" alignItems="center">
                              <Box
                                w="$8"
                                h="$8"
                                borderRadius="$full"
                                justifyContent="center"
                                alignItems="center"
                                bg={`${cat.color}20`}
                              >
                                <Text size="lg">{cat.icon}</Text>
                              </Box>
                              <Text size="md">{cat.name}</Text>
                              {selectedCategory?.id === cat.id && (
                                <Box ml="auto">
                                  <Check size={18} color={colors.primary} />
                                </Box>
                              )}
                            </HStack>
                          </Pressable>
                        ))
                      )}
                    </RNScrollView>
                  </Box>
                </Animated.View>
              </Box>

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
                onPress={() => { setShowEditModal(false); closeCategoryDropdown(); }}
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

      {/* Add Category Modal */}
      <Modal isOpen={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t('categories.addCategory')}</Heading>
          </ModalHeader>
          <ModalBody>
            <ScrollView style={{ maxHeight: 400 }}>
              <VStack space="md">
                {/* Category Type */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('categories.type')}</Text>
                  <ButtonGroup space="sm">
                    <Button
                      flex={1}
                      size="sm"
                      variant={newCategoryType === 'EXPENSE' ? 'solid' : 'outline'}
                      action={newCategoryType === 'EXPENSE' ? 'negative' : 'secondary'}
                      onPress={() => setNewCategoryType('EXPENSE')}
                    >
                      <ButtonText>{t('transactions.expense')}</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      variant={newCategoryType === 'INCOME' ? 'solid' : 'outline'}
                      action={newCategoryType === 'INCOME' ? 'positive' : 'secondary'}
                      onPress={() => setNewCategoryType('INCOME')}
                    >
                      <ButtonText>{t('transactions.income')}</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      variant={newCategoryType === 'BOTH' ? 'solid' : 'outline'}
                      onPress={() => setNewCategoryType('BOTH')}
                    >
                      <ButtonText>{t('categories.both')}</ButtonText>
                    </Button>
                  </ButtonGroup>
                </VStack>

                {/* Category Name */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('categories.name')}</Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder={t('categories.namePlaceholder')}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                    />
                  </Input>
                </VStack>

                {/* Icon Selection */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('categories.icon')}</Text>
                  <HStack flexWrap="wrap">
                    {PRESET_ICONS.map((icon) => (
                      <Pressable
                        key={icon}
                        onPress={() => setNewCategoryIcon(icon)}
                        p="$2"
                        m="$0.5"
                        borderRadius="$lg"
                        borderWidth={newCategoryIcon === icon ? 2 : 1}
                        borderColor={newCategoryIcon === icon ? '$primary500' : '$borderLight300'}
                        sx={{ _dark: { borderColor: newCategoryIcon === icon ? '$primary500' : '$borderDark700' } }}
                      >
                        <Text size="xl">{icon}</Text>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Color Selection */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('categories.color')}</Text>
                  <HStack flexWrap="wrap">
                    {PRESET_COLORS.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => setNewCategoryColor(color)}
                        w="$8"
                        h="$8"
                        m="$0.5"
                        borderRadius="$full"
                        bg={color}
                        justifyContent="center"
                        alignItems="center"
                        borderWidth={newCategoryColor === color ? 3 : 0}
                        borderColor="$white"
                      >
                        {newCategoryColor === color && (
                          <Check size={16} color="#ffffff" />
                        )}
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Preview */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500">{t('categories.preview')}</Text>
                  <Box
                    bg="$backgroundLight100"
                    sx={{ _dark: { bg: '$backgroundDark800' } }}
                    p="$3"
                    borderRadius="$lg"
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        w="$10"
                        h="$10"
                        borderRadius="$full"
                        justifyContent="center"
                        alignItems="center"
                        bg={`${newCategoryColor}20`}
                      >
                        <Text size="xl">{newCategoryIcon}</Text>
                      </Box>
                      <Text size="md" fontWeight="$medium">
                        {newCategoryName || t('categories.namePlaceholder')}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </VStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup space="md" flex={1}>
              <Button
                flex={1}
                variant="outline"
                action="secondary"
                onPress={() => setShowAddCategoryModal(false)}
              >
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button
                flex={1}
                onPress={handleSaveNewCategory}
                isDisabled={isCreatingCategory || !newCategoryName.trim()}
              >
                {isCreatingCategory && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
