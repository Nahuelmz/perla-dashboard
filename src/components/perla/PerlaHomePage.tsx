import { useState } from 'react';
import { getHours, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Users, MessageCircle, Settings,
  Plus, Bot, BotOff, AlertCircle, Check, X,
  Scissors, Sparkles, Wind, ChevronDown, TrendingUp, TrendingDown,
} from 'lucide-react';

// ─── Design tokens (del brief) ────────────────────────────
const C = {
  teal:      '#2D7A7A',
  tealBg:    'rgba(45,122,122,0.08)',
  tealBorder:'rgba(45,122,122,0.22)',
  arena:     '#A88760',
  arenaBg:   'rgba(168,135,96,0.08)',
  arenaBorder:'rgba(168,135,96,0.22)',
  violeta:   '#5B4B7A',
  violetaBg: 'rgba(91,75,122,0.08)',
  red:       '#B44040',
  redBg:     'rgba(180,60,60,0.07)',
  text:      '#1A2A2E',
  muted:     '#5E6E73',
  border:    '#E4EAEC',
  mineral:   '#F5F7F8',
  white:     '#FFFFFF',
  iris:      'linear-gradient(90deg,#D8B889 0%,#A49A7A 25%,#4F7C80 50%,#4C5A8C 75%,#6B4F99 100%)',
} as const;

const FONT = {
  serif:  '"DM Serif Display", Georgia, serif',
  sans:   '"DM Sans", system-ui, sans-serif',
  mono:   '"JetBrains Mono", monospace',
} as const;

// ─── Types ────────────────────────────────────────────────
type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'no_show';
type ServiceType = 'cut' | 'color' | 'treatment';
type NavTab = 'home' | 'agenda' | 'clients' | 'messages' | 'config';

interface Appointment {
  id: string;
  clientName: string;
  clientInitials: string;
  service: string;
  serviceType: ServiceType;
  duration: number;
  price: number;
  startTime: string;
  status: AppointmentStatus;
  provider: string;
  providerColor: string;
}

// ─── Mock data ────────────────────────────────────────────
const BUSINESS = {
  name: 'Barbería Norte',
  owner: 'Camila',
  initials: 'CN',
  agentActive: true,
};

const TODAY_APPOINTMENTS: Appointment[] = [
  { id: '1', clientName: 'Juan Pérez',       clientInitials: 'JP', service: 'Corte Caballero',    serviceType: 'cut',       duration: 30,  price: 1500, startTime: '09:30', status: 'confirmed', provider: 'José P.',   providerColor: '#C49580' },
  { id: '2', clientName: 'José Ramírez',     clientInitials: 'JR', service: 'Corte Caballero',    serviceType: 'cut',       duration: 30,  price: 1500, startTime: '10:00', status: 'confirmed', provider: 'Ana G.',    providerColor: '#7FA8C4' },
  { id: '3', clientName: 'María García',     clientInitials: 'MG', service: 'Coloración',         serviceType: 'color',     duration: 120, price: 4500, startTime: '11:00', status: 'pending',   provider: 'Ana G.',    providerColor: '#7FA8C4' },
  { id: '4', clientName: 'Carlos Rodríguez', clientInitials: 'CR', service: 'Corte Caballero',    serviceType: 'cut',       duration: 30,  price: 1500, startTime: '13:30', status: 'no_show',   provider: 'Lucas H.',  providerColor: '#6BABA4' },
  { id: '5', clientName: 'Sofía Benítez',    clientInitials: 'SB', service: 'Mechas + Corte',     serviceType: 'color',     duration: 90,  price: 5500, startTime: '15:00', status: 'confirmed', provider: 'Ana G.',    providerColor: '#7FA8C4' },
  { id: '6', clientName: 'Laura Martínez',   clientInitials: 'LM', service: 'Keratina',           serviceType: 'treatment', duration: 120, price: 6000, startTime: '15:30', status: 'cancelled', provider: 'José P.',   providerColor: '#C49580' },
];

const ALERTS = [
  { id: 'a1', type: 'warn' as const,    text: '2 turnos pendientes de confirmar' },
  { id: 'a2', type: 'message' as const, text: '1 mensaje del bot sin resolver — María García' },
];

// ─── Status config ────────────────────────────────────────
const STATUS_CFG: Record<AppointmentStatus, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: 'Confirmado', bg: C.tealBg,    text: C.teal,   dot: C.teal   },
  pending:   { label: 'Pendiente',  bg: C.arenaBg,   text: C.arena,  dot: C.arena  },
  cancelled: { label: 'Cancelado',  bg: 'rgba(94,110,115,0.08)', text: C.muted, dot: '#9AABAF' },
  no_show:   { label: 'No asistió', bg: C.redBg,     text: C.red,    dot: C.red    },
};

