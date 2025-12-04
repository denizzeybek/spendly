import { HStack, Pressable, Text } from '@gluestack-ui/themed';

interface FilterOption<T extends string> {
  key: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (key: T) => void;
}

export function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    <HStack space="sm">
      {options.map((option) => (
        <Pressable
          key={option.key}
          onPress={() => onSelect(option.key)}
          bg={selected === option.key ? '$primary500' : '$backgroundLight100'}
          sx={{
            _dark: { bg: selected === option.key ? '$primary500' : '$backgroundDark800' },
          }}
          px="$4"
          py="$2"
          borderRadius="$full"
        >
          <Text
            size="sm"
            color={selected === option.key ? '$white' : '$textLight700'}
            sx={{ _dark: { color: selected === option.key ? '$white' : '$textDark300' } }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </HStack>
  );
}
