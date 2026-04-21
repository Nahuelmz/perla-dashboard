import React from 'react';
import { AppointmentStatus } from '../generated/types';

const CONFIG: Record<AppointmentStatus, { label: string; bg: string; color: string; dot: string }> = {
  confirmed: { label: 'Confirmado',       bg: 'rgba(67,160,71,0.12)',  color: '#2E7D32', dot: '#43A047' },
  pending:   { label: 'Pendiente',        bg: 'rgba(245,124,0,0.12)',  color: '#E65100', dot: '#F57C00' },
  cancelled: { label: 'Cancelado',        bg: 'rgba(0,0,0,0.06)',      color: '#6b7d74', dot: '#9aada5' },
  no_show:   { label: 'No se presentó',   bg: 'rgba(229,57,53,0.10)',  color: '#C62828', dot: '#E53935' },
};

type Props = {
  status: AppointmentStatus;
  className?: string;
};

export function StatusPill({ status, className }: Props) {
  const c = CONFIG[status];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '0.02em',
        background: c.bg,
        color: c.color,
        flexShrink: 0,
        minWidth: '96px',
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '99px', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

export { CONFIG as STATUS_PILL_CONFIG };