// ─── Nav ──────────────────────────────────────────────────
const NAV: { id: NavTab; label: string }[] = [
  { id: 'home',     label: 'Home'          },
  { id: 'agenda',   label: 'Agenda'        },
  { id: 'clients',  label: 'Clientes'      },
  { id: 'messages', label: 'Mensajes'      },
  { id: 'config',   label: 'Config'        },
];

// ─── Small components ─────────────────────────────────────

const Avatar = ({ initials, color, size = 30 }: { initials: string; color: string; size?: number }) => (
  <span style={{
    width: size, height: size, borderRadius: '50%',
    background: color, color: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.36, fontWeight: 600, flexShrink: 0, letterSpacing: '-0.2px',
    fontFamily: FONT.sans, userSelect: 'none',
  }}>
    {initials}
  </span>
);

const StatusPill = ({ status }: { status: AppointmentStatus }) => {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.text,
      padding: '3px 9px 3px 7px', borderRadius: 100,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', fontFamily: FONT.sans,
      border: `1px solid ${cfg.dot}33`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const ServiceIcon = ({ type }: { type: ServiceType }) => {
  const p = { size: 13, strokeWidth: 1.8, color: C.muted };
  if (type === 'cut')   return <Scissors {...p} />;
  if (type === 'color') return <Sparkles {...p} />;
  return <Wind {...p} />;
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    margin: 0,
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: C.muted,
    marginBottom: 8,
  }}>{children}</p>
);

// ─── KPI Stat card ────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  sub?: string;
  accent?: string;
}

const StatCard = ({ label, value, delta, deltaUp, sub, accent = C.teal }: StatCardProps) => (
  <div style={{
    flex: 1, minWidth: 0,
    padding: '16px 18px',
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    display: 'flex', flexDirection: 'column', gap: 6,
  }}>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontFamily: FONT.serif, fontSize: 32, lineHeight: 1, color: C.text, letterSpacing: '-0.03em' }}>
        {value}
      </span>
      {delta && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontFamily: FONT.mono,
          color: deltaUp ? C.teal : C.red,
        }}>
          {deltaUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {delta}
        </span>
      )}
    </div>
    {sub && <p style={{ margin: 0, fontSize: 12, color: C.muted, fontFamily: FONT.sans }}>{sub}</p>}
    <div style={{ height: 2, background: C.iris, opacity: 0.4, borderRadius: 2, marginTop: 4 }} />
  </div>
);

