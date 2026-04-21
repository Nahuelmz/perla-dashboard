import React from 'react';
import { Provider } from '../generated/types';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { px: number; font: number }> = {
  sm: { px: 26, font: 12 },
  md: { px: 30, font: 12 },
  lg: { px: 38, font: 14 },
};

type Props = {
  provider: Provider;
  size?: Size;
  className?: string;
};

export function ProviderAvatar({ provider, size = 'md', className }: Props) {
  const s = SIZES[size];
  return (
    <div
      className={cn('rounded-full flex items-center justify-center shrink-0 font-normal text-white', className)}
      style={{
        width: s.px,
        height: s.px,
        fontSize: s.font,
        background: provider.color,
        color: '#fff',
      }}
    >
      {provider.initials}
    </div>
  );
}
