import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import type { AgentActivityItem, AgentState } from '@/components/generated/mockData';

const DM_SERIF = "'DM Serif Display', ui-serif, Georgia, serif";
const DM_SANS = "'DM Sans', ui-sans-serif, system-ui, sans-serif";
const JETBRAINS = "'JetBrains Mono', ui-monospace, monospace";

const T = {
  text: '#1B2D3B',
  text2: '#3F5565',
  text3: '#7A8B99',
  border: 'rgba(27,45,59,0.08)',
  orange: '#4472C4',
  sage: '#4472C4',
};

type PerlaStatusPanelProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onOpenBotSettings?: () => void;
  status: { state: AgentState; subtitle: string };
  stats: { turnos: number; mensajes: number; confirmRate: number };
  activity: AgentActivityItem[];
};

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

export function PerlaStatusPanel({
  open,
  onClose,
  anchorRef,
  onOpenBotSettings,
  status,
  stats,
  activity,
}: PerlaStatusPanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Desktop: close on outside click (but not clicks on the anchor itself — anchor toggles)
  useEffect(() => {
    if (!open || isMobile) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    // Defer listener install by one tick so the opening click doesn't trigger it
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onClick);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, isMobile, anchorRef, onClose]);

  if (!open) return null;

  const isActive = status.state === 'active';

  const Content = (
    <>
      {/* Header: status */}
      <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isActive ? T.sage : '#F57C00',
              boxShadow: isActive ? `0 0 0 3px ${T.sage}22` : 'none',
              animation: isActive ? 'sagePulse 2.4s ease-in-out infinite' : 'none',
              display: 'inline-block',
            }}
          />
          <span style={{ fontFamily: DM_SANS, fontSize: 13, fontWeight: 500, color: T.text }}>
            {isActive ? 'Activo' : 'Pausado'}
          </span>
        </div>
        <p style={{ margin: '6px 0 0', fontFamily: DM_SANS, fontSize: 12, color: T.text3 }}>
          {status.subtitle}
        </p>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          padding: '18px 10px',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {[
          { value: stats.turnos.toString(), label: 'turnos' },
          { value: stats.mensajes.toString(), label: 'msjs' },
          { value: `${stats.confirmRate}%`, label: 'confirm.' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: DM_SERIF,
                fontSize: 26,
                lineHeight: 1,
                color: T.text,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: DM_SANS,
                fontSize: 9.5,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: T.text3,
              }}
            >
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div style={{ padding: '14px 18px' }}>
        <div
          style={{
            fontFamily: DM_SANS,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: T.text3,
            marginBottom: 10,
          }}
        >
          Actividad reciente
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {activity.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 10,
                padding: '6px 0',
                fontFamily: DM_SANS,
                fontSize: 12.5,
                color: T.text2,
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              <span
                style={{
                  fontFamily: JETBRAINS,
                  fontSize: 10.5,
                  color: T.text3,
                  flexShrink: 0,
                }}
              >
                {item.timeAgo}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer link */}
      {onOpenBotSettings && (
        <button
          onClick={() => {
            onClose();
            onOpenBotSettings();
          }}
          style={{
            width: '100%',
            borderTop: `1px solid ${T.border}`,
            padding: '12px 18px',
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            fontFamily: DM_SANS,
            fontSize: 12,
            color: T.text3,
            cursor: 'pointer',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = T.text;
            e.currentTarget.style.background = 'rgba(27,45,59,0.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.text3;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Configurar agente →
        </button>
      )}
    </>
  );

  if (isMobile) {
    // IMPORTANT: render the sheet via a portal to document.body.
    // The topbar uses `backdrop-filter` for its glass effect, and that CSS
    // property creates a new containing block for `position: fixed` descendants,
    // which would otherwise anchor the sheet to the topbar instead of the viewport.
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="anim-fade-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27,45,59,0.32)',
            zIndex: 60,
          }}
        />
        {/* Sheet */}
        <div
          ref={panelRef}
          className="anim-slide-up-sheet"
          role="dialog"
          aria-label="Estado del agente Perla"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '75vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: '0 -8px 40px rgba(27,45,59,0.18)',
            zIndex: 61,
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          }}
        >
          {/* Grab handle */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(27,45,59,0.18)' }} />
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: T.text3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} weight="regular" />
          </button>
          {Content}
        </div>
      </>,
      document.body
    );
  }

  // Desktop popover
  return (
    <div
      ref={panelRef}
      className="anim-float-in"
      role="dialog"
      aria-label="Estado del agente Perla"
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        left: 0,
        width: 320,
        background: '#ffffff',
        borderRadius: 14,
        border: `1px solid ${T.border}`,
        boxShadow: '0 8px 40px rgba(27,45,59,0.14), 0 1px 3px rgba(27,45,59,0.06)',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {Content}
    </div>
  );
}

export default PerlaStatusPanel;
