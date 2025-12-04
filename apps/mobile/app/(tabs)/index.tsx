import { useCallback } from 'react';
import { ScrollView, RefreshControl, Dimensions } from 'react-native';
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
import Svg, { Path, G } from 'react-native-svg';
import { useAuthStore, useHomeStore } from '../../src/store';
import { formatCurrency } from '../../src/utils';
import { colors } from '../../src/constants/theme';

const CHART_SIZE = 140;
const CHART_RADIUS = CHART_SIZE / 2;
const INNER_RADIUS = CHART_RADIUS * 0.6; // Donut chart

interface PieSlice {
  color: string;
  percentage: number;
  label: string;
  amount: number;
}

function PieChart({ data }: { data: PieSlice[] }) {
  if (!data || data.length === 0 || data.every(d => d.percentage === 0)) {
    return (
      <Box w={CHART_SIZE} h={CHART_SIZE} justifyContent="center" alignItems="center">
        <Box
          w={CHART_SIZE}
          h={CHART_SIZE}
          borderRadius={CHART_RADIUS}
          borderWidth={CHART_RADIUS - INNER_RADIUS}
          borderColor="$backgroundLight200"
          sx={{ _dark: { borderColor: '$backgroundDark700' } }}
        />
      </Box>
    );
  }

  let startAngle = -90; // Start from top

  const createArcPath = (startAngleDeg: number, endAngleDeg: number, outerR: number, innerR: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;

    const x1 = CHART_RADIUS + outerR * Math.cos(startRad);
    const y1 = CHART_RADIUS + outerR * Math.sin(startRad);
    const x2 = CHART_RADIUS + outerR * Math.cos(endRad);
    const y2 = CHART_RADIUS + outerR * Math.sin(endRad);
    const x3 = CHART_RADIUS + innerR * Math.cos(endRad);
    const y3 = CHART_RADIUS + innerR * Math.sin(endRad);
    const x4 = CHART_RADIUS + innerR * Math.cos(startRad);
    const y4 = CHART_RADIUS + innerR * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const slices = data.filter(d => d.percentage > 0).map((slice) => {
    const angle = (slice.percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const path = createArcPath(startAngle, endAngle - 0.5, CHART_RADIUS - 2, INNER_RADIUS);
    startAngle = endAngle;
    return { ...slice, path };
  });

  return (
    <Svg width={CHART_SIZE} height={CHART_SIZE}>
      <G>
        {slices.map((slice, index) => (
          <Path
            key={index}
            d={slice.path}
            fill={slice.color}
          />
        ))}
      </G>
    </Svg>
  );
}

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

  // Calculate income vs expense percentages for pie chart
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const total = totalIncome + totalExpense;

  const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
  const expensePercentage = total > 0 ? (totalExpense / total) * 100 : 0;

  const pieData: PieSlice[] = [
    {
      color: colors.income,
      percentage: incomePercentage,
      label: t('home.income'),
      amount: totalIncome,
    },
    {
      color: colors.expense,
      percentage: expensePercentage,
      label: t('home.expense'),
      amount: totalExpense,
    },
  ];

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
          {/* Balance Card - Original Design */}
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

          {/* Income & Expense Row - Original Design */}
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
                    {formatCurrency(totalIncome, currency)}
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
                    {formatCurrency(totalExpense, currency)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </HStack>

          {/* Income vs Expense Pie Chart */}
          <Box
            bg="$backgroundLight0"
            sx={{ _dark: { bg: '$backgroundDark900' } }}
            p="$4"
            borderRadius="$xl"
          >
            <Text size="lg" fontWeight="$semibold" mb="$4">
              {t('home.thisMonth')}
            </Text>

            <HStack space="lg" alignItems="center" justifyContent="center">
              {/* Pie Chart */}
              <Box alignItems="center" justifyContent="center">
                <PieChart data={pieData} />
              </Box>

              {/* Legend */}
              <VStack space="md">
                {pieData.map((item, index) => (
                  <HStack key={index} space="sm" alignItems="center">
                    <Box
                      w="$4"
                      h="$4"
                      borderRadius="$sm"
                      bg={item.color}
                    />
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
