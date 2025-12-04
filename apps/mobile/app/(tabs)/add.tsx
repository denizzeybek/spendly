import { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
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
import { router } from 'expo-router';
import { Users, Repeat, CreditCard, ChevronDown } from 'lucide-react-native';
import { useTransactionsStore, useCategoriesStore, useHomeStore } from '../../src/store';
import { colors } from '../../src/constants/theme';

type TransactionType = 'INCOME' | 'EXPENSE';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const { createTransaction, isCreating, error } = useTransactionsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { users, fetchUsers } = useHomeStore();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ id: string; name: string } | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedCategory(null);
  }, [type]);

  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'BOTH'
  );

  const creditCards = users
    .filter((u: any) => u.creditCard)
    .map((u: any) => u.creditCard);

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

  return (
    <ScrollView style={{ flex: 1 }}>
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

          {/* Switches (Expense only) */}
          {type === 'EXPENSE' && (
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center" py="$2">
                <HStack space="md" alignItems="center">
                  <Users size={24} color={colors.shared} />
                  <Text size="md">{t('transactions.shared')}</Text>
                </HStack>
                <Switch value={isShared} onValueChange={setIsShared} />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center" py="$2">
                <HStack space="md" alignItems="center">
                  <Repeat size={24} color={colors.primary} />
                  <Text size="md">{t('transactions.recurring')}</Text>
                </HStack>
                <Switch value={isRecurring} onValueChange={setIsRecurring} />
              </HStack>
            </VStack>
          )}

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
                  <Text size="md" color="$textLight500">None</Text>
                </Pressable>
                {creditCards.map((card: any) => (
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
    </ScrollView>
  );
}
