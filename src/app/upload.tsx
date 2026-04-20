import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppFrame } from '@/components/app-frame';
import { NoticeBanner } from '@/components/notice-banner';
import { useCats } from '@/context/cats-context';
import { cn } from '@/lib/cn';
import { getErrorMessage, getSetupMessage } from '@/lib/cat-api';

const MAX_CONTENT_WIDTH = 860;

function formatFileSize(bytes?: number | null) {
  if (!bytes) {
    return 'Unknown file size';
  }

  const sizeInMb = bytes / (1024 * 1024);
  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
}

export default function UploadScreen() {
  const [selectedAsset, setSelectedAsset] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { width } = useWindowDimensions();
  const { isConfigured, isUploading, uploadCat } = useCats();

  const horizontalPadding = width >= 768 ? 24 : 16;
  const contentWidth = Math.min(width - horizontalPadding * 2, MAX_CONTENT_WIDTH);

  async function pickImage() {
    setSubmitError(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setSelectedAsset(result.assets[0]);
    }
  }

  async function handleUpload() {
    if (!selectedAsset) {
      setSubmitError('Please choose a cat image before uploading.');
      return;
    }

    setSubmitError(null);

    try {
      await uploadCat(selectedAsset);
      router.replace('/');
    } catch (nextError) {
      setSubmitError(getErrorMessage(nextError));
    }
  }

  return (
    <AppFrame>
      <ScrollView
        contentContainerClassName="items-center gap-4 pt-3 pb-8"
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}>
        <View
          className="w-full gap-4 rounded-[28px] border border-border bg-surface p-6"
          style={{ width: contentWidth }}>
          <View className="self-start rounded-full bg-accentMuted px-3 py-1.5">
            <Text className="font-body-bold text-[12px] uppercase tracking-[0.8px] text-accent">
              Upload
            </Text>
          </View>

          <View
            className={cn(
              'gap-5',
              width < 680 ? 'flex-col items-start' : 'flex-row items-center justify-between'
            )}>
            <Text className="flex-1 font-body-extrabold text-[28px] leading-9 text-text">
              Upload a cat
            </Text>

            <AppButton
              label="Back to gallery"
              onPress={() => router.replace('/')}
              tone="secondary"
            />
          </View>
        </View>

        {!isConfigured ? (
          <View className="w-full" style={{ width: contentWidth }}>
            <NoticeBanner title="Uploads unavailable">
              <Text className="font-body-medium text-[14px] leading-[22px] text-textMuted">
                {getSetupMessage()}
              </Text>
            </NoticeBanner>
          </View>
        ) : null}

        {submitError ? (
          <View className="w-full" style={{ width: contentWidth }}>
            <NoticeBanner tone="error" title="Upload failed">
              <Text className="font-body-medium text-[14px] leading-[22px] text-textMuted">
                {submitError}
              </Text>
            </NoticeBanner>
          </View>
        ) : null}

        <View
          className="w-full gap-5 rounded-[28px] border border-border bg-surface p-5"
          style={{ width: contentWidth }}>
          {selectedAsset ? (
            <View className="gap-4">
              <Image
                className="w-full rounded-[20px] bg-surfaceMuted"
                resizeMode="cover"
                source={{ uri: selectedAsset.uri }}
                style={{ aspectRatio: selectedAsset.width / selectedAsset.height, maxHeight: 460 }}
              />

              <View className="gap-1">
                <Text className="font-body-bold text-[16px] text-text" numberOfLines={1}>
                  {selectedAsset.fileName || 'Selected cat image'}
                </Text>
                <Text className="font-body-medium text-[14px] text-textMuted">
                  {selectedAsset.mimeType || 'image/jpeg'} • {formatFileSize(selectedAsset.fileSize)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="min-h-[260px] items-center justify-center gap-3 rounded-[20px] border border-dashed border-border bg-surfaceMuted px-5">
              <Text className="text-center font-body-bold text-[18px] text-text">
                No image selected yet
              </Text>
              <Text className="max-w-[420px] text-center font-body-medium text-[14px] leading-[22px] text-textMuted">
                Choose a cat image to preview it here.
              </Text>
            </View>
          )}

          <View className={cn('gap-4', width < 560 ? 'flex-col' : 'flex-row')}>
            <AppButton
              label={selectedAsset ? 'Choose a different image' : 'Choose an image'}
              onPress={() => void pickImage()}
              tone="secondary"
            />
            <AppButton
              disabled={!isConfigured || !selectedAsset}
              label="Upload now"
              loading={isUploading}
              onPress={() => void handleUpload()}
            />
          </View>
        </View>
      </ScrollView>
    </AppFrame>
  );
}
