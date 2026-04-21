import React from 'react';
import { cn } from '@/lib/utils';

const GLASS_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow:
    'rgba(27,45,59,0.06) 0px 1px 2px, ' +
    'rgba(27,45,59,0.03) 0px -1px 1px inset, ' +
    'rgba(27,45,59,0.05) 0px 8px 24px, ' +
    'inset 0 1px 0 rgba(255,255,255,0.90)',
};

type GlassCardProps<T extends React.ElementType = 'div'> = {
  as?: T;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'accentColor' | 'className' | 'style'>;

export function GlassCard<T extends React.ElementType = 'div'>({
  as,
  accentColor,
  className,
  style,
  ...props
}: GlassCardProps<T>) {
  const Tag = (as ?? 'div') as React.ElementType;
  return (
    <Tag
      className={cn('rounded-2xl', className)}
      style={{
        ...GLASS_STYLE,
        ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
