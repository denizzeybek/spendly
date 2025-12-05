import { useCallback, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, Pressable } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCategoriesStore, useThemeStore } from '../../store';
import { colors } from '../../constants/theme';
import { CategoryItem, CategoryFormModal, CategoryFormData } from './_components';
import type { Category } from '../../client';

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const colorMode = useThemeStore((state) => state.colorMode);
  const {
    categories,
    isCreating,
    isUpdating,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const handleAddPress = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditPress = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeletePress = (category: Category) => {
    if (category.isDefault) {
      Alert.alert(t('categories.cannotDelete'), t('categories.defaultCategoryWarning'));
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

  const handleSave = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id || '', data);
      } else {
        await createCategory(data);
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch {
      // Error handled in store
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Group categories by type
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME' || c.type === 'BOTH');

  const bgColor = colorMode === 'dark' ? '#0a0a0a' : '#fafafa';

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
            <CategoryItem
              key={item.id}
              item={item}
              onEdit={handleEditPress}
              onDelete={handleDeletePress}
            />
          ))}

          {/* Income Categories */}
          <Text size="sm" fontWeight="$semibold" color="$textLight500" mt="$4" mb="$2">
            {t('transactions.income').toUpperCase()}
          </Text>
          {incomeCategories.map((item) => (
            <CategoryItem
              key={item.id}
              item={item}
              onEdit={handleEditPress}
              onDelete={handleDeletePress}
            />
          ))}
        </ScrollView>
      </Box>

      <CategoryFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingCategory={editingCategory}
        isLoading={isCreating || isUpdating}
        colorMode={colorMode}
      />
    </SafeAreaView>
  );
}
