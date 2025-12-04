import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Pressable,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonGroup,
  ScrollView,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { PRESET_COLORS, PRESET_ICONS, DEFAULT_EXPENSE_ICON, DEFAULT_INCOME_ICON } from '../../constants/presets';
import { CategoryType, TransactionType } from '../../types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: {
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
  }) => Promise<void>;
  isLoading?: boolean;
  defaultType?: TransactionType;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  defaultType = 'EXPENSE',
}: AddCategoryModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(defaultType === 'INCOME' ? DEFAULT_INCOME_ICON : DEFAULT_EXPENSE_ICON);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      icon,
      color,
      type,
    });
    // Reset form
    setName('');
    setType(defaultType);
    setColor(PRESET_COLORS[0]);
    setIcon(defaultType === 'INCOME' ? DEFAULT_INCOME_ICON : DEFAULT_EXPENSE_ICON);
  };

  const handleClose = () => {
    setName('');
    setType(defaultType);
    setColor(PRESET_COLORS[0]);
    setIcon(defaultType === 'INCOME' ? DEFAULT_INCOME_ICON : DEFAULT_EXPENSE_ICON);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{t('categories.addCategory')}</Heading>
        </ModalHeader>
        <ModalBody>
          <ScrollView style={{ maxHeight: 400 }}>
            <VStack space="md">
              {/* Category Type */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.type')}</Text>
                <ButtonGroup space="sm">
                  <Button
                    flex={1}
                    size="sm"
                    variant={type === 'EXPENSE' ? 'solid' : 'outline'}
                    action={type === 'EXPENSE' ? 'negative' : 'secondary'}
                    onPress={() => setType('EXPENSE')}
                  >
                    <ButtonText>{t('transactions.expense')}</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    size="sm"
                    variant={type === 'INCOME' ? 'solid' : 'outline'}
                    action={type === 'INCOME' ? 'positive' : 'secondary'}
                    onPress={() => setType('INCOME')}
                  >
                    <ButtonText>{t('transactions.income')}</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    size="sm"
                    variant={type === 'BOTH' ? 'solid' : 'outline'}
                    onPress={() => setType('BOTH')}
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
                    value={name}
                    onChangeText={setName}
                  />
                </Input>
              </VStack>

              {/* Icon Selection */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.icon')}</Text>
                <HStack flexWrap="wrap">
                  {PRESET_ICONS.map((presetIcon) => (
                    <Pressable
                      key={presetIcon}
                      onPress={() => setIcon(presetIcon)}
                      p="$2"
                      m="$0.5"
                      borderRadius="$lg"
                      borderWidth={icon === presetIcon ? 2 : 1}
                      borderColor={icon === presetIcon ? '$primary500' : '$borderLight300'}
                      sx={{ _dark: { borderColor: icon === presetIcon ? '$primary500' : '$borderDark700' } }}
                    >
                      <Text size="xl">{presetIcon}</Text>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              {/* Color Selection */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.color')}</Text>
                <HStack flexWrap="wrap">
                  {PRESET_COLORS.map((presetColor) => (
                    <Pressable
                      key={presetColor}
                      onPress={() => setColor(presetColor)}
                      w="$8"
                      h="$8"
                      m="$0.5"
                      borderRadius="$full"
                      bg={presetColor}
                      justifyContent="center"
                      alignItems="center"
                      borderWidth={color === presetColor ? 3 : 0}
                      borderColor="$white"
                    >
                      {color === presetColor && (
                        <Check size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              {/* Preview */}
              <VStack space="xs">
                <Text size="sm" color="$textLight500">{t('categories.preview')}</Text>
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
                      bg={`${color}20`}
                    >
                      <Text size="xl">{icon}</Text>
                    </Box>
                    <Text size="md" fontWeight="$medium">
                      {name || t('categories.namePlaceholder')}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </VStack>
          </ScrollView>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup space="md" flex={1}>
            <Button
              flex={1}
              variant="outline"
              action="secondary"
              onPress={handleClose}
            >
              <ButtonText>{t('common.cancel')}</ButtonText>
            </Button>
            <Button
              flex={1}
              onPress={handleSave}
              isDisabled={isLoading || !name.trim()}
            >
              {isLoading && <ButtonSpinner mr="$2" />}
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
