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
import { Users, Repeat, CreditCard, ChevronDown, User } from 'lucide-react-native';
import { useTransactionsStore, useCategoriesStore, useCreditCardsStore, useHomeStore, useAuthStore } from '../../store';
import { Dropdown, AddCategoryModal } from '../../components';
import type { DropdownItem } from '../../components';
import type { CreditCard as CreditCardType } from '../../client';
import { colors } from '../../constants/theme';
import { CategoryItem } from '../../types';
import type { HomeUser } from '../../store/home.store';

type TabType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

// Convert CategoryItem to DropdownItem
interface CategoryDropdownItem extends DropdownItem {
  type?: string;
}

// Convert HomeUser to DropdownItem
interface UserDropdownItem extends DropdownItem {
  email?: string;
}

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const { createTransaction, createTransfer, isCreating, error } = useTransactionsStore();
  const { categories, fetchCategories, createCategory, isCreating: isCreatingCategory } = useCategoriesStore();
  const { creditCards, fetchCreditCards } = useCreditCardsStore();
  const { users, fetchUsers } = useHomeStore();
  const currentUser = useAuthStore((state) => state.user);

  const [tab, setTab] = useState<TabType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownItem | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDropdownItem | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Filter categories by type
  const filteredCategories: CategoryDropdownItem[] = categories
    .filter((cat) => cat.type === tab || cat.type === 'BOTH')
    .map((cat) => ({
      id: cat.id || '',
      name: cat.name || '',
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
    }));

  // Filter out current user from transfer recipients
  const otherUsers: UserDropdownItem[] = users
    .filter((u) => u.id !== currentUser?.id)
    .map((u) => ({
      id: u.id,
      name: u.name,
      subtitle: u.email,
    }));

  const resetForm = useCallback(() => {
    setTab('EXPENSE');
    setTitle('');
    setAmount('');
    setSelectedCategory(null);
    setSelectedCard(null);
    setSelectedUser(null);
    setIsShared(false);
    setIsRecurring(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      fetchCategories();
      fetchCreditCards();
      fetchUsers();
    }, [resetForm, fetchCategories, fetchCreditCards, fetchUsers])
  );

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedUser(null);
  }, [tab]);

  const handleSubmit = async () => {
    if (tab === 'TRANSFER') {
      if (!amount || !selectedUser) return;
      try {
        await createTransfer({
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          toUserId: selectedUser.id,
          title: title || undefined,
        });
        router.back();
      } catch {
        // Error handled in store
      }
    } else {
      if (!amount || !selectedCategory) return;
      try {
        await createTransaction({
          type: tab as 'INCOME' | 'EXPENSE',
          title: title || undefined,
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
          id: newCategory.id || '',
          name: newCategory.name || '',
          icon: newCategory.icon,
          color: newCategory.color,
          type: newCategory.type,
        });
      }
    } catch {
      // Error handled in store
    }
  };

  const renderUserIcon = (item: UserDropdownItem | null, isPlaceholder: boolean) => {
    if (isPlaceholder || !item) {
      return <User size={20} color="#A3A3A3" />;
    }
    return (
      <Box w="$8" h="$8" borderRadius="$full" justifyContent="center" alignItems="center" bg="$primary100">
        <Text size="md" color="$primary600" fontWeight="$bold">
          {item.name?.charAt(0).toUpperCase()}
        </Text>
      </Box>
    );
  };

  const renderTransferForm = () => (
    <>
      <Dropdown<UserDropdownItem>
        items={otherUsers}
        selectedItem={selectedUser}
        onSelect={setSelectedUser}
        placeholder={t('transactions.selectRecipient')}
        renderIcon={renderUserIcon}
        resetTrigger={tab}
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

      {error && (
        <Text color="$error500" textAlign="center">
          {error}
        </Text>
      )}

      <Button size="xl" onPress={handleSubmit} isDisabled={isCreating || !amount || !selectedUser} mt="$4">
        {isCreating && <ButtonSpinner mr="$2" />}
        <ButtonText>{t('transactions.send')}</ButtonText>
      </Button>
    </>
  );

  const renderIncomeExpenseForm = () => (
    <>
      <Dropdown<CategoryDropdownItem>
        items={filteredCategories}
        selectedItem={selectedCategory}
        onSelect={setSelectedCategory}
        onAddNew={() => setShowAddCategoryModal(true)}
        addNewLabel={t('categories.addCategory')}
        placeholder={t('transactions.category')}
        resetTrigger={tab}
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

      {tab === 'EXPENSE' && (
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

      {tab === 'EXPENSE' && (
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

      <Button size="xl" onPress={handleSubmit} isDisabled={isCreating || !amount || !selectedCategory} mt="$4">
        {isCreating && <ButtonSpinner mr="$2" />}
        <ButtonText>{t('common.save')}</ButtonText>
      </Button>
    </>
  );

  return (
    <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }} p="$4">
        <VStack space="lg">
          <ButtonGroup space="sm">
            <Button
              flex={1}
              variant={tab === 'EXPENSE' ? 'solid' : 'outline'}
              action={tab === 'EXPENSE' ? 'negative' : 'secondary'}
              onPress={() => setTab('EXPENSE')}
            >
              <ButtonText>{t('transactions.expense')}</ButtonText>
            </Button>
            <Button
              flex={1}
              variant={tab === 'INCOME' ? 'solid' : 'outline'}
              action={tab === 'INCOME' ? 'positive' : 'secondary'}
              onPress={() => setTab('INCOME')}
            >
              <ButtonText>{t('transactions.income')}</ButtonText>
            </Button>
            <Button
              flex={1}
              variant={tab === 'TRANSFER' ? 'solid' : 'outline'}
              action={tab === 'TRANSFER' ? 'primary' : 'secondary'}
              onPress={() => setTab('TRANSFER')}
            >
              <ButtonText>{t('transactions.transfer')}</ButtonText>
            </Button>
          </ButtonGroup>

          {tab === 'TRANSFER' ? renderTransferForm() : renderIncomeExpenseForm()}
        </VStack>

        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onSave={handleSaveNewCategory}
          isLoading={isCreatingCategory}
          defaultType={tab === 'TRANSFER' ? 'EXPENSE' : (tab as 'INCOME' | 'EXPENSE')}
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
