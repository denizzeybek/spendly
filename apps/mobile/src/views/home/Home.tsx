import { useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, VStack, HStack, Text, Heading } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useAuthStore, useHomeStore } from '../../store';
import { formatCurrency } from '../../utils';
import { colors } from '../../constants/theme';
import { PieChart, PieSlice } from './_components';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { home } = useAuthStore();
  const { summary, isLoading, fetchSummary } = useHomeStore();

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const currency = home?.currency || 'TRY';
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const total = totalIncome + totalExpense;

  const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
  const expensePercentage = total > 0 ? (totalExpense / total) * 100 : 0;

  const pieData: PieSlice[] = [
    { color: colors.income, percentage: incomePercentage, label: t('home.income'), amount: totalIncome },
    { color: colors.expense, percentage: expensePercentage, label: t('home.expense'), amount: totalExpense },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchSummary()} />}
    >
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }} p="$4">
        <VStack space="lg">
          {/* Balance Card */}
          <Box
            bg="$primary500"
            p="$6"
            borderRadius="$2xl"
            shadowColor="$primary500"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
          >
            <Text color="$white" opacity={0.8}>
              {t('home.balance')}
            </Text>
            <Heading size="3xl" color="$white" my="$2">
              {formatCurrency(summary?.balance || 0, currency)}
            </Heading>
            <Text color="$white" opacity={0.7} size="sm">
              {t('home.thisMonth')}
            </Text>
          </Box>

          {/* Income & Expense Row */}
          <HStack space="md">
            <Box flex={1} bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark900' } }} p="$4" borderRadius="$xl">
              <HStack space="md" alignItems="center">
                <Box bg="$success100" sx={{ _dark: { bg: '$success900' } }} p="$2" borderRadius="$full">
                  <ArrowDownLeft size={20} color={colors.income} />
                </Box>
                <VStack>
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('home.income')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$success500">
                    {formatCurrency(totalIncome, currency)}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box flex={1} bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark900' } }} p="$4" borderRadius="$xl">
              <HStack space="md" alignItems="center">
                <Box bg="$error100" sx={{ _dark: { bg: '$error900' } }} p="$2" borderRadius="$full">
                  <ArrowUpRight size={20} color={colors.expense} />
                </Box>
                <VStack>
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('home.expense')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$error500">
                    {formatCurrency(totalExpense, currency)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </HStack>

          {/* Income vs Expense Pie Chart */}
          <Box bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark900' } }} p="$4" borderRadius="$xl">
            <Text size="lg" fontWeight="$semibold" mb="$4">
              {t('home.thisMonth')}
            </Text>

            <HStack space="lg" alignItems="center" justifyContent="center">
              <Box alignItems="center" justifyContent="center">
                <PieChart data={pieData} />
              </Box>

              <VStack space="md">
                {pieData.map((item, index) => (
                  <HStack key={index} space="sm" alignItems="center">
                    <Box w="$4" h="$4" borderRadius="$sm" bg={item.color} />
                    <VStack>
                      <Text size="sm" fontWeight="$medium">
                        {item.label}
                      </Text>
                      <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                        {item.percentage.toFixed(0)}% • {formatCurrency(item.amount, currency)}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
}
