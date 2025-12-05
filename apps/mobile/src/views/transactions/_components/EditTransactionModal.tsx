import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  InputSlot,
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
  Box,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../../components';
import type { DropdownItem } from '../../../components';
import { TransactionItem, TransactionType, CategoryItem } from '../../../types';

interface CategoryDropdownItem extends DropdownItem {
  type?: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
  categories: CategoryItem[];
  onSave: (data: {
    type: TransactionType;
    title: string;
    amount: number;
    categoryId?: string;
    isShared: boolean;
    isRecurring: boolean;
  }) => Promise<void>;
  onOpenAddCategory: () => void;
  isLoading?: boolean;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  categories,
  onSave,
  onOpenAddCategory,
  isLoading = false,
}: EditTransactionModalProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownItem | null>(null);

  // Filter categories by type
  const filteredCategories: CategoryDropdownItem[] = categories
    .filter((cat) => cat.type === type || cat.type === 'BOTH')
    .map((cat) => ({
      id: cat.id || '',
      name: cat.name || '',
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
    }));

  useEffect(() => {
    if (transaction) {
      const transactionType = transaction.type === 'TRANSFER' ? 'EXPENSE' : (transaction.type || 'EXPENSE');
      setType(transactionType as 'INCOME' | 'EXPENSE');
      setTitle(transaction.title || '');
      setAmount(String(transaction.amount || ''));
      setIsShared(transaction.isShared || false);
      setIsRecurring(transaction.isRecurring || false);
      const matchingCategory = categories.find((c) => c.id === transaction.categoryId?._id);
      if (matchingCategory) {
        setSelectedCategory({
          id: matchingCategory.id || '',
          name: matchingCategory.name || '',
          icon: matchingCategory.icon,
          color: matchingCategory.color,
          type: matchingCategory.type,
        });
      } else {
        setSelectedCategory(null);
      }
    }
  }, [transaction, categories]);

  useEffect(() => {
    if (selectedCategory) {
      const categoryType = selectedCategory.type;
      if (categoryType !== 'BOTH' && categoryType !== type) {
        setSelectedCategory(null);
      }
    }
  }, [type, selectedCategory]);

  const handleSave = async () => {
    if (!amount) return;
    await onSave({
      type,
      title,
      amount: parseFloat(amount),
      categoryId: selectedCategory?.id,
      isShared,
      isRecurring,
    });
  };

  const handleClose = () => {
    setType('EXPENSE');
    setTitle('');
    setAmount('');
    setIsShared(false);
    setIsRecurring(false);
    setSelectedCategory(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{t('transactions.editTransaction')}</Heading>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
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

            <Dropdown<CategoryDropdownItem>
              items={filteredCategories}
              selectedItem={selectedCategory}
              onSelect={setSelectedCategory}
              onAddNew={onOpenAddCategory}
              addNewLabel={t('categories.addCategory')}
              placeholder={t('transactions.category')}
              resetTrigger={type}
            />

            <Input size="lg" variant="outline">
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

            <Input size="lg" variant="outline">
              <InputField placeholder={t('transactions.description')} value={title} onChangeText={setTitle} />
            </Input>

            {type === 'EXPENSE' && (
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="md">{t('transactions.shared')}</Text>
                <Switch value={isShared} onValueChange={setIsShared} />
              </HStack>
            )}

            <HStack justifyContent="space-between" alignItems="center">
              <Text size="md">{t('transactions.recurring')}</Text>
              <Switch value={isRecurring} onValueChange={setIsRecurring} />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup space="md" flex={1}>
            <Button flex={1} variant="outline" action="secondary" onPress={handleClose}>
              <ButtonText>{t('common.cancel')}</ButtonText>
            </Button>
            <Button flex={1} onPress={handleSave} isDisabled={isLoading || !amount}>
              {isLoading && <ButtonSpinner mr="$2" />}
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
