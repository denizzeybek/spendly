import { ComponentType } from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import { LucideProps } from 'lucide-react-native';

interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  message: string;
  iconSize?: number;
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  message,
  iconSize = 64,
  iconColor = '#A3A3A3',
}: EmptyStateProps) {
  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Icon size={iconSize} color={iconColor} />
      <Text mt="$4" color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>
        {message}
      </Text>
    </Box>
  );
}
