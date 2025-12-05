import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Landmark, Trash2, Edit2, Calendar, CheckCircle, CircleDollarSign } from 'lucide-react-native';
import { colors } from '../../../constants/theme';
import { formatDate, formatCurrency } from '../../../utils';
import type { Loan } from '../../../client';

interface LoanItemProps {
  item: Loan;
  currency: string;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  onPayInstallment: (loan: Loan) => void;
}

export function LoanItem({ item, currency, onEdit, onDelete, onPayInstallment }: LoanItemProps) {
  const { t } = useTranslation();

  const paid = item.paidInstallments || 0;
  const total = item.totalInstallments || 1;
  const progress = item.progressPercentage || Math.round((paid / total) * 100);
  const isCompleted = paid >= total;

  return (
    <Box
      bg="$backgroundLight0"
      sx={{ _dark: { bg: '$backgroundDark900' } }}
      p="$4"
      borderRadius="$xl"
      mb="$3"
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <HStack space="md" alignItems="flex-start" flex={1}>
          <Box
            w="$12"
            h="$12"
            borderRadius="$full"
            justifyContent="center"
            alignItems="center"
            bg={isCompleted ? `${colors.income}20` : `${colors.primary}20`}
          >
            {isCompleted ? (
              <CheckCircle size={24} color={colors.income} />
            ) : (
              <Landmark size={24} color={colors.primary} />
            )}
          </Box>
          <VStack flex={1}>
            <Text size="lg" fontWeight="$medium" numberOfLines={1}>
              {item.name}
            </Text>
            <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {t('loans.installmentProgress', { paid, total })}
            </Text>

            {/* Progress bar */}
            <Box mt="$2">
              <Progress value={progress} size="sm" bg="$backgroundLight200" sx={{ _dark: { bg: '$backgroundDark700' } }}>
                <ProgressFilledTrack bg={isCompleted ? colors.income : colors.primary} />
              </Progress>
            </Box>

            {/* Details */}
            <HStack space="lg" mt="$2" flexWrap="wrap">
              <VStack>
                <Text size="xs" color="$textLight400" sx={{ _dark: { color: '$textDark500' } }}>
                  {t('loans.monthlyPayment')}
                </Text>
                <Text size="sm" fontWeight="$medium">
                  {formatCurrency(item.monthlyPayment || 0, currency)}
                </Text>
              </VStack>
              <VStack>
                <Text size="xs" color="$textLight400" sx={{ _dark: { color: '$textDark500' } }}>
                  {t('loans.remainingAmount')}
                </Text>
                <Text size="sm" fontWeight="$medium" color={isCompleted ? '$success500' : '$error500'}>
                  {formatCurrency(item.remainingAmount || 0, currency)}
                </Text>
              </VStack>
            </HStack>

            {/* Next payment date */}
            {!isCompleted && item.nextPaymentDate && (
              <HStack space="xs" alignItems="center" mt="$2">
                <Calendar size={14} color="#A3A3A3" />
                <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {t('loans.nextPayment')}: {formatDate(new Date(item.nextPaymentDate))}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>
        <VStack space="sm">
          {!isCompleted && (
            <Pressable
              onPress={() => onPayInstallment(item)}
              p="$2"
              borderRadius="$full"
              bg={`${colors.income}20`}
            >
              <CircleDollarSign size={20} color={colors.income} />
            </Pressable>
          )}
          <Pressable
            onPress={() => onEdit(item)}
            p="$2"
            borderRadius="$full"
          >
            <Edit2 size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            p="$2"
            borderRadius="$full"
          >
            <Trash2 size={20} color={colors.expense} />
          </Pressable>
        </VStack>
      </HStack>
    </Box>
  );
}
