import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Alert, Modal, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Pressable,
  Heading,
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonGroup,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus, Tag, Trash2, Edit2, X, Check } from 'lucide-react-native';
import { useCategoriesStore, useThemeStore } from '../src/store';
import { colors } from '../src/constants/theme';
import type { Category } from '../src/client';

type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

const PRESET_COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD',
  '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
  '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65',
];

const PRESET_ICONS = [
  '🏠', '🚗', '🍔', '🛒', '💊', '🎬', '🎮', '📱',
  '💡', '💧', '🔥', '🌐', '🏋️', '📺', '🎵', '📚',
  '✈️', '🎁', '👕', '💰', '💳', '🏦', '📊', '🎯',
];

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const {
    categories,
    isLoading,
    isCreating,
    isUpdating,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('EXPENSE');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const handleAddPress = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryType('EXPENSE');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
    setShowModal(true);
  };

  const handleEditPress = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name || '');
    setCategoryType(category.type || 'EXPENSE');
    setSelectedColor(category.color || PRESET_COLORS[0]);
    setSelectedIcon(category.icon || PRESET_ICONS[0]);
    setShowModal(true);
  };

  const handleDeletePress = (category: Category) => {
    if (category.isDefault) {
      Alert.alert(
        t('categories.cannotDelete'),
        t('categories.defaultCategoryWarning')
      );
      return;
    }

    Alert.alert(
      t('categories.deleteTitle'),
      t('categories.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id || '');
            } catch {
              // Error handled in store
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id || '', {
          name: categoryName.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: categoryType,
        });
      } else {
        await createCategory({
          name: categoryName.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: categoryType,
        });
      }
      handleCloseModal();
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryType('EXPENSE');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
  };

  // Group categories by type
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH');
  const incomeCategories = categories.filter(c => c.type === 'INCOME' || c.type === 'BOTH');

  const renderCategory = ({ item }: { item: Category }) => (
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
            <Pressable
              onPress={() => handleEditPress(item)}
              p="$2"
              borderRadius="$full"
            >
              <Edit2 size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => handleDeletePress(item)}
              p="$2"
              borderRadius="$full"
            >
              <Trash2 size={18} color={colors.expense} />
            </Pressable>
          </HStack>
        )}
      </HStack>
    </Box>
  );

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';
  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen
        options={{
          title: t('categories.title'),
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={handleAddPress} style={{ marginRight: 16 }}>
              <Plus size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Expense Categories */}
          <Text size="sm" fontWeight="$semibold" color="$textLight500" mb="$2">
            {t('transactions.expense').toUpperCase()}
          </Text>
          {expenseCategories.map((item) => (
            <Box key={item.id}>
              {renderCategory({ item })}
            </Box>
          ))}

          {/* Income Categories */}
          <Text size="sm" fontWeight="$semibold" color="$textLight500" mt="$4" mb="$2">
            {t('transactions.income').toUpperCase()}
          </Text>
          {incomeCategories.map((item) => (
            <Box key={item.id}>
              {renderCategory({ item })}
            </Box>
          ))}
        </ScrollView>
      </Box>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <View style={styles.modalHeader}>
              <Heading size="lg" style={{ color: textColor }}>
                {editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
              </Heading>
              <Pressable onPress={handleCloseModal} p="$2">
                <X size={24} color={textColor} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <VStack space="md">
                {/* Category Type */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('categories.type')}
                  </Text>
                  <ButtonGroup space="sm">
                    <Button
                      flex={1}
                      size="sm"
                      variant={categoryType === 'EXPENSE' ? 'solid' : 'outline'}
                      action={categoryType === 'EXPENSE' ? 'negative' : 'secondary'}
                      onPress={() => setCategoryType('EXPENSE')}
                    >
                      <ButtonText>{t('transactions.expense')}</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      variant={categoryType === 'INCOME' ? 'solid' : 'outline'}
                      action={categoryType === 'INCOME' ? 'positive' : 'secondary'}
                      onPress={() => setCategoryType('INCOME')}
                    >
                      <ButtonText>{t('transactions.income')}</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      variant={categoryType === 'BOTH' ? 'solid' : 'outline'}
                      onPress={() => setCategoryType('BOTH')}
                    >
                      <ButtonText>{t('categories.both')}</ButtonText>
                    </Button>
                  </ButtonGroup>
                </VStack>

                {/* Category Name */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('categories.name')}
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder={t('categories.namePlaceholder')}
                      value={categoryName}
                      onChangeText={setCategoryName}
                    />
                  </Input>
                </VStack>

                {/* Icon Selection */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('categories.icon')}
                  </Text>
                  <HStack flexWrap="wrap" space="sm">
                    {PRESET_ICONS.map((icon) => (
                      <Pressable
                        key={icon}
                        onPress={() => setSelectedIcon(icon)}
                        p="$2"
                        borderRadius="$lg"
                        borderWidth={selectedIcon === icon ? 2 : 1}
                        borderColor={selectedIcon === icon ? '$primary500' : '$borderLight300'}
                        sx={{ _dark: { borderColor: selectedIcon === icon ? '$primary500' : '$borderDark700' } }}
                        mb="$2"
                      >
                        <Text size="xl">{icon}</Text>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Color Selection */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('categories.color')}
                  </Text>
                  <HStack flexWrap="wrap" space="sm">
                    {PRESET_COLORS.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        w="$10"
                        h="$10"
                        borderRadius="$full"
                        bg={color}
                        justifyContent="center"
                        alignItems="center"
                        borderWidth={selectedColor === color ? 3 : 0}
                        borderColor="$white"
                        mb="$2"
                        style={selectedColor === color ? {
                          shadowColor: color,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.5,
                          shadowRadius: 4,
                        } : {}}
                      >
                        {selectedColor === color && (
                          <Check size={20} color="#ffffff" />
                        )}
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Preview */}
                <VStack space="xs">
                  <Text size="sm" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
                    {t('categories.preview')}
                  </Text>
                  <Box
                    bg="$backgroundLight100"
                    sx={{ _dark: { bg: '$backgroundDark800' } }}
                    p="$3"
                    borderRadius="$lg"
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        w="$10"
                        h="$10"
                        borderRadius="$full"
                        justifyContent="center"
                        alignItems="center"
                        bg={`${selectedColor}20`}
                      >
                        <Text size="xl">{selectedIcon}</Text>
                      </Box>
                      <Text size="md" fontWeight="$medium">
                        {categoryName || t('categories.namePlaceholder')}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </VStack>
            </ScrollView>
            <ButtonGroup space="md" style={styles.modalFooter}>
              <Button
                flex={1}
                variant="outline"
                action="secondary"
                onPress={handleCloseModal}
              >
                <ButtonText>{t('common.cancel')}</ButtonText>
              </Button>
              <Button
                flex={1}
                onPress={handleSave}
                isDisabled={(isCreating || isUpdating) || !categoryName.trim()}
              >
                {(isCreating || isUpdating) && <ButtonSpinner mr="$2" />}
                <ButtonText>{t('common.save')}</ButtonText>
              </Button>
            </ButtonGroup>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
