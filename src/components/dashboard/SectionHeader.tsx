import React from 'react';

const DM_SERIF = "'DM Serif Display', ui-serif, Georgia, serif";

type SectionHeaderProps = {
  title: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Section header used at the top of major screens (Agenda, Mensajes, Clientes, Config, etc.)
 * Renders a h2 title in DM Serif Display + a bottom border + optional right-side action.
 */
export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div
      className={className}
      style={{
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(27,45,59,0.08)',
        marginBottom: '8px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <h2
        style={{
          fontSize: '22px',
          fontWeight: 400,
          color: '#1B2D3B',
          fontFamily: DM_SERIF,
          margin: 0,
          letterSpacing: '-0.005em',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}
