import { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  ButtonGroup,
  Button,
  ButtonText,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useHomeStore } from '../../src/store';
import { formatCurrency } from '../../src/utils';

type ReportView = 'overview' | 'users';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { home } = useAuthStore();
  const { summary, userSummaries, isLoading, fetchSummary, fetchUserSummaries } = useHomeStore();
  const [view, setView] = useState<ReportView>('overview');

  const currency = home?.currency || 'TRY';

  useEffect(() => {
    if (view === 'overview') {
      fetchSummary();
    } else {
      fetchUserSummaries();
    }
  }, [view, fetchSummary, fetchUserSummaries]);

  const onRefresh = () => {
    if (view === 'overview') {
      fetchSummary();
    } else {
      fetchUserSummaries();
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Box
        flex={1}
        bg="$backgroundLight50"
        sx={{ _dark: { bg: '$backgroundDark950' } }}
        p="$4"
      >
        <VStack space="lg">
          {/* View Selector */}
          <ButtonGroup space="sm">
            <Button
              flex={1}
              variant={view === 'overview' ? 'solid' : 'outline'}
              onPress={() => setView('overview')}
            >
              <ButtonText>{t('reports.byCategory')}</ButtonText>
            </Button>
            <Button
              flex={1}
              variant={view === 'users' ? 'solid' : 'outline'}
              onPress={() => setView('users')}
            >
              <ButtonText>{t('reports.byUser')}</ButtonText>
            </Button>
          </ButtonGroup>

          {view === 'overview' && summary && (
            <>
              {/* Summary Cards */}
              <HStack space="md">
                <Box
                  flex={1}
                  bg="$success100"
                  sx={{ _dark: { bg: '$success900' } }}
                  p="$4"
                  borderRadius="$xl"
                >
                  <Text size="xs" color="$success700" sx={{ _dark: { color: '$success300' } }}>
                    {t('home.income')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$success600" mt="$1">
                    {formatCurrency(summary.totalIncome || 0, currency)}
                  </Text>
                </Box>
                <Box
                  flex={1}
                  bg="$error100"
                  sx={{ _dark: { bg: '$error900' } }}
                  p="$4"
                  borderRadius="$xl"
                >
                  <Text size="xs" color="$error700" sx={{ _dark: { color: '$error300' } }}>
                    {t('home.expense')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$error600" mt="$1">
                    {formatCurrency(summary.totalExpense || 0, currency)}
                  </Text>
                </Box>
              </HStack>

              {/* Category Breakdown */}
              {summary.byCategory && summary.byCategory.length > 0 && (
                <Box
                  bg="$backgroundLight0"
                  sx={{ _dark: { bg: '$backgroundDark900' } }}
                  p="$4"
                  borderRadius="$xl"
                >
                  <Text size="lg" fontWeight="$semibold" mb="$4">
                    {t('reports.byCategory')}
                  </Text>
                  <VStack space="lg">
                    {summary.byCategory.map((cat) => (
                      <VStack key={cat.categoryId} space="xs">
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack space="sm" alignItems="center">
                            <Box w="$3" h="$3" borderRadius="$full" bg={cat.categoryColor} />
                            <Text size="sm">{t(cat.categoryName || '')}</Text>
                          </HStack>
                          <Text size="sm" fontWeight="$medium">
                            {formatCurrency(cat.total || 0, currency)} ({cat.percentage}%)
                          </Text>
                        </HStack>
                        <Progress value={cat.percentage} size="sm">
                          <ProgressFilledTrack bg={cat.categoryColor} />
                        </Progress>
                      </VStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </>
          )}

          {view === 'users' && userSummaries && (
            <VStack space="md">
              {userSummaries.users.map((user) => (
                <Box
                  key={user.userId}
                  bg="$backgroundLight0"
                  sx={{ _dark: { bg: '$backgroundDark900' } }}
                  p="$4"
                  borderRadius="$xl"
                >
                  <Text size="lg" fontWeight="$semibold" mb="$3">
                    {user.userName}
                  </Text>
                  <VStack space="sm">
                    <HStack justifyContent="space-between">
                      <Text size="sm" color="$textLight500">
                        {t('summary.totalIncome')}
                      </Text>
                      <Text size="sm" color="$success500">
                        {formatCurrency(user.totalIncome, currency)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text size="sm" color="$textLight500">
                        {t('summary.totalExpense')}
                      </Text>
                      <Text size="sm" color="$error500">
                        {formatCurrency(user.totalExpense, currency)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text size="sm" color="$textLight500">
                        {t('summary.personalExpense')}
                      </Text>
                      <Text size="sm" color="$error400">
                        {formatCurrency(user.personalExpense, currency)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text size="sm" color="$textLight500">
                        {t('summary.sharedExpense')}
                      </Text>
                      <Text size="sm" color="$warning500">
                        {formatCurrency(user.sharedExpenseShare, currency)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text size="sm" color="$textLight500">
                        {t('summary.creditCardDebt')}
                      </Text>
                      <Text size="sm" color="$error500">
                        {formatCurrency(user.creditCardDebt, currency)}
                      </Text>
                    </HStack>
                    <Box
                      borderTopWidth={1}
                      borderTopColor="$borderLight200"
                      sx={{ _dark: { borderTopColor: '$borderDark700' } }}
                      pt="$2"
                      mt="$1"
                    >
                      <HStack justifyContent="space-between">
                        <Text size="md" fontWeight="$semibold">
                          {t('summary.balance')}
                        </Text>
                        <Text
                          size="md"
                          fontWeight="$bold"
                          color={user.balance >= 0 ? '$success500' : '$error500'}
                        >
                          {formatCurrency(user.balance, currency)}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}