// ─── Upcoming appointment row ─────────────────────────────
const AppRow = ({ app, onConfirm, onCancel }: {
  app: Appointment;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  const muted = app.status === 'cancelled' || app.status === 'no_show';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '56px 1fr auto',
      alignItems: 'center',
      gap: 14,
      padding: '12px 20px',
      borderBottom: `1px solid ${C.border}`,
      background: muted ? 'rgba(94,110,115,0.02)' : C.white,
      transition: 'background 0.15s',
      cursor: 'default',
    }}>
      {/* Time */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 500, color: muted ? C.muted : C.text }}>
          {app.startTime}
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: '#9AABAF', marginTop: 1 }}>
          {app.duration}min
        </div>
      </div>

      {/* Client + service */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <Avatar initials={app.clientInitials} color={muted ? '#B5C0C4' : app.providerColor} size={34} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500, color: muted ? C.muted : C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontFamily: FONT.sans,
          }}>
            {app.clientName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <ServiceIcon type={app.serviceType} />
            <span style={{ fontSize: 12, color: C.muted, fontFamily: FONT.sans }}>
              {app.service}
            </span>
            <span style={{ fontSize: 12, color: '#9AABAF', fontFamily: FONT.mono }}>
              · ${app.price.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Right: status + quick actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <StatusPill status={app.status} />
        {app.status === 'pending' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => onConfirm(app.id)}
              title="Confirmar"
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: C.tealBg, border: `1px solid ${C.tealBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.teal,
              }}>
              <Check size={12} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onCancel(app.id)}
              title="Cancelar"
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: C.redBg, border: '1px solid rgba(180,60,60,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.red,
              }}>
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────
export function PerlaHomePage() {
  const now = new Date();
  const hour = getHours(now);
  const greeting = hour >= 5 && hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr = format(now, "EEEE d 'de' MMMM", { locale: es });
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [appointments, setAppointments] = useState(TODAY_APPOINTMENTS);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const pending   = appointments.filter(a => a.status === 'pending');
  const noShows   = appointments.filter(a => a.status === 'no_show');
  const revenue   = confirmed.reduce((s, a) => s + a.price, 0);
  const activeAlerts = ALERTS.filter(a => !dismissedAlerts.has(a.id));

  const totalMsg = `Hoy tenés ${appointments.length} turnos.${pending.length > 0 ? ` ${pending.length} pendiente${pending.length > 1 ? 's' : ''} de confirmar.` : ' Todo en orden.'}`;

  const handleConfirm = (id: string) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' as const } : a));

  const handleCancel = (id: string) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));

  return (
    <div style={{
      minHeight: '100vh',
      background: C.mineral,
      fontFamily: FONT.sans,
      fontWeight: 300,
      color: C.text,
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* ── Top nav ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, padding: '0 32px',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: C.iris, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: FONT.serif,
            fontSize: 18, letterSpacing: '-0.035em', color: C.text,
          }}>
            {BUSINESS.name}
          </span>
        </div>

        {/* Nav sections */}
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: active ? `1px solid ${C.tealBorder}` : '1px solid transparent',
                  background: active ? C.tealBg : 'transparent',
                  color: active ? C.teal : C.muted,
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  fontFamily: FONT.sans,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: nuevo turno + agent badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.teal, color: '#fff',
            border: 'none', borderRadius: 100,
            padding: '7px 14px 7px 10px',
            fontSize: 13, fontWeight: 500, fontFamily: FONT.sans,
            cursor: 'pointer',
          }}>
            <Plus size={14} strokeWidth={2.5} />
            Nuevo turno
          </button>
          <span style={{
            fontSize: 12, fontWeight: 500,
            color: BUSINESS.agentActive ? C.teal : C.muted,
            background: BUSINESS.agentActive ? C.tealBg : 'rgba(94,110,115,0.08)',
            border: `1px solid ${BUSINESS.agentActive ? C.tealBorder : C.border}`,
            borderRadius: 100, padding: '4px 13px',
            fontFamily: FONT.sans,
          }}>
            perla
          </span>
        </div>
      </nav>

      {/* Iris line below nav */}
      <div style={{ height: 2, background: C.iris, opacity: 0.6 }} />

      {/* ── Page content ─────────────────────────────────── */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* ── Greeting ─────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <Eyebrow>{dateFormatted}</Eyebrow>
          <h1 style={{
            fontFamily: FONT.serif,
            fontSize: 'clamp(36px,5vw,52px)',
            fontWeight: 400,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            color: C.text,
            margin: '0 0 12px',
          }}>
            {greeting}, <em style={{ fontStyle: 'italic', color: C.teal }}>{BUSINESS.owner}</em>
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: C.muted, fontWeight: 300 }}>
            {totalMsg}
          </p>
        </div>

        {/* ── Stats strip ──────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatCard
            label="Turnos hoy"
            value={String(appointments.length)}
            delta="+2 vs. ayer"
            deltaUp
          />
          <StatCard
            label="Confirmados"
            value={String(confirmed.length)}
            sub={`${Math.round(confirmed.length / appointments.length * 100)}% del total`}
            accent={C.teal}
          />
          <StatCard
            label="Pendientes"
            value={String(pending.length)}
            sub={pending.length > 0 ? 'Requieren acción' : 'Sin pendientes'}
            accent={C.arena}
          />
          <StatCard
            label="Facturación"
            value={`$${revenue.toLocaleString('es-AR')}`}
            delta="+12% vs. semana ant."
            deltaUp
            accent={C.violeta}
          />
        </div>

        {/* ── Agent status ─────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px',
          background: BUSINESS.agentActive ? C.tealBg : 'rgba(94,110,115,0.06)',
          border: `1px solid ${BUSINESS.agentActive ? C.tealBorder : C.border}`,
          borderRadius: 10,
          marginBottom: 28,
        }}>
          {BUSINESS.agentActive
            ? <Bot size={16} color={C.teal} />
            : <BotOff size={16} color={C.muted} />}
          <span style={{ fontSize: 13, color: BUSINESS.agentActive ? C.teal : C.muted, fontWeight: 500 }}>
            Asistente {BUSINESS.agentActive ? 'activo' : 'pausado'}
          </span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>
            · Modo automático · Horario 09:00 – 20:00
          </span>
        </div>

        {/* ── Alerts ───────────────────────────────────── */}
        <AnimatePresence>
          {activeAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 28, overflow: 'hidden' }}
            >
              <Eyebrow>Alertas activas</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeAlerts.map(alert => (
                  <div key={alert.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '10px 14px',
                    background: C.arenaBg,
                    border: `1px solid ${C.arenaBorder}`,
                    borderRadius: 9,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <AlertCircle size={14} color={C.arena} />
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 400 }}>{alert.text}</span>
                    </div>
                    <button
                      onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.id]))}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.muted, padding: 2, display: 'flex',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Turnos del día ───────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Eyebrow>Turnos del día</Eyebrow>
            <button style={{
              fontSize: 12, color: C.teal, fontFamily: FONT.sans, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              Ver agenda completa →
            </button>
          </div>

          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {appointments.map((app) => (
              <AppRow
                key={app.id}
                app={app}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
          </div>

          {/* No-show count */}
          {noShows.length > 0 && (
            <p style={{
              margin: '10px 0 0',
              fontSize: 12, color: C.muted, fontFamily: FONT.sans,
            }}>
              <span style={{ color: C.red, fontWeight: 500 }}>{noShows.length} no se presentaron</span>
              {' '}hoy. Considerá hacer seguimiento.
            </p>
          )}
        </div>

      </main>
    </div>
  );
}
