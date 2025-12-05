import { useRef, useState, useEffect } from 'react';
import { Animated, ScrollView as RNScrollView, View } from 'react-native';
import { Box, HStack, VStack, Text, Pressable, Divider } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useThemeStore } from '../store';

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  subtitle?: string;
}

interface DropdownProps<T extends DropdownItem> {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  placeholder?: string;
  renderIcon?: (item: T | null, isPlaceholder: boolean) => React.ReactNode;
  resetTrigger?: unknown;
}

export function Dropdown<T extends DropdownItem>({
  items,
  selectedItem,
  onSelect,
  onAddNew,
  addNewLabel,
  placeholder,
  renderIcon,
  resetTrigger,
}: DropdownProps<T>) {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const isDark = colorMode === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const borderColor = isOpen ? colors.primary : (isDark ? '#404040' : '#D4D4D4');
  const bgColor = isDark ? '#171717' : '#FFFFFF';

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.timing(dropdownAnimation, { toValue, duration: 200, useNativeDriver: false }).start();
  };

  const close = () => {
    setIsOpen(false);
    Animated.timing(dropdownAnimation, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    close();
  };

  const handleAddNew = () => {
    close();
    onAddNew?.();
  };

  const dropdownMaxHeight = dropdownAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

  useEffect(() => {
    setIsOpen(false);
    Animated.timing(dropdownAnimation, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [resetTrigger, dropdownAnimation]);

  const defaultRenderIcon = (item: T | null, isPlaceholder: boolean) => {
    if (!item || isPlaceholder) return null;

    if (item.icon) {
      return (
        <Box
          w="$8"
          h="$8"
          borderRadius="$full"
          justifyContent="center"
          alignItems="center"
          bg={`${item.color || colors.primary}20`}
        >
          <Text size="lg">{item.icon}</Text>
        </Box>
      );
    }

    return (
      <Box
        w="$8"
        h="$8"
        borderRadius="$full"
        justifyContent="center"
        alignItems="center"
        bg="$primary100"
      >
        <Text size="md" color="$primary600" fontWeight="$bold">
          {item.name?.charAt(0).toUpperCase()}
        </Text>
      </Box>
    );
  };

  const iconRenderer = renderIcon || defaultRenderIcon;

  return (
    <View style={{ zIndex: isOpen ? 1000 : 1 }}>
      {/* Container with border */}
      <View
        style={{
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 8,
          backgroundColor: bgColor,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Pressable onPress={toggle}>
          <Box p="$4">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                {iconRenderer(selectedItem, !selectedItem)}
                <Text
                  color={selectedItem ? '$textLight900' : '$textLight500'}
                  sx={{ _dark: { color: selectedItem ? '$textDark100' : '$textDark500' } }}
                >
                  {selectedItem?.name || placeholder || t('common.select')}
                </Text>
              </HStack>
              {isOpen ? <ChevronUp size={20} color={colors.primary} /> : <ChevronDown size={20} color="#A3A3A3" />}
            </HStack>
          </Box>
        </Pressable>

        {/* Dropdown content - inside the same border container */}
        <Animated.View
          style={{
            maxHeight: dropdownMaxHeight,
            overflow: 'hidden',
          }}
        >
          {isOpen && <Divider />}

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
                    {addNewLabel || t('common.addNew')}
                  </Text>
                </HStack>
              </Pressable>
              <Divider />
            </>
          )}

          <RNScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
            {items.length === 0 ? (
              <Box py="$4" px="$4">
                <Text color="$textLight500" textAlign="center">
                  {t('common.noItems')}
                </Text>
              </Box>
            ) : (
              items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item)}
                  py="$3"
                  px="$4"
                  bg={selectedItem?.id === item.id ? '$backgroundLight100' : '$backgroundLight0'}
                  sx={{ _dark: { bg: selectedItem?.id === item.id ? '$backgroundDark800' : '$backgroundDark900' } }}
                >
                  <HStack space="md" alignItems="center">
                    {iconRenderer(item, false)}
                    <VStack flex={1}>
                      <Text size="md">{item.name}</Text>
                      {item.subtitle && (
                        <Text size="xs" color="$textLight500">
                          {item.subtitle}
                        </Text>
                      )}
                    </VStack>
                    {selectedItem?.id === item.id && (
                      <Box ml="auto">
                        <Check size={18} color={colors.primary} />
                      </Box>
                    )}
                  </HStack>
                </Pressable>
              ))
            )}
          </RNScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
