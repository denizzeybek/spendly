import { Box, VStack, HStack, Text, Pressable } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2 } from 'lucide-react-native';
import { colors } from '../../../constants/theme';
import type { Category } from '../../../client';

interface CategoryItemProps {
  item: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryItem({ item, onEdit, onDelete }: CategoryItemProps) {
  const { t } = useTranslation();

  return (
    <Box
      bg="$backgroundLight0"
      sx={{ _dark: { bg: '$backgroundDark900' } }}
      p="$3"
      borderRadius="$lg"
      mb="$2"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="md" alignItems="center" flex={1}>
          <Box
            w="$10"
            h="$10"
            borderRadius="$full"
            justifyContent="center"
            alignItems="center"
            bg={`${item.color}20`}
          >
            <Text size="xl">{item.icon}</Text>
          </Box>
          <VStack flex={1}>
            <Text size="md" fontWeight="$medium" numberOfLines={1}>
              {item.name}
            </Text>
            <Text size="xs" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
              {item.type === 'BOTH'
                ? t('categories.typeBoth')
                : item.type === 'INCOME'
                  ? t('transactions.income')
                  : t('transactions.expense')}
              {item.isDefault && ` • ${t('categories.default')}`}
            </Text>
          </VStack>
        </HStack>
        {!item.isDefault && (
          <HStack space="sm">
            <Pressable onPress={() => onEdit(item)} p="$2" borderRadius="$full">
              <Edit2 size={18} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => onDelete(item)} p="$2" borderRadius="$full">
              <Trash2 size={18} color={colors.expense} />
            </Pressable>
          </HStack>
        )}
      </HStack>
    </Box>
  );
}
