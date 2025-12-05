import { Box, VStack, HStack, Text, Badge, BadgeText, Pressable } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Trash2, ArrowRightLeft } from 'lucide-react-native';
import { formatCurrency } from '../../../utils';
import { colors } from '../../../constants/theme';
import { TransactionItem as TransactionItemType } from '../../../types';
import { useAuthStore } from '../../../store';

interface TransactionItemProps {
  item: TransactionItemType;
  currency: string;
  onPress: (item: TransactionItemType) => void;
  onDelete: (item: TransactionItemType) => void;
}

export function TransactionItem({ item, currency, onPress, onDelete }: TransactionItemProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const isTransfer = item.type === 'TRANSFER';
  const isOutgoingTransfer = isTransfer && item.fromUserId?._id === currentUser?.id;
  const isIncomingTransfer = isTransfer && item.toUserId?._id === currentUser?.id;

  const getTransferLabel = () => {
    if (isOutgoingTransfer) {
      return `→ ${item.toUserId?.name || ''}`;
    }
    if (isIncomingTransfer) {
      return `← ${item.fromUserId?.name || ''}`;
    }
    return '';
  };

  const getAmountColor = () => {
    if (isTransfer) {
      return isIncomingTransfer ? '$success500' : '$warning500';
    }
    return item.type === 'INCOME' ? '$success500' : '$error500';
  };

  const getAmountPrefix = () => {
    if (isTransfer) {
      return isIncomingTransfer ? '+' : '-';
    }
    return item.type === 'INCOME' ? '+' : '-';
  };

  return (
    <Pressable onPress={() => onPress(item)}>
      <Box bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark900' } }} p="$4" borderRadius="$xl" mb="$2">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="md" alignItems="center" flex={1}>
            <Box
              w="$12"
              h="$12"
              borderRadius="$full"
              justifyContent="center"
              alignItems="center"
              bg={isTransfer ? '#6366F120' : `${item.categoryId?.color}20`}
            >
              {isTransfer ? (
                <ArrowRightLeft size={24} color="#6366F1" />
              ) : (
                <Text size="xl">{item.categoryId?.icon || '💰'}</Text>
              )}
            </Box>
            <VStack flex={1} space="xs">
              <Text size="md" fontWeight="$medium" numberOfLines={1} flex={1}>
                {isTransfer ? t('transactions.transfer') : item.categoryId?.name || '-'}
              </Text>
              {isTransfer && (
                <Text size="xs" color="$primary500" numberOfLines={1}>
                  {getTransferLabel()}
                </Text>
              )}
              {item.title && (
                <Text size="xs" color="$textLight500" numberOfLines={1} sx={{ _dark: { color: '$textDark400' } }}>
                  {item.title}
                </Text>
              )}
              {item.isShared && !isTransfer && (
                <Badge size="sm" variant="outline" action="warning" style={{ alignSelf: 'flex-start', flexShrink: 1 }}>
                  <BadgeText size="2xs">{t('transactions.shared')}</BadgeText>
                </Badge>
              )}
              <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                {formatDate(item.date || '')} • {item.createdById?.name || ''}
              </Text>
            </VStack>
          </HStack>
          <HStack space="md" alignItems="center">
            <Text size="lg" fontWeight="$bold" color={getAmountColor()}>
              {getAmountPrefix()}
              {formatCurrency(item.amount || 0, currency)}
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              p="$2"
            >
              <Trash2 size={20} color={colors.expense} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Pressable>
  );
}
