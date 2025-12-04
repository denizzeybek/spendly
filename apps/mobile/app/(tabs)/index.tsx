import { useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useAuthStore, useHomeStore } from '../../src/store';
import { formatCurrency, getCategoryName } from '../../src/utils';
import { colors } from '../../src/constants/theme';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.substring(0, 2) || 'tr') as 'tr' | 'en';
  const { home } = useAuthStore();
  const { summary, isLoading, fetchSummary } = useHomeStore();

  // Refetch summary when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const currency = home?.currency || 'TRY';

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchSummary()} />
      }
    >
      <Box
        flex={1}
        bg="$backgroundLight50"
        sx={{ _dark: { bg: '$backgroundDark950' } }}
        p="$4"
      >
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
            <Box
              flex={1}
              bg="$backgroundLight0"
              sx={{ _dark: { bg: '$backgroundDark900' } }}
              p="$4"
              borderRadius="$xl"
            >
              <HStack space="md" alignItems="center">
                <Box
                  bg="$success100"
                  sx={{ _dark: { bg: '$success900' } }}
                  p="$2"
                  borderRadius="$full"
                >
                  <ArrowDownLeft size={20} color={colors.income} />
                </Box>
                <VStack>
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('home.income')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$success500">
                    {formatCurrency(summary?.totalIncome || 0, currency)}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box
              flex={1}
              bg="$backgroundLight0"
              sx={{ _dark: { bg: '$backgroundDark900' } }}
              p="$4"
              borderRadius="$xl"
            >
              <HStack space="md" alignItems="center">
                <Box
                  bg="$error100"
                  sx={{ _dark: { bg: '$error900' } }}
                  p="$2"
                  borderRadius="$full"
                >
                  <ArrowUpRight size={20} color={colors.expense} />
                </Box>
                <VStack>
                  <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('home.expense')}
                  </Text>
                  <Text size="lg" fontWeight="$bold" color="$error500">
                    {formatCurrency(summary?.totalExpense || 0, currency)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </HStack>

          {/* Category Breakdown */}
          {summary?.byCategory && summary.byCategory.length > 0 && (
            <Box
              bg="$backgroundLight0"
              sx={{ _dark: { bg: '$backgroundDark900' } }}
              p="$4"
              borderRadius="$xl"
            >
              <Text size="lg" fontWeight="$semibold" mb="$4">
                {t('reports.byCategory')}
              </Text>
              <VStack space="md">
                {summary.byCategory.slice(0, 5).map((cat) => (
                  <HStack key={cat.categoryId} justifyContent="space-between" alignItems="center">
                    <HStack space="sm" alignItems="center" flex={1}>
                      <Box
                        w="$3"
                        h="$3"
                        borderRadius="$full"
                        bg={cat.categoryColor}
                      />
                      <Text size="sm" numberOfLines={1} flex={1}>
                        {getCategoryName({ nameTr: cat.categoryNameTr, nameEn: cat.categoryNameEn, name: cat.categoryName }, currentLang)}
                      </Text>
                    </HStack>
                    <HStack space="sm" alignItems="center">
                      <Text size="sm" fontWeight="$medium">
                        {formatCurrency(cat.total || 0, currency)}
                      </Text>
                      <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                        {cat.percentage}%
                      </Text>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}
