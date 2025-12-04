import { useRef, useState, useEffect } from 'react';
import { Animated, ScrollView as RNScrollView } from 'react-native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react-native';
import { colors } from '../../constants/theme';
import { CategoryItem, TransactionType } from '../../types';

interface CategoryDropdownProps {
  categories: CategoryItem[];
  selectedCategory: CategoryItem | null;
  onSelect: (category: CategoryItem) => void;
  onAddNew?: () => void;
  transactionType?: TransactionType;
  placeholder?: string;
}

export function CategoryDropdown({
  categories,
  selectedCategory,
  onSelect,
  onAddNew,
  transactionType = 'EXPENSE',
  placeholder,
}: CategoryDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType || cat.type === 'BOTH'
  );

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.timing(dropdownAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const close = () => {
    setIsOpen(false);
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSelect = (cat: CategoryItem) => {
    onSelect(cat);
    close();
  };

  const handleAddNew = () => {
    close();
    onAddNew?.();
  };

  const dropdownMaxHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  // Close dropdown when transaction type changes
  useEffect(() => {
    close();
  }, [transactionType]);

  return (
    <Box>
      <Pressable onPress={toggle}>
        <Box
          borderWidth={1}
          borderColor={isOpen ? '$primary500' : '$borderLight300'}
          borderRadius="$lg"
          borderBottomLeftRadius={isOpen ? 0 : '$lg'}
          borderBottomRightRadius={isOpen ? 0 : '$lg'}
          p="$4"
          bg="$backgroundLight0"
          sx={{ _dark: { borderColor: isOpen ? '$primary500' : '$borderDark700', bg: '$backgroundDark900' } }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="md" alignItems="center">
              {selectedCategory && (
                <Box
                  w="$8"
                  h="$8"
                  borderRadius="$full"
                  justifyContent="center"
                  alignItems="center"
                  bg={`${selectedCategory.color}20`}
                >
                  <Text size="lg">{selectedCategory.icon}</Text>
                </Box>
              )}
              <Text
                color={selectedCategory ? '$textLight900' : '$textLight500'}
                sx={{ _dark: { color: selectedCategory ? '$textDark100' : '$textDark500' } }}
              >
                {selectedCategory?.name || placeholder || t('transactions.category')}
              </Text>
            </HStack>
            {isOpen ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color="#A3A3A3" />
            )}
          </HStack>
        </Box>
      </Pressable>

      {/* Dropdown Content */}
      <Animated.View
        style={{
          maxHeight: dropdownMaxHeight,
          overflow: 'hidden',
          borderWidth: isOpen ? 1 : 0,
          borderTopWidth: 0,
          borderColor: colors.primary,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <Box
          bg="$backgroundLight0"
          sx={{ _dark: { bg: '$backgroundDark900' } }}
        >
          {/* Add New Category - Fixed at top */}
          {onAddNew && (
            <>
              <Pressable
                onPress={handleAddNew}
                py="$3"
                px="$4"
                bg="$backgroundLight50"
                sx={{ _dark: { bg: '$backgroundDark800' } }}
              >
                <HStack space="md" alignItems="center">
                  <Box
                    w="$8"
                    h="$8"
                    borderRadius="$full"
                    justifyContent="center"
                    alignItems="center"
                    bg={`${colors.primary}20`}
                  >
                    <Plus size={18} color={colors.primary} />
                  </Box>
                  <Text size="md" color="$primary500" fontWeight="$medium">
                    {t('categories.addCategory')}
                  </Text>
                </HStack>
              </Pressable>
              <Divider />
            </>
          )}

          {/* Category List */}
          <RNScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
            {filteredCategories.length === 0 ? (
              <Box py="$4" px="$4">
                <Text color="$textLight500" textAlign="center">
                  {t('categories.noCategories')}
                </Text>
              </Box>
            ) : (
              filteredCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleSelect(cat)}
                  py="$3"
                  px="$4"
                  bg={selectedCategory?.id === cat.id ? '$backgroundLight100' : '$backgroundLight0'}
                  sx={{ _dark: { bg: selectedCategory?.id === cat.id ? '$backgroundDark800' : '$backgroundDark900' } }}
                >
                  <HStack space="md" alignItems="center">
                    <Box
                      w="$8"
                      h="$8"
                      borderRadius="$full"
                      justifyContent="center"
                      alignItems="center"
                      bg={`${cat.color}20`}
                    >
                      <Text size="lg">{cat.icon}</Text>
                    </Box>
                    <Text size="md">{cat.name}</Text>
                    {selectedCategory?.id === cat.id && (
                      <Box ml="auto">
                        <Check size={18} color={colors.primary} />
                      </Box>
                    )}
                  </HStack>
                </Pressable>
              ))
            )}
          </RNScrollView>
        </Box>
      </Animated.View>
    </Box>
  );
}
