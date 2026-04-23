import React from 'react';
import { cn } from '@/lib/utils';

// Perla-warm glass spec: lighter shadow, tighter blur, teal-tinted border
const GLASS_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.40)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(91,143,166,0.22)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
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
      className={cn(className)}
      style={{
        borderRadius: '18px',
        ...GLASS_STYLE,
        ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
