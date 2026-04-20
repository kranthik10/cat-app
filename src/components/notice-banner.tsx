import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

type NoticeBannerProps = PropsWithChildren<{
  title: string;
  tone?: 'info' | 'error';
}>;

export function NoticeBanner({ children, title, tone = 'info' }: NoticeBannerProps) {
  const isError = tone === 'error';

  return (
    <View
      className={cn(
        'gap-2 rounded-[20px] border p-5',
        isError ? 'border-[#efb1a6] bg-dangerMuted' : 'border-border bg-surface'
      )}>
      <Text className="font-body-bold text-[15px] text-text">{title}</Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}
