import { Feather } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import type { CatBusyState, CatGalleryItem } from '@/context/cats-context';
import { cn } from '@/lib/cn';

type CatCardProps = {
  busyState?: CatBusyState;
  cat: CatGalleryItem;
  onDelete: () => void;
  onToggleFavourite: () => void;
  onVoteDown: () => void;
  onVoteUp: () => void;
};

export function CatCard({
  busyState,
  cat,
  onDelete,
  onToggleFavourite,
  onVoteDown,
  onVoteUp,
}: CatCardProps) {
  const scoreTone =
    cat.score > 0 ? 'bg-successMuted' : cat.score < 0 ? 'bg-dangerMuted' : 'bg-surfaceMuted';

  return (
    <View className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
      <View className="aspect-square overflow-hidden bg-surfaceMuted">
        <Image className="h-full w-full bg-surfaceMuted" resizeMode="cover" source={{ uri: cat.url }} />
      </View>

      <View className="min-h-[164px] justify-between gap-3 p-4">
        <View className="gap-3">
          <View className="min-h-7 flex-row items-center gap-3">
            <Text className="flex-1 font-body-bold text-[15px] text-text" numberOfLines={1}>
              {cat.original_filename || `Cat ${cat.id}`}
            </Text>
            <View className={cn('rounded-full px-3 py-1.5', scoreTone)}>
              <Text className="font-body-semibold text-[12px] text-text">Score {cat.score}</Text>
            </View>
          </View>

          <Text className="font-body-medium text-[13px] text-textMuted" numberOfLines={1}>
            {cat.upVotes} up • {cat.downVotes} down
          </Text>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <FavoriteButton
              active={Boolean(cat.favouriteId)}
              disabled={busyState?.favourite}
              onPress={onToggleFavourite}
            />
            <ActionButton
              danger
              disabled={busyState?.delete}
              icon="trash-2"
              iconOnly
              label="Delete"
              onPress={onDelete}
            />
          </View>

          <View className="flex-row gap-3">
            <ActionButton disabled={busyState?.voteUp} icon="arrow-up" label="Up" onPress={onVoteUp} />
            <ActionButton disabled={busyState?.voteDown} icon="arrow-down" label="Down" onPress={onVoteDown} />
          </View>
        </View>
      </View>
    </View>
  );
}

type ActionButtonProps = {
  danger?: boolean;
  disabled?: boolean;
  icon: keyof typeof Feather.glyphMap;
  iconOnly?: boolean;
  label: string;
  onPress: () => void;
};

type FavoriteButtonProps = {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function FavoriteButton({ active, disabled = false, onPress }: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityLabel={active ? 'Unfavourite' : 'Favourite'}
      accessibilityRole="button"
      className={cn(
        'min-h-[42px] flex-1 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface px-3',
        disabled && 'opacity-55'
      )}
      disabled={Boolean(disabled)}
      onPress={onPress}
      style={({ pressed }) => (pressed && !disabled ? { opacity: 0.85 } : null)}>
      <View
        className={cn(
          'h-7 w-7 items-center justify-center rounded-full',
          active ? 'bg-danger' : 'bg-surfaceMuted'
        )}>
        <Feather color={active ? '#ffffff' : '#1f1d18'} name="heart" size={14} />
      </View>
      <Text className="font-body-semibold text-[12px] text-text" numberOfLines={1}>
        {active ? 'Unfavourite' : 'Favourite'}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  danger = false,
  disabled = false,
  icon,
  iconOnly = false,
  label,
  onPress,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={cn(
        'min-h-[42px] flex-row items-center justify-center rounded-full border border-border bg-surface',
        iconOnly ? 'w-[42px]' : 'flex-1 gap-2',
        danger && 'border-[#efb1a6] bg-dangerMuted',
        disabled && 'opacity-55'
      )}
      disabled={Boolean(disabled)}
      onPress={onPress}
      style={({ pressed }) => (pressed && !disabled ? { opacity: 0.85 } : null)}>
      <Feather color={danger ? '#b5402c' : '#1f1d18'} name={icon} size={15} />
      {!iconOnly ? (
        <Text
          className={cn('font-body-semibold text-[12px]', danger ? 'text-danger' : 'text-text')}
          numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
