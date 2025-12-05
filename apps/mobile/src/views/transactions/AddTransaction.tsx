import { useState, useCallback, useEffect } from 'react';
import { ScrollView as RNScrollView } from 'react-native';
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
  Heading,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { Users, Repeat, CreditCard, ChevronDown } from 'lucide-react-native';
import { useTransactionsStore, useCategoriesStore, useCreditCardsStore } from '../../store';
import { CategoryDropdown, AddCategoryModal } from '../../components';
import type { CreditCard as CreditCardType } from '../../client';
import { colors } from '../../constants/theme';
import { TransactionType, CategoryItem } from '../../types';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const { createTransaction, isCreating, error } = useTransactionsStore();
  const { categories, fetchCategories, createCategory, isCreating: isCreatingCategory } = useCategoriesStore();
  const { creditCards, fetchCreditCards } = useCreditCardsStore();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

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

  const handleSaveNewCategory = async (category: {
    name: string;
    icon: string;
    color: string;
    type: 'INCOME' | 'EXPENSE' | 'BOTH';
  }) => {
    try {
      const newCategory = await createCategory(category);
      setShowAddCategoryModal(false);
      if (newCategory) {
        setSelectedCategory({
          id: newCategory.id,
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          type: newCategory.type,
        });
      }
    } catch {
      // Error handled in store
    }
  };

  return (
    <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }} p="$4">
        <VStack space="lg">
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

          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onAddNew={() => setShowAddCategoryModal(true)}
            transactionType={type}
          />

          <Input size="xl" variant="outline">
            <InputSlot pl="$3">
              <Text size="lg" color="$textLight500">
                ₺
              </Text>
            </InputSlot>
            <InputField
              placeholder={t('transactions.amount')}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </Input>

          <Input size="xl" variant="outline">
            <InputField placeholder={t('transactions.description')} value={title} onChangeText={setTitle} />
          </Input>

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

          {type === 'EXPENSE' && (
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <HStack space="md" alignItems="center">
                <Users size={24} color={colors.shared} />
                <Text size="md">{t('transactions.shared')}</Text>
              </HStack>
              <Switch value={isShared} onValueChange={setIsShared} />
            </HStack>
          )}

          <HStack justifyContent="space-between" alignItems="center" py="$2">
            <HStack space="md" alignItems="center">
              <Repeat size={24} color={colors.primary} />
              <Text size="md">{t('transactions.recurring')}</Text>
            </HStack>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </HStack>

          {error && (
            <Text color="$error500" textAlign="center">
              {error}
            </Text>
          )}

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

        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onSave={handleSaveNewCategory}
          isLoading={isCreatingCategory}
          defaultType={type}
        />

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
                  <Text size="md" color="$textLight500">
                    {t('common.none')}
                  </Text>
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
