import React from 'react';

type Props = {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, disabled }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '99px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '2px',
        transition: 'background .2s',
        background: checked ? '#6b8f7e' : 'rgba(61,90,78,0.14)',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '99px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'transform .2s',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          display: 'block',
          flexShrink: 0,
        }}
      />
    </button>
  );
}
