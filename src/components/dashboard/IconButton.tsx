import React from 'react';
import { cn } from '@/lib/utils';

type IconButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'active' | 'ghost';
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};

/**
 * Uniform icon button used in topbar (share, notifications, sidebar toggle),
 * modals (close), and inline actions. Consistent `p-2 rounded-xl` hit-area.
 */
export function IconButton({
  children,
  onClick,
  variant = 'default',
  ariaLabel,
  className,
  style,
  disabled,
}: IconButtonProps) {
  const base: React.CSSProperties = {
    padding: '8px',
    borderRadius: '12px',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, opacity 0.15s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const variants: Record<NonNullable<IconButtonProps['variant']>, React.CSSProperties> = {
    default: {
      background: 'rgba(27,45,59,0.04)',
      border: '1px solid rgba(27,45,59,0.08)',
    },
    active: {
      background: 'rgba(68,114,196,0.10)',
      border: '1px solid rgba(68,114,196,0.22)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn('hover:opacity-80', className)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
