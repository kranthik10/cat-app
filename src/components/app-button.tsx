import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '@/lib/cn';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'primary' | 'secondary';
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  tone = 'primary',
}: AppButtonProps) {
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'min-h-[52px] min-w-36 items-center justify-center rounded-full px-5',
        isPrimary ? 'bg-text' : 'border border-border bg-surface',
        (disabled || loading) && 'opacity-55'
      )}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => (pressed && !disabled && !loading ? { opacity: 0.85 } : null)}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#ffffff' : '#1f1d18'} />
      ) : (
        <Text
          className={cn(
            'font-body-semibold text-[15px]',
            isPrimary ? 'text-surface' : 'text-text'
          )}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
