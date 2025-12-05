import { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
import { X, Check } from 'lucide-react-native';
import { PRESET_COLORS, PRESET_ICONS } from '../../../constants/presets';
import type { Category } from '../../../client';
import { CategoryType } from '../../../types';

interface CategoryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  editingCategory: Category | null;
  isLoading: boolean;
  colorMode: 'light' | 'dark';
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export function CategoryFormModal({
  visible,
  onClose,
  onSave,
  editingCategory,
  isLoading,
  colorMode,
}: CategoryFormModalProps) {
  const { t } = useTranslation();

  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('EXPENSE');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        setCategoryName(editingCategory.name || '');
        setCategoryType((editingCategory.type as CategoryType) || 'EXPENSE');
        setSelectedColor(editingCategory.color || PRESET_COLORS[0]);
        setSelectedIcon(editingCategory.icon || PRESET_ICONS[0]);
      } else {
        resetForm();
      }
    }
  }, [visible, editingCategory]);

  const resetForm = () => {
    setCategoryName('');
    setCategoryType('EXPENSE');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    await onSave({
      name: categoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type: categoryType,
    });
  };

  const modalBgColor = colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = colorMode === 'dark' ? '#ffffff' : '#000000';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
          <View style={styles.modalHeader}>
            <Heading size="lg" style={{ color: textColor }}>
              {editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
            </Heading>
            <Pressable onPress={onClose} p="$2">
              <X size={24} color={textColor} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalBody}>
            <VStack space="md">
              {/* Category Type */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.type')}</Text>
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
                <Text size="sm" color="$textLight500">{t('categories.name')}</Text>
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
                <Text size="sm" color="$textLight500">{t('categories.icon')}</Text>
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
                <Text size="sm" color="$textLight500">{t('categories.color')}</Text>
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
                      {selectedColor === color && <Check size={20} color="#ffffff" />}
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              {/* Preview */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.preview')}</Text>
                <Box bg="$backgroundLight100" sx={{ _dark: { bg: '$backgroundDark800' } }} p="$3" borderRadius="$lg">
                  <HStack space="md" alignItems="center">
                    <Box w="$10" h="$10" borderRadius="$full" justifyContent="center" alignItems="center" bg={`${selectedColor}20`}>
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
            <Button flex={1} variant="outline" action="secondary" onPress={onClose}>
              <ButtonText>{t('common.cancel')}</ButtonText>
            </Button>
            <Button flex={1} onPress={handleSave} isDisabled={isLoading || !categoryName.trim()}>
              {isLoading && <ButtonSpinner mr="$2" />}
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </ButtonGroup>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128, 128, 128, 0.2)' },
  modalBody: { padding: 16, maxHeight: 400 },
  modalFooter: { paddingHorizontal: 16, paddingTop: 8 },
});
