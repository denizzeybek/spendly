import { useState, useCallback, useEffect } from 'react';
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
import { ChevronDown, User } from 'lucide-react-native';
import { useTransactionsStore, useHomeStore, useAuthStore } from '../../../store';
import { colors } from '../../../constants/theme';
import type { HomeUser } from '../../../store/home.store';

export function TransferForm() {
  const { t } = useTranslation();
  const { createTransfer, isCreating, error } = useTransactionsStore();
  const { users, fetchUsers } = useHomeStore();
  const currentUser = useAuthStore((state) => state.user);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState<HomeUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const resetForm = useCallback(() => {
    setAmount('');
    setTitle('');
    setSelectedUser(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      fetchUsers();
    }, [resetForm, fetchUsers])
  );

  // Filter out current user from the list
  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleSubmit = async () => {
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
  };

  return (
    <VStack space="lg">
      <Pressable onPress={() => setShowUserModal(true)}>
        <Box
          borderWidth={1}
          borderColor="$borderLight300"
          sx={{ _dark: { borderColor: '$borderDark700' } }}
          borderRadius="$lg"
          p="$4"
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="md" alignItems="center">
              <User size={20} color={selectedUser ? colors.primary : '#A3A3A3'} />
              <Text color={selectedUser ? '$textLight900' : '$textLight500'} sx={{ _dark: { color: selectedUser ? '$textDark100' : '$textDark500' } }}>
                {selectedUser?.name || t('transactions.selectRecipient')}
              </Text>
            </HStack>
            <ChevronDown size={20} color="#A3A3A3" />
          </HStack>
        </Box>
      </Pressable>

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
        <ButtonText>{t('common.save')}</ButtonText>
      </Button>

      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t('transactions.selectRecipient')}</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="sm">
              {otherUsers.length === 0 ? (
                <Text color="$textLight500" textAlign="center" py="$4">
                  {t('transactions.cannotTransferToSelf')}
                </Text>
              ) : (
                otherUsers.map((user) => (
                  <Pressable
                    key={user.id}
                    onPress={() => {
                      setSelectedUser(user);
                      setShowUserModal(false);
                    }}
                    py="$3"
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        w="$10"
                        h="$10"
                        borderRadius="$full"
                        bg="$primary100"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text size="lg" color="$primary600">
                          {user.name?.charAt(0).toUpperCase()}
                        </Text>
                      </Box>
                      <VStack>
                        <Text size="md" fontWeight="$medium">
                          {user.name}
                        </Text>
                        <Text size="xs" color="$textLight500">
                          {user.email}
                        </Text>
                      </VStack>
                    </HStack>
                  </Pressable>
                ))
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
