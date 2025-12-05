import { Box, VStack, HStack, Text, Pressable } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { CreditCard, Trash2, Edit2, Calendar, CalendarClock } from 'lucide-react-native';
import { colors } from '../../../constants/theme';
import { formatDate, addDays } from '../../../utils';
import type { CreditCard as CreditCardType } from '../../../client';

interface CreditCardItemProps {
  item: CreditCardType;
  onEdit: (card: CreditCardType) => void;
  onDelete: (card: CreditCardType) => void;
}

const getFirstDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getPaymentDueDate = (billingDate: Date): Date => {
  return addDays(billingDate, 10);
};

export function CreditCardItem({ item, onEdit, onDelete }: CreditCardItemProps) {
  const { t } = useTranslation();
  const cardBillingDate = item.billingDate ? new Date(item.billingDate) : getFirstDayOfMonth();
  const paymentDueDate = getPaymentDueDate(cardBillingDate);

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
            bg={`${colors.primary}20`}
          >
            <CreditCard size={24} color={colors.primary} />
          </Box>
          <VStack flex={1}>
            <Text size="lg" fontWeight="$medium" numberOfLines={1}>
              {item.name}
            </Text>
            <HStack space="lg" mt="$1" flexWrap="wrap">
              <HStack space="xs" alignItems="center">
                <Calendar size={14} color="#A3A3A3" />
                <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {t('creditCards.billingDay')}: {formatDate(cardBillingDate)}
                </Text>
              </HStack>
              <HStack space="xs" alignItems="center">
                <CalendarClock size={14} color="#A3A3A3" />
                <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                  {t('creditCards.dueDay')}: {formatDate(paymentDueDate)}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
        <HStack space="sm">
          <Pressable onPress={() => onEdit(item)} p="$2" borderRadius="$full">
            <Edit2 size={20} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => onDelete(item)} p="$2" borderRadius="$full">
            <Trash2 size={20} color={colors.expense} />
          </Pressable>
        </HStack>
      </HStack>
    </Box>
  );
}
