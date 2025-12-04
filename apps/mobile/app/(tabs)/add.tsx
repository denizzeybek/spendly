import { useState, useCallback, useEffect, useRef } from 'react';
import { ScrollView as RNScrollView, Animated, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  InputSlot,
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonGroup,
  Switch,
  Pressable,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Divider,
  ScrollView,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { Users, Repeat, CreditCard, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react-native';
import { useTransactionsStore, useCategoriesStore, useCreditCardsStore } from '../../src/store';
import type { CreditCard as CreditCardType } from '../../src/client';
import { colors } from '../../src/constants/theme';
import { getCategoryName } from '../../src/utils';

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

type TransactionType = 'INCOME' | 'EXPENSE';

export default function AddTransactionScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.substring(0, 2) || 'tr') as 'tr' | 'en';
  const { createTransaction, isCreating, error } = useTransactionsStore();
  const { categories, fetchCategories, createCategory, isCreating: isCreatingCategory } = useCategoriesStore();
  const { creditCards, fetchCreditCards } = useCreditCardsStore();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // Add category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>('EXPENSE');
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState(PRESET_ICONS[0]);

  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  // Reset form when screen comes into focus
  const resetForm = useCallback(() => {
    setType('EXPENSE');
    setTitle('');
    setAmount('');
    setSelectedCategory(null);
    setSelectedCard(null);
    setIsShared(false);
    setIsRecurring(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      fetchCategories();
      fetchCreditCards();
    }, [resetForm, fetchCategories, fetchCreditCards])
  );

  useEffect(() => {
    setSelectedCategory(null);
  }, [type]);

  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'BOTH'
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

  const handleSubmit = async () => {
    if (!title || !amount || !selectedCategory) return;

    try {
      await createTransaction({
        type,
        title,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        categoryId: selectedCategory.id || '',
        assignedCardId: selectedCard?.id,
        isShared,
        isRecurring,
      });
      router.back();
    } catch {
      // Error handled in store
    }
  };

  const handleOpenAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryType(type); // Default to current transaction type
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
        lang: currentLang,
        icon: newCategoryIcon,
        color: newCategoryColor,
        type: newCategoryType,
      });
      setShowAddCategoryModal(false);
    } catch {
      // Error handled in store
    }
  };

  const handleSelectCategory = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    closeCategoryDropdown();
  };

  const dropdownMaxHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <RNScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Box
        flex={1}
        bg="$backgroundLight50"
        sx={{ _dark: { bg: '$backgroundDark950' } }}
        p="$4"
      >
        <VStack space="lg">
          {/* Type Selector */}
          <ButtonGroup space="sm">
            <Button
              flex={1}
              variant={type === 'EXPENSE' ? 'solid' : 'outline'}
              action={type === 'EXPENSE' ? 'negative' : 'secondary'}
              onPress={() => setType('EXPENSE')}
            >
              <ButtonText>{t('transactions.expense')}</ButtonText>
            </Button>
            <Button
              flex={1}
              variant={type === 'INCOME' ? 'solid' : 'outline'}
              action={type === 'INCOME' ? 'positive' : 'secondary'}
              onPress={() => setType('INCOME')}
            >
              <ButtonText>{t('transactions.income')}</ButtonText>
            </Button>
          </ButtonGroup>

          {/* Title Input */}
          <Input size="xl" variant="outline">
            <InputField
              placeholder={t('transactions.description')}
              value={title}
              onChangeText={setTitle}
            />
          </Input>

          {/* Amount Input */}
          <Input size="xl" variant="outline">
            <InputSlot pl="$3">
              <Text size="lg" color="$textLight500">₺</Text>
            </InputSlot>
            <InputField
              placeholder={t('transactions.amount')}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </Input>

          {/* Category Selector */}
          <Box>
            <Pressable onPress={toggleCategoryDropdown}>
              <Box
                borderWidth={1}
                borderColor={showCategoryDropdown ? '$primary500' : '$borderLight300'}
                sx={{ _dark: { borderColor: showCategoryDropdown ? '$primary500' : '$borderDark700' } }}
                borderRadius="$lg"
                borderBottomLeftRadius={showCategoryDropdown ? 0 : '$lg'}
                borderBottomRightRadius={showCategoryDropdown ? 0 : '$lg'}
                p="$4"
                bg="$backgroundLight0"
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
                      {selectedCategory ? getCategoryName(selectedCategory, currentLang) : t('transactions.category')}
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
                <RNScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {filteredCategories.length === 0 ? (
                    <Box py="$4" px="$4">
                      <Text color="$textLight500" textAlign="center">
                        {t('categories.noCategories')}
                      </Text>
                    </Box>
                  ) : (
                    filteredCategories.map((cat, index) => (
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
                          <Text size="md">{getCategoryName(cat, currentLang)}</Text>
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

          {/* Credit Card Selector (Expense only) */}
          {type === 'EXPENSE' && (
            <Pressable onPress={() => setShowCardModal(true)}>
              <Box
                borderWidth={1}
                borderColor="$borderLight300"
                sx={{ _dark: { borderColor: '$borderDark700' } }}
                borderRadius="$lg"
                p="$4"
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <CreditCard size={20} color="#A3A3A3" />
                    <Text color={selectedCard ? '$textLight900' : '$textLight500'}>
                      {selectedCard?.name || t('transactions.assignToCard')}
                    </Text>
                  </HStack>
                  <ChevronDown size={20} color="#A3A3A3" />
                </HStack>
              </Box>
            </Pressable>
          )}

          {/* Shared Switch (Expense only) */}
          {type === 'EXPENSE' && (
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <HStack space="md" alignItems="center">
                <Users size={24} color={colors.shared} />
                <Text size="md">{t('transactions.shared')}</Text>
              </HStack>
              <Switch value={isShared} onValueChange={setIsShared} />
            </HStack>
          )}

          {/* Recurring Switch (Both Income and Expense) */}
          <HStack justifyContent="space-between" alignItems="center" py="$2">
            <HStack space="md" alignItems="center">
              <Repeat size={24} color={colors.primary} />
              <Text size="md">{t('transactions.recurring')}</Text>
            </HStack>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </HStack>

          {/* Error Message */}
          {error && (
            <Text color="$error500" textAlign="center">
              {error}
            </Text>
          )}

          {/* Submit Button */}
          <Button
            size="xl"
            onPress={handleSubmit}
            isDisabled={isCreating || !title || !amount || !selectedCategory}
            mt="$4"
          >
            {isCreating && <ButtonSpinner mr="$2" />}
            <ButtonText>{t('common.save')}</ButtonText>
          </Button>
        </VStack>

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

        {/* Card Modal */}
        <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)}>
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">{t('transactions.assignToCard')}</Heading>
            </ModalHeader>
            <ModalBody>
              <VStack space="sm">
                <Pressable
                  onPress={() => {
                    setSelectedCard(null);
                    setShowCardModal(false);
                  }}
                  py="$3"
                >
                  <Text size="md" color="$textLight500">{t('common.none')}</Text>
                </Pressable>
                {creditCards.map((card) => (
                  <Pressable
                    key={card.id}
                    onPress={() => {
                      setSelectedCard(card);
                      setShowCardModal(false);
                    }}
                    py="$3"
                  >
                    <HStack space="md" alignItems="center">
                      <CreditCard size={20} color={colors.primary} />
                      <Text size="md">{card.name}</Text>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </RNScrollView>
  );
}
