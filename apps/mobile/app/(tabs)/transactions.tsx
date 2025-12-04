import { useEffect } from 'react';
import { FlatList, RefreshControl } from 'react-native';
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
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Search, Plus, Receipt, Users } from 'lucide-react-native';
import { useAuthStore, useTransactionsStore, useFilteredTransactions } from '../../src/store';
import { formatCurrency } from '../../src/utils';
import { colors } from '../../src/constants/theme';

type FilterType = 'all' | 'INCOME' | 'EXPENSE';

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const { home } = useAuthStore();
  const { filter, isLoading, fetchTransactions, setFilter, setSearchQuery, searchQuery } = useTransactionsStore();
  const transactions = useFilteredTransactions();

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const renderTransaction = ({ item }: { item: typeof transactions[0] }) => (
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
        <Text
          size="lg"
          fontWeight="$bold"
          color={item.type === 'INCOME' ? '$success500' : '$error500'}
        >
          {item.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(item.amount || 0, currency)}
        </Text>
      </HStack>
    </Box>
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
    </Box>
  );
}
