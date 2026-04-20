import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppFrame } from '@/components/app-frame';
import { CatCard } from '@/components/cat-card';
import { NoticeBanner } from '@/components/notice-banner';
import { useCats } from '@/context/cats-context';
import { getErrorMessage, getSetupMessage } from '@/lib/cat-api';
import { cn } from '@/lib/cn';

const MAX_CONTENT_WIDTH = 1120;

export default function HomeScreen() {
  const [actionError, setActionError] = React.useState<string | null>(null);
  const { width } = useWindowDimensions();
  const {
    busyImageIds,
    cats,
    deleteCat,
    error,
    isConfigured,
    isLoading,
    isRefreshing,
    reload,
    toggleFavourite,
    vote,
  } = useCats();

  const horizontalPadding = width >= 768 ? 24 : 16;
  const contentWidth = Math.min(width - horizontalPadding * 2, MAX_CONTENT_WIDTH);
  const columns = width >= 1180 ? 4 : width >= 860 ? 3 : width >= 340 ? 2 : 1;
  const cardWidth = columns === 1 ? contentWidth : (contentWidth - 16 * (columns - 1)) / columns;

  async function handleToggleFavourite(catId: string) {
    const cat = cats.find((currentCat) => currentCat.id === catId);
    if (!cat) {
      return;
    }

    setActionError(null);

    try {
      await toggleFavourite(cat);
    } catch (nextError) {
      setActionError(getErrorMessage(nextError));
    }
  }

  async function handleVote(imageId: string, value: 1 | 0) {
    setActionError(null);

    try {
      await vote(imageId, value);
    } catch (nextError) {
      setActionError(getErrorMessage(nextError));
    }
  }

  async function handleDelete(imageId: string) {
    setActionError(null);

    try {
      await deleteCat(imageId);
    } catch (nextError) {
      setActionError(getErrorMessage(nextError));
    }
  }

  function confirmDelete(imageId: string) {
    const cat = cats.find((currentCat) => currentCat.id === imageId);
    const label = cat?.original_filename || 'this cat image';

    Alert.alert('Delete cat image?', `This will permanently remove ${label} from your uploads.`, [
      {
        style: 'cancel',
        text: 'Cancel',
      },
      {
        style: 'destructive',
        text: 'Delete',
        onPress: () => void handleDelete(imageId),
      },
    ]);
  }

  return (
    <AppFrame>
      <ScrollView
        contentContainerClassName="items-center gap-4 pt-3 pb-8"
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
        refreshControl={<RefreshControl onRefresh={reload} refreshing={isRefreshing} />}>
        <View
          className="w-full gap-4 rounded-[28px] border border-border bg-surface p-6"
          style={{ width: contentWidth }}>
          <View className="self-start rounded-full bg-accentMuted px-3 py-1.5">
            <Text className="font-body-bold text-[12px] uppercase tracking-[0.8px] text-accent">
              Catboard
            </Text>
          </View>

          <View
            className={cn(
              'gap-5',
              width < 720 ? 'flex-col items-start' : 'flex-row items-center justify-between'
            )}>
            <Text className="flex-1 font-body-extrabold text-[30px] leading-[38px] text-text">
              Your cats
            </Text>

            <AppButton
              label="Upload a cat"
              onPress={() => router.push('/upload')}
            />
          </View>
        </View>

        {!isConfigured ? (
          <View className="w-full" style={{ width: contentWidth }}>
            <NoticeBanner title="Gallery unavailable">
              <Text className="font-body-medium text-[14px] leading-[22px] text-textMuted">
                {getSetupMessage()}
              </Text>
            </NoticeBanner>
          </View>
        ) : null}

        {isConfigured && error ? (
          <View className="w-full" style={{ width: contentWidth }}>
            <NoticeBanner tone="error" title="Could not load cats">
              <Text className="font-body-medium text-[14px] leading-[22px] text-textMuted">
                {error}
              </Text>
            </NoticeBanner>
          </View>
        ) : null}

        {actionError ? (
          <View className="w-full" style={{ width: contentWidth }}>
            <NoticeBanner tone="error" title="Action failed">
              <Text className="font-body-medium text-[14px] leading-[22px] text-textMuted">
                {actionError}
              </Text>
            </NoticeBanner>
          </View>
        ) : null}

        {isConfigured && isLoading && cats.length === 0 ? (
          <View
            className="w-full items-center gap-4 rounded-[28px] border border-border bg-surface p-8"
            style={{ width: contentWidth }}>
            <ActivityIndicator color="#1f1d18" />
            <Text className="text-center font-body-bold text-[18px] text-text">
              Loading your cat gallery
            </Text>
          </View>
        ) : null}

        {isConfigured && !isLoading && cats.length === 0 ? (
          <View
            className="w-full items-center gap-4 rounded-[28px] border border-border bg-surface p-8"
            style={{ width: contentWidth }}>
            <Text className="text-center font-body-bold text-[18px] text-text">No uploads yet</Text>
            <AppButton label="Choose an image" onPress={() => router.push('/upload')} />
          </View>
        ) : null}

        {cats.length > 0 ? (
          <View className="w-full flex-row flex-wrap justify-start gap-4" style={{ width: contentWidth }}>
            {cats.map((cat) => (
              <View key={cat.id} style={{ width: cardWidth }}>
                <CatCard
                  busyState={busyImageIds[cat.id]}
                  cat={cat}
                  onDelete={() => confirmDelete(cat.id)}
                  onToggleFavourite={() => void handleToggleFavourite(cat.id)}
                  onVoteDown={() => void handleVote(cat.id, 0)}
                  onVoteUp={() => void handleVote(cat.id, 1)}
                />
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </AppFrame>
  );
}
