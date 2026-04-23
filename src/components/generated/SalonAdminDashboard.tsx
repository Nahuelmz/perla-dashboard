import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { House, Users, Gear, Bell, Plus, CaretDown, CaretLeft, CaretRight, X, Scissors, Clock, Lock, Eye, CheckCircle, XCircle, Warning, CalendarCheck, Phone, ChatCircle, PaintBrush, Wind, Sparkle, MagicWand, Smiley, Drop, FloppyDisk, Trash, SignOut, ShareNetwork, Copy, Check, MagnifyingGlass, UserPlus, CreditCard, Question, Envelope, ChatCircleDots, Funnel, CalendarBlank, ArrowRight, List, Buildings, User, SidebarSimple, TrendUp, TrendDown, Calendar, Heart, CurrencyDollar } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfToday, isSameDay, startOfWeek, addWeeks, subWeeks, getHours, addDays, subDays, startOfMonth, endOfMonth, isToday, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Service, Appointment, Client, BlockedSlot, TimeRange, AppointmentStatus, Provider, NavTab, Message, UserProfile } from './types';
import { INITIAL_SERVICES, INITIAL_APPOINTMENTS, INITIAL_CLIENTS, INITIAL_BLOCKED_SLOTS, DAYS_ORDER, DAY_NAMES, INITIAL_PROVIDERS, INITIAL_MESSAGES, T, agentStatus, agentDailyStats, agentActivity } from './mockData';
import { LoginScreen } from './LoginScreen';
import { GlassCard, StatusPill, ProviderAvatar, Toggle, PerlaWordmark, IconButton, SectionHeader, PerlaStatusPanel } from '@/components/dashboard';
const inp = 'w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]/40 transition-colors';
const inpStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(61,90,78,0.08)',
  color: '#2a3d35'
};
const lbl = 'text-[12px] font-normal uppercase tracking-wider text-[#6b7d74] mb-1 block';
const OPENING_HOURS = "'Opening Hours Sans', ui-sans-serif, system-ui, sans-serif";
const DM_SANS = "'DM Sans', 'Opening Hours Sans', ui-sans-serif, system-ui, sans-serif";
const BRICOLAGE = OPENING_HOURS;
const GEIST_MONO = "'Geist', ui-monospace, monospace";
const INSTRUMENT_SERIF = "'DM Serif Display', 'Fraunces', ui-serif, Georgia, serif";
const DM_SERIF = "'DM Serif Display', ui-serif, Georgia, serif";
const JETBRAINS = "'JetBrains Mono', ui-monospace, monospace";
const CHIP_BASE: React.CSSProperties = { display: 'inline-flex', alignItems: 'baseline', gap: '2px', padding: '1px 7px 2px', borderRadius: '5px', fontWeight: 700, lineHeight: 1, verticalAlign: 'middle', border: '1px solid transparent', whiteSpace: 'nowrap', fontFamily: GEIST_MONO };
const CHIP_BLUE: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(59,130,246,0.07)', borderColor: 'rgba(59,130,246,0.16)', color: '#2563EB' };
const CHIP_GREEN: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.18)', color: '#059669' };
const CHIP_TEAL: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(68,114,196,0.09)', borderColor: 'rgba(68,114,196,0.22)', color: '#4A7A94' };
const CHIP_VAL: React.CSSProperties = { fontSize: '15px', letterSpacing: '-0.03em' };
const CHIP_UNIT: React.CSSProperties = { fontSize: '12px', fontWeight: 400, opacity: 0.75 };
const BG_MESH = '#f6f8fa';
const GlowBackground = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'url(/serubg2.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }} />
);
const CONTAINER_STYLE: React.CSSProperties = {
  maxWidth: '960px',
  margin: '0 auto',
  width: '100%',
  padding: '0 32px',
  boxSizing: 'border-box'
};
const SAGE = '#4472C4';
const SAGE_GRAD = 'linear-gradient(135deg, #4472C4, #98BAE8)';
const CONTENT_GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.40)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '18px',
  border: '1px solid rgba(68,114,196,0.22)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
};
const CARD_GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.40)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
  border: '1px solid rgba(91,143,166,0.22)',
  borderRadius: '18px'
};
const toMins = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fromMins = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const getDynamicGreeting = () => {
  const h = getHours(new Date());
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};
const STATUS_CONFIG: Record<AppointmentStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  confirmed: {
    label: 'Confirmado',
    bg: 'rgba(67,160,71,0.12)',
    text: '#2E7D32',
    dot: '#43A047'
  },
  pending: {
    label: 'Pendiente',
    bg: 'rgba(245,124,0,0.12)',
    text: '#E65100',
    dot: '#F57C00'
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'rgba(0,0,0,0.07)',
    text: '#6b7d74',
    dot: '#9aada5'
  },
  no_show: {
    label: 'No se presentó',
    bg: 'rgba(229,57,53,0.10)',
    text: '#C62828',
    dot: '#E53935'
  }
};
const NAV_ITEMS: {
  id: NavTab;
  icon: React.ElementType;
  label: string;
}[] = [{
  id: 'home',
  icon: House,
  label: 'Inicio'
}, {
  id: 'agenda',
  icon: CalendarBlank,
  label: 'Agenda'
}, {
  id: 'clients',
  icon: Users,
  label: 'Clientes'
}, {
  id: 'messages',
  icon: ChatCircleDots,
  label: 'Mensajes'
}, {
  id: 'config',
  icon: Gear,
  label: 'Config.'
}];
const SERVICE_ICONS: {
  keywords: string[];
  icon: React.ElementType;
}[] = [{
  keywords: ['corte', 'caball', 'dam'],
  icon: Scissors
}, {
  keywords: ['color', 'tinte', 'mechas', 'balayage', 'decoloración'],
  icon: PaintBrush
}, {
  keywords: ['keratina', 'alisado', 'lacio'],
  icon: Wind
}, {
  keywords: ['maquillaje', 'makeup'],
  icon: Sparkle
}, {
  keywords: ['uña', 'manicur', 'pedicur'],
  icon: MagicWand
}, {
  keywords: ['facial', 'limpieza', 'hidratación'],
  icon: Drop
}, {
  keywords: ['cejas', 'pestañas', 'depilación'],
  icon: Smiley
}];
const getServiceIcon = (name: string): React.ElementType => {
  const lower = name.toLowerCase();
  for (const entry of SERVICE_ICONS) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.icon;
  }
  return Scissors;
};
type NotifPriority = 'urgent' | 'alert' | 'info';
type Notif = {
  id: string;
  priority: NotifPriority;
  title: string;
  body: string;
  time: string;
};
const NOTIFS: Notif[] = [{
  id: 'n1',
  priority: 'urgent',
  title: 'Turno sin confirmar',
  body: 'María García — Coloración · hoy 11:00',
  time: 'Hace 10 min'
}, {
  id: 'n2',
  priority: 'urgent',
  title: 'No se presentó',
  body: 'Carlos Rodríguez — martes pasado',
  time: 'Hace 2 h'
}, {
  id: 'n3',
  priority: 'alert',
  title: 'Turno en 30 min',
  body: 'Juan Pérez — Corte Caballero · 09:30',
  time: 'Hace 5 min'
}, {
  id: 'n4',
  priority: 'alert',
  title: 'Slot bloqueado',
  body: 'Viernes 12:00–14:00 · Almuerzo extendido',
  time: 'Ayer'
}, {
  id: 'n5',
  priority: 'info',
  title: 'Nuevo turno agendado',
  body: 'Laura Martínez reservó Mechas + Corte',
  time: 'Hace 1 h'
}, {
  id: 'n6',
  priority: 'info',
  title: 'Semana completada',
  body: '5 turnos · $12.000 facturados',
  time: 'Hace 3 h'
}];
const NOTIF_DOT: Record<NotifPriority, string> = {
  urgent: '#E53935',
  alert: '#F57C00',
  info: '#43A047'
};
const COLOR_OPTIONS = [{
  label: 'Terracota',
  hex: '#C2896C'
}, {
  label: 'Azul',
  hex: '#3B82F6'
}, {
  label: 'Violeta',
  hex: '#8B5CF6'
}, {
  label: 'Verde',
  hex: '#10B981'
}, {
  label: 'Rosa',
  hex: '#EC4899'
}, {
  label: 'Gris',
  hex: '#6B7280'
}];

// ─── Overlap layout ───────────────────────────────────────────────────────────
type LayoutApp = {
  app: Appointment;
  col: number;
  totalCols: number;
  startMins: number;
  endMins: number;
};
const computeOverlapLayout = (apps: Appointment[], svcs: Service[]): LayoutApp[] => {
  if (apps.length === 0) return [];
  const enriched = apps.map(app => {
    const svc = svcs.find(s => s.id === app.serviceId);
    const startMins = toMins(app.startTime);
    const endMins = startMins + (svc?.duration ?? 30);
    return {
      app,
      startMins,
      endMins,
      col: 0,
      totalCols: 1
    };
  }).sort((a, b) => a.startMins - b.startMins);
  const groups: LayoutApp[][] = [];
  const assigned = new Set<string>();
  for (const item of enriched) {
    if (assigned.has(item.app.id)) continue;
    const group: LayoutApp[] = [item];
    assigned.add(item.app.id);
    let i = 0;
    while (i < group.length) {
      const cur = group[i];
      for (const other of enriched) {
        if (assigned.has(other.app.id)) {
          i++;
          continue;
        }
        if (cur.startMins < other.endMins && other.startMins < cur.endMins) {
          group.push(other);
          assigned.add(other.app.id);
        }
      }
      i++;
    }
    groups.push(group);
  }
  const result: LayoutApp[] = [];
  for (const group of groups) {
    const sorted = group.slice().sort((a, b) => a.startMins - b.startMins);
    const colEnds: number[] = [];
    for (const item of sorted) {
      let col = colEnds.findIndex(end => end <= item.startMins);
      if (col === -1) col = colEnds.length;
      colEnds[col] = item.endMins;
      item.col = col;
    }
    const totalCols = colEnds.length;
    for (const item of sorted) {
      item.totalCols = totalCols;
      result.push(item);
    }
  }
  return result;
};

// ─── ProviderChip ──────────────────────────────────────────────────────────────
const ProviderChip = ({
  provider,
  size = 'sm'
}: {
  provider: Provider;
  size?: 'sm' | 'xs';
}) => <span className={cn('inline-flex items-center justify-center font-normal rounded-full shrink-0', size === 'xs' ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[12px]')} style={{
  background: provider.color ?? SAGE,
  color: '#fff'
}} title={provider.name}>{provider.initials}</span>;

// ─── Toast ─────────────────────────────────────────────────────────────────────
const ToastContext = React.createContext<(msg: string) => void>(() => {});
const ToastProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState<{
    id: string;
    msg: string;
  }[]>([]);
  const showToast = useCallback((msg: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, {
      id,
      msg
    }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return <ToastContext.Provider value={showToast}>
    {children}
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => <motion.div key={t.id} initial={{
          opacity: 0,
          y: 12,
          scale: 0.95
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: -8,
          scale: 0.95
        }} className="px-4 py-2.5 rounded-xl text-sm font-normal text-white shadow-xl whitespace-nowrap" style={{
          background: T.dark
        }}>{t.msg}</motion.div>)}
      </AnimatePresence>
    </div>
  </ToastContext.Provider>;
};

// ─── DrawerOverlay ─────────────────────────────────────────────────────────────
const DrawerOverlay = ({
  children,
  onClose,
  wide
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) => <motion.div initial={{
  opacity: 0
}} animate={{
  opacity: 1
}} exit={{
  opacity: 0
}} className="fixed inset-0 z-40 flex md:flex-row flex-col-reverse">
    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{
    x: '100%'
  }} animate={{
    x: 0
  }} exit={{
    x: '100%'
  }} transition={{
    type: 'spring',
    damping: 28,
    stiffness: 280
  }} className="hidden md:flex flex-col h-full shadow-2xl" style={{
    width: wide ? '480px' : '380px',
    borderLeft: `1px solid ${T.border}`,
    background: '#ffffff'
  }}>
      {children}
    </motion.div>
    <motion.div initial={{
    y: '100%'
  }} animate={{
    y: 0
  }} exit={{
    y: '100%'
  }} transition={{
    type: 'spring',
    damping: 28,
    stiffness: 280
  }} className="md:hidden w-full rounded-t-3xl shadow-2xl flex flex-col" style={{
    maxHeight: '92vh',
    background: '#ffffff'
  }}>
      <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full" style={{
        background: 'rgba(0,0,0,0.12)'
      }} /></div>
      {children}
    </motion.div>
  </motion.div>;

// ─── ModalOverlay ──────────────────────────────────────────────────────────────
const ModalOverlay = ({
  children,
  onClose,
  maxW = '400px'
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxW?: string;
}) => <motion.div initial={{
  opacity: 0
}} animate={{
  opacity: 1
}} exit={{
  opacity: 0
}} className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{
    y: 40,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} exit={{
    y: 40,
    opacity: 0
  }} className="relative w-full rounded-t-3xl md:rounded-2xl shadow-2xl p-6 overflow-y-auto" style={{
    maxWidth: maxW,
    maxHeight: '92vh',
    border: `1px solid ${T.border}`,
    background: '#ffffff'
  }}>
      <div className="md:hidden flex justify-center mb-4"><div className="w-10 h-1 rounded-full" style={{
        background: 'rgba(0,0,0,0.12)'
      }} /></div>
      {children}
    </motion.div>
  </motion.div>;

// ─── NotifItem ─────────────────────────────────────────────────────────────────
const NotifItem = ({
  n
}: {
  n: Notif;
}) => {
  const [expanded, setExpanded] = useState(false);
  const showToast = React.useContext(ToastContext);
  const isConfirmType = n.title.toLowerCase().includes('sin confirmar');
  const isNoShowType = n.title.toLowerCase().includes('no se presentó');
  return <div onClick={() => setExpanded(e => !e)} className="flex items-start gap-3 px-4 py-5 cursor-pointer transition-colors" style={{
    background: expanded ? T.orangeLight : 'transparent',
    borderBottom: `1px solid ${T.border}`
  }}>
    <div className="mt-1.5 shrink-0"><span className="w-2 h-2 rounded-full block" style={{
        background: NOTIF_DOT[n.priority]
      }} /></div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-normal" style={{
        color: T.text
      }}>{n.title}</p>
      <p className="text-xs mt-0.5 font-normal" style={{
        color: T.text2
      }}>{n.body}</p>
      {n.priority === 'urgent' && <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
        {isConfirmType && <button onClick={() => showToast('✓ Turno confirmado')} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-normal text-white" style={{
          background: '#43A047'
        }}><CheckCircle className="w-3 h-3" /><span>Confirmar turno</span></button>}
        {isNoShowType && <button onClick={() => showToast('Marcado como no-show')} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-normal" style={{
          background: 'rgba(245,124,0,0.12)',
          color: '#E65100'
        }}><Warning className="w-3 h-3" /><span>Marcar no-show</span></button>}
      </div>}
      {expanded && n.priority !== 'urgent' && <p className="text-[12px] mt-1 font-normal" style={{
        color: T.orange
      }}>Marcar como leída</p>}
      <p className="text-[12px] mt-1 font-normal" style={{
        color: T.text3
      }}>{n.time}</p>
    </div>
    <CaretDown className="w-3.5 h-3.5 shrink-0 mt-1" style={{
      color: T.text3,
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.15s'
    }} />
  </div>;
};

// ─── HOME AGENDA GRID ──────────────────────────────────────────────────────────
const HOME_HOUR_START = 8,
  HOME_HOUR_END = 20,
  HOME_PX_PER_MIN = 2.0;
const HOME_HOUR_LABELS = Array.from({
  length: HOME_HOUR_END - HOME_HOUR_START + 1
}, (_, i) => `${String(HOME_HOUR_START + i).padStart(2, '0')}:00`);
type HomeAgendaGridProps = {
  apps: Appointment[];
  services: Service[];
  providerMap: Record<string, Provider>;
  onAppointmentClick: (a: Appointment) => void;
  onAddAppointment: (date?: Date, time?: string) => void;
  targetDate: Date;
};
const HomeAgendaGrid = ({
  apps,
  services,
  providerMap,
  onAppointmentClick,
  onAddAppointment,
  targetDate
}: HomeAgendaGridProps) => {
  const activeApps = apps.filter(a => a.status !== 'cancelled');
  const layout = computeOverlapLayout(activeApps, services);
  const totalH = (HOME_HOUR_END - HOME_HOUR_START) * 60 * HOME_PX_PER_MIN;
  const [hoverMins, setHoverMins] = useState<number | null>(null);
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mins = Math.round((e.clientY - rect.top) / HOME_PX_PER_MIN / 30) * 30 + HOME_HOUR_START * 60;
    const h = Math.floor(mins / 60),
      m = mins % 60;
    onAddAppointment(targetDate, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };
  const hoverTop = hoverMins !== null ? (hoverMins - HOME_HOUR_START * 60) * HOME_PX_PER_MIN : null;
  const hoverLabel = hoverMins !== null ? `${String(Math.floor(hoverMins / 60)).padStart(2, '0')}:${String(hoverMins % 60).padStart(2, '0')}` : '';
  const isSlotOccupied = hoverMins !== null && layout.some(({
    startMins,
    endMins
  }) => hoverMins >= startMins && hoverMins < endMins);
  if (apps.length === 0) return <div onClick={() => onAddAppointment(startOfToday(), '09:00')} className="flex flex-col items-center justify-center py-12 rounded-xl cursor-pointer mx-3 my-3" style={{
    border: '2px dashed rgba(0,0,0,0.08)'
  }}>
    <Plus className="w-8 h-8 mb-2" style={{
      color: T.text3,
      opacity: 0.4
    }} />
    <p className="text-sm font-normal" style={{
      color: T.text3
    }}>Sin turnos hoy</p>
    <p className="text-xs mt-0.5" style={{
      color: T.text3,
      opacity: 0.6
    }}>Toca para agregar</p>
  </div>;
  return <div className="flex flex-1 overflow-y-auto">
    <div className="shrink-0 relative" style={{
      width: '40px',
      height: `${totalH}px`
    }}>
      {HOME_HOUR_LABELS.map(label => <div key={label} className="absolute w-full flex items-start justify-end pr-1.5" style={{
        top: `${(parseInt(label) - HOME_HOUR_START) * 60 * HOME_PX_PER_MIN}px`
      }}><span className="text-[11px] font-normal -translate-y-2 block" style={{
          color: T.text3
        }}>{label}</span></div>)}
    </div>
    <div className="flex-1 relative cursor-pointer" style={{
      height: `${totalH}px`,
      minHeight: `${totalH}px`
    }} onClick={handleGridClick} onMouseMove={e => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverMins(Math.round((e.clientY - rect.top) / HOME_PX_PER_MIN / 30) * 30 + HOME_HOUR_START * 60);
    }} onMouseLeave={() => setHoverMins(null)}>
      {HOME_HOUR_LABELS.map(label => <div key={label} className="absolute w-full border-t" style={{
        top: `${(parseInt(label) - HOME_HOUR_START) * 60 * HOME_PX_PER_MIN}px`,
        borderColor: 'rgba(0,0,0,0.06)'
      }} />)}
      {HOME_HOUR_LABELS.slice(0, -1).map(label => <div key={`h-${label}`} className="absolute w-full border-t" style={{
        top: `${(parseInt(label) - HOME_HOUR_START) * 60 * HOME_PX_PER_MIN + 30 * HOME_PX_PER_MIN}px`,
        borderColor: 'rgba(0,0,0,0.03)'
      }} />)}
      {hoverTop !== null && !isSlotOccupied && <div className="absolute inset-x-0.5 rounded-lg flex items-center justify-center pointer-events-none select-none" style={{
        top: `${hoverTop}px`,
        height: `${30 * HOME_PX_PER_MIN}px`,
        background: 'rgba(107,143,126,0.07)',
        border: `1.5px dashed ${SAGE}`,
        zIndex: 5
      }}>
        <span className="text-[12px] font-normal" style={{
          color: T.text3
        }}>+ Agregar {hoverLabel}</span>
      </div>}
      {layout.map(({
        app,
        col,
        totalCols,
        startMins,
        endMins
      }) => {
        const svc = services.find(s => s.id === app.serviceId);
        const prov = providerMap[app.providerId];
        const sc = STATUS_CONFIG[app.status];
        const color = svc?.color ?? T.orange;
        const top = (startMins - HOME_HOUR_START * 60) * HOME_PX_PER_MIN;
        const height = Math.max((endMins - startMins) * HOME_PX_PER_MIN, 28);
        const gap = 2,
          widthPct = 100 / totalCols,
          leftPct = col / totalCols * 100;
        return <button key={app.id} onClick={e => {
          e.stopPropagation();
          onAppointmentClick(app);
        }} className="absolute rounded-xl overflow-hidden text-left transition-all hover:brightness-95 hover:shadow-md border-l-[3px]" style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `calc(${leftPct}% + ${col === 0 ? 0 : gap}px)`,
          width: `calc(${widthPct}% - ${col === 0 ? gap / 2 : gap * 1.5}px - ${col === totalCols - 1 ? gap / 2 : 0}px)`,
          background: `${color}0f`,
          borderLeftColor: `${color}33`,
          boxShadow: totalCols > 1 ? `0 1px 6px ${color}22` : 'none'
        }}>
          <div className="px-2 pt-1.5 pb-1 h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[13px] font-normal" style={{
                color
              }}>{app.startTime}</span>
              {prov && <span className="inline-flex items-center justify-center rounded-full text-white font-normal shrink-0" style={{
                width: '16px',
                height: '16px',
                fontSize: '8px',
                background: prov.color ?? SAGE
              }} title={prov.name}>{prov.initials}</span>}
            </div>
            {height > 28 && <p className="text-[14px] font-normal truncate leading-tight mt-0.5" style={{
              color: T.text
            }}>{app.clientName}</p>}
            {height > 52 && <p className="text-[12px] truncate font-normal leading-tight" style={{
              color: T.text2
            }}>{svc?.name}</p>}
            {height > 72 && <span className="mt-auto text-[11px] font-normal px-1.5 py-0.5 rounded-full self-start shrink-0" style={{
              background: sc.bg,
              color: sc.text
            }}>{sc.label}</span>}
          </div>
        </button>;
      })}
    </div>
  </div>;
};

// ─── WEEK VIEW ─────────────────────────────────────────────────────────────────
const HOUR_START = 8,
  HOUR_END = 20,
  HOUR_H = 110;
const HOUR_LABELS = Array.from({
  length: HOUR_END - HOUR_START + 1
}, (_, i) => `${String(HOUR_START + i).padStart(2, '0')}:00`);
function layoutWeekApps(apps: Appointment[], services: Service[]): Record<string, { col: number; totalCols: number }> {
  const getEnd = (a: Appointment) => toMins(a.startTime) + (services.find(s => s.id === a.serviceId)?.duration ?? 30);
  const sorted = [...apps].sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
  const colOf: Record<string, number> = {};
  const colEnds: number[] = [];
  for (const app of sorted) {
    const start = toMins(app.startTime);
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= start) { colOf[app.id] = c; colEnds[c] = getEnd(app); placed = true; break; }
    }
    if (!placed) { colOf[app.id] = colEnds.length; colEnds.push(getEnd(app)); }
  }
  const result: Record<string, { col: number; totalCols: number }> = {};
  for (const app of sorted) {
    const concurrent = sorted.filter(b => toMins(b.startTime) < getEnd(app) && getEnd(b) > toMins(app.startTime));
    const maxCol = Math.max(...concurrent.map(b => colOf[b.id]));
    result[app.id] = { col: colOf[app.id], totalCols: maxCol + 1 };
  }
  return result;
}
const WEEK_OFFSETS = [0, 1, 2, 3, 4, 5, 6];
type WeekViewProps = {
  weekStart: Date;
  filteredApps: Appointment[];
  blockedSlots: BlockedSlot[];
  services: Service[];
  providerMap: Record<string, Provider>;
  onAppointmentClick: (a: Appointment) => void;
  onCellClick: (date: Date, time: string) => void;
  setWeekStart: (d: Date) => void;
};
const WeekView = ({
  weekStart,
  filteredApps,
  blockedSlots,
  services,
  providerMap,
  onAppointmentClick,
  onCellClick,
  setWeekStart
}: WeekViewProps) => {
  const weekDays = useMemo(() => WEEK_OFFSETS.map(i => addDays(weekStart, i)), [weekStart]);
  const getAppsForDay = (d: Date) => filteredApps.filter(a => isSameDay(a.date, d));
  const getBlocksForDay = (d: Date) => blockedSlots.filter(b => isSameDay(b.date, d));
  const calcTop = (t: string) => (toMins(t) - HOUR_START * 60) / 60 * HOUR_H;
  const calcH = (dur: number) => dur / 60 * HOUR_H;
  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const snapped = Math.round(((e.clientY - rect.top) / HOUR_H * 60 + HOUR_START * 60) / 30) * 30;
    onCellClick(day, fromMins(snapped));
  };
  return <div className="flex flex-col" style={{
    height: '100%'
  }}>
    <div className="shrink-0 flex items-center gap-2 flex-wrap shrink-0" style={{
      borderBottom: `1px solid ${T.border}`,
      background: T.bg
    }}>
      <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretLeft className="w-3.5 h-3.5" style={{
          color: T.text2
        }} /></button>
      <span className="text-xs font-normal px-1 capitalize whitespace-nowrap" style={{
        color: T.text2
      }}>{format(weekStart, 'd MMM', {
          locale: es
        })} – {format(addDays(weekStart, 6), 'd MMM yyyy', {
          locale: es
        })}</span>
      <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretRight className="w-3.5 h-3.5" style={{
          color: T.text2
        }} /></button>
    </div>
    <div className="shrink-0 flex" style={{
      background: '#ffffff',
      borderBottom: `1px solid ${T.border}`
    }}>
      <div className="shrink-0 border-r" style={{
        width: '44px',
        borderColor: T.border,
      }} />
      {weekDays.map(day => {
        const dayApps = getAppsForDay(day);
        const pendingCount = dayApps.filter(a => a.status === 'pending').length;
        return (
          <div key={day.toISOString()} className="flex-1 py-2 px-1 text-center border-l relative" style={{
            borderColor: T.border,
            background: isToday(day) ? T.orangePale : 'transparent'
          }} onClick={e => e.stopPropagation()}>
            <p className="text-[12px] uppercase tracking-widest font-normal" style={{
              color: T.text3
            }}>{format(day, 'EEE', {
                locale: es
              })}</p>
            <div className="text-sm font-normal mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full" style={{
              background: isToday(day) ? T.orange : 'transparent',
              color: isToday(day) ? '#fff' : T.text
            }}>
              {format(day, 'd', {
                locale: es
              })}
            </div>
            {/* Pending pill — solo si hay items pendientes */}
            {pendingCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); /* TODO: filter pendings on click */ }}
                title={`${pendingCount} sin confirmar`}
                className="mt-1 mx-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors hover:opacity-90"
                style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)', cursor: 'pointer' }}
              >
                <Warning size={9} weight="fill" />
                <span>{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', scrollbarWidth: 'thin', scrollbarColor: 'rgba(68,114,196,0.3) transparent' }}>
      <div className="flex" style={{
        height: `${(HOUR_END - HOUR_START) * HOUR_H}px`
      }}>
        <div className="shrink-0 relative border-r" style={{
          width: '44px',
          borderColor: T.border
        }}>
          {HOUR_LABELS.map(label => <div key={label} className="absolute w-full flex items-start justify-end pr-1.5" style={{
            top: `${(parseInt(label) - HOUR_START) * HOUR_H}px`
          }}><span className="text-[11px] font-normal -translate-y-2 leading-none" style={{
              color: T.text3
            }}>{label}</span></div>)}
        </div>
        {weekDays.map(day => {
          const dayApps = getAppsForDay(day);
          const dayBlocks = getBlocksForDay(day);
          return <div key={day.toISOString()} className="flex-1 relative cursor-pointer" style={{
            borderColor: T.border,
            background: isToday(day) ? T.orangePale : 'transparent'
          }} onClick={e => handleCellClick(e, day)}>
            {HOUR_LABELS.map(label => <div key={label} className="absolute w-full border-t" style={{
              top: `${(parseInt(label) - HOUR_START) * HOUR_H}px`,
              borderColor: 'rgba(0,0,0,0.06)'
            }} />)}
            {HOUR_LABELS.slice(0, -1).map(label => <div key={`h-${label}`} className="absolute w-full border-t" style={{
              top: `${(parseInt(label) - HOUR_START) * HOUR_H + HOUR_H / 2}px`,
              borderColor: 'rgba(0,0,0,0.03)'
            }} />)}
            {dayBlocks.map(b => {
              const top = calcTop(b.start);
              const height = calcH(toMins(b.end) - toMins(b.start));
              return <div key={b.id} className="absolute inset-x-0.5 rounded-md overflow-hidden z-10 px-1.5 pt-1" style={{
                top: `${top}px`,
                height: `${Math.max(height, 20)}px`,
                background: 'repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0 4px,#f1f5f9 4px,#f1f5f9 10px)',
                border: '1px solid #cbd5e1'
              }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="text-[13px] text-slate-600 font-normal truncate">
                    {b.reason || 'Bloqueado'}
                  </span>
                </div>
              </div>;
            })}
            {(() => {
              const dayLayout = layoutWeekApps(dayApps, services);
              return dayApps.map(app => {
                const svc = services.find(s => s.id === app.serviceId);
                const prov = providerMap[app.providerId];
                const top = calcTop(app.startTime);
                const height = calcH(svc?.duration ?? 30);
                const color = svc?.color ?? T.orange;
                const { col, totalCols } = dayLayout[app.id] ?? { col: 0, totalCols: 1 };
                const leftPct = (col / totalCols) * 100;
                const widthPct = (1 / totalCols) * 100;
                return <button key={app.id} onClick={e => {
                  e.stopPropagation();
                  onAppointmentClick(app);
                }} className="absolute rounded-md overflow-hidden text-left z-20 transition-all hover:brightness-95 hover:shadow-md border-l-4" style={{
                  top: `${top}px`,
                  height: `${Math.max(height, 28)}px`,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                  background: `${color}12`,
                  borderLeftColor: color,
                }}>
                    <div className="px-1.5 pt-1 h-full flex flex-col overflow-hidden">
                      <p className="text-[11px] font-normal leading-none mb-0.5" style={{ color }}>{app.startTime}</p>
                      {height > 36 && <p className="text-[12px] font-normal truncate leading-tight" style={{ color: T.text }}>{app.clientName}</p>}
                      {height > 55 && svc && <p className="text-[11px] truncate leading-tight" style={{ color: T.text3 }}>{svc.name}</p>}
                      {height > 70 && prov && <div className="mt-auto mb-0.5"><ProviderChip provider={prov} size="xs" /></div>}
                    </div>
                  </button>;
              });
            })()}
          </div>;
        })}
      </div>
    </div>
  </div>;
};

// ─── MONTH VIEW ────────────────────────────────────────────────────────────────
type MonthViewProps = {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  filteredApps: Appointment[];
  services: Service[];
  onSwitchToDay: (d: Date) => void;
};
const MonthView = ({
  selectedDate,
  setSelectedDate,
  filteredApps,
  services,
  onSwitchToDay
}: MonthViewProps) => {
  const monthStart = startOfMonth(selectedDate),
    monthEnd = endOfMonth(selectedDate);
  const calStart = startOfWeek(monthStart, {
    weekStartsOn: 1
  });
  const monthDays: Date[] = [];
  let cur = calStart;
  while (cur <= monthEnd || monthDays.length % 7 !== 0) {
    monthDays.push(cur);
    cur = addDays(cur, 1);
    if (monthDays.length > 42) break;
  }
  const getAppsForDay = (d: Date) => filteredApps.filter(a => isSameDay(a.date, d));
  const numRows = monthDays.length / 7;
  return <div className="h-full flex flex-col overflow-hidden" style={{ padding: '12px 16px 28px' }}>
    {/* Header */}
    <div className="shrink-0 flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        <button onClick={() => setSelectedDate(subDays(startOfMonth(selectedDate), 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretLeft className="w-4 h-4" style={{ color: T.text2 }} /></button>
        <span className="text-sm font-normal px-2 capitalize" style={{ color: T.text }}>{format(selectedDate, 'MMMM yyyy', { locale: es })}</span>
        <button onClick={() => setSelectedDate(addDays(endOfMonth(selectedDate), 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretRight className="w-4 h-4" style={{ color: T.text2 }} /></button>
      </div>
    </div>
    {/* Day labels */}
    <div className="shrink-0 grid grid-cols-7 mb-1.5">
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
        <div key={d} className="text-center text-[11px] font-normal uppercase tracking-wider py-1" style={{ color: T.text3 }}>{d}</div>
      ))}
    </div>
    {/* Calendar grid — fills all remaining space */}
    <div className="flex-1 min-h-0 grid grid-cols-7" style={{ gridAutoRows: `calc(100% / ${numRows})`, gap: '4px' }}>
      {monthDays.map((day, i) => {
        const dayApps = getAppsForDay(day);
        const inMonth = day.getMonth() === selectedDate.getMonth();
        const pendingCount = dayApps.filter(a => a.status === 'pending').length;
        return <div key={i} onClick={() => onSwitchToDay(day)} className="overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-sm flex flex-col" style={{
          ...CARD_GLASS,
          background: isToday(day) ? T.orangePale : inMonth ? 'rgba(250,248,244,0.55)' : T.bg2,
          border: `1px solid ${pendingCount > 0 ? 'rgba(217,119,6,0.45)' : isToday(day) ? T.borderO : T.border}`,
          borderLeft: pendingCount > 0 ? '3px solid #D97706' : undefined,
          opacity: inMonth ? 1 : 0.45,
          padding: '6px 8px',
        }}>
          <div className="flex items-center justify-between mb-1 shrink-0">
            <p className="text-xs font-normal w-6 h-6 flex items-center justify-center rounded-full" style={{
              background: isToday(day) ? T.orange : 'transparent',
              color: isToday(day) ? '#fff' : inMonth ? T.text : T.text3
            }}>{format(day, 'd')}</p>
            {pendingCount > 0 && inMonth && (
              <span title={`${pendingCount} sin confirmar`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', flexShrink: 0 }} />
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-0.5">
            {dayApps.slice(0, 3).map(app => {
              const svc = services.find(s => s.id === app.serviceId);
              return <div key={app.id} className="text-[11px] font-normal px-1.5 py-0.5 rounded-md truncate shrink-0" style={{
                background: `${svc?.color ?? T.text3}12`,
                color: `${svc?.color ?? T.text3}cc`
              }}>{app.startTime} {app.clientName.split(' ')[0]}</div>;
            })}
            {dayApps.length > 3 && <p className="text-[11px] font-normal shrink-0" style={{ color: T.text3 }}>+{dayApps.length - 3} más</p>}
          </div>
        </div>;
      })}
    </div>
  </div>;
};

// ─── INICIO SCREEN ─────────────────────────────────────────────────────────────
// ─── BOT SETTINGS MODAL ────────────────────────────────────────────────────────
const BOT_MODES = [
  { id: 'auto', label: 'Automático', desc: 'El asistente responde solo' },
  { id: 'supervised', label: 'Supervisado', desc: 'Sugiere respuestas, vos las enviás' },
  { id: 'manual', label: 'Manual', desc: 'Solo receptivo, no responde' },
] as const;
type BotMode = typeof BOT_MODES[number]['id'];
function BotSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('20:00');
  const [dnd, setDnd] = useState(true);
  const [mode, setMode] = useState<BotMode>('auto');
  if (!open) return null;
  const inputStyle: React.CSSProperties = { padding: '6px 10px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.8)', fontSize: '13px', color: T.text, fontFamily: OPENING_HOURS, outline: 'none', width: '90px' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,45,59,0.25)', backdropFilter: 'blur(4px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: '18px', boxShadow: '0 16px 60px rgba(27,45,59,0.18)', padding: '28px', maxWidth: '360px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontFamily: OPENING_HOURS, fontSize: '16px', fontWeight: 400, color: T.dark, marginBottom: '3px' }}>Ajustes del asistente</h3>
            <p style={{ fontSize: '12px', color: T.text3, fontWeight: 400 }}>TurnoBot · Peluquería El Barrio</p>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', background: T.bg2, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
            <X className="w-4 h-4" style={{ color: T.text2 }} />
          </button>
        </div>
        {/* Horario activo */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Horario de actividad</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} style={inputStyle} />
            <span style={{ fontSize: '12px', color: T.text3 }}>a</span>
            <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} style={inputStyle} />
          </div>
        </div>
        {/* No molestar */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: T.bg2, border: `1px solid ${T.border}` }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 400, color: T.text }}>No molestar</p>
            <p style={{ fontSize: '11px', color: T.text3, marginTop: '2px' }}>Pausa fuera del horario activo</p>
          </div>
          <button onClick={() => setDnd(v => !v)} style={{ width: '38px', height: '22px', borderRadius: '99px', background: dnd ? SAGE : T.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: '3px', left: dnd ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }} />
          </button>
        </div>
        {/* Modo */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Modo de respuesta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {BOT_MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${mode === m.id ? SAGE : T.border}`, background: mode === m.id ? 'rgba(68,114,196,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 400, color: mode === m.id ? T.dark : T.text }}>{m.label}</p>
                  <p style={{ fontSize: '11px', color: T.text3, marginTop: '1px' }}>{m.desc}</p>
                </div>
                {mode === m.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: SAGE, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>
        {/* Save */}
        <button onClick={onClose} style={{ marginTop: '24px', width: '100%', padding: '10px', borderRadius: '12px', background: T.dark, color: '#fff', fontSize: '13px', fontWeight: 400, fontFamily: OPENING_HOURS, border: 'none', cursor: 'pointer' }}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

type InicioScreenProps = {
  todayApps: Appointment[];
  appointments: Appointment[];
  services: Service[];
  providerMap: Record<string, Provider>;
  clients: Client[];
  messages: Message[];
  onAppointmentClick: (a: Appointment) => void;
  onAddAppointment: (date?: Date, time?: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenPending: () => void;
  greeting: string;
  profileName: string;
  onNavigateAgenda: () => void;
  onNavigateMessages: () => void;
};
const KPI_DEFS_INICIO = [{
  key: 'turnosHoy' as const,
  label: 'Turnos hoy',
  color: '#3B82F6',
  bg: 'rgba(59,130,246,0.08)',
  dotColor: '#3B82F6'
}, {
  key: 'vacantes' as const,
  label: 'Vacantes',
  color: T.orange,
  bg: T.orangeLight,
  dotColor: T.orange
}, {
  key: 'facturacion' as const,
  label: 'Facturación',
  color: '#10B981',
  bg: 'rgba(16,185,129,0.08)',
  dotColor: '#10B981'
}];
const TOTAL_SLOTS = 20;
const InicioScreen = ({
  todayApps,
  appointments,
  services,
  providerMap,
  clients,
  messages,
  onAppointmentClick,
  onAddAppointment,
  onUpdateStatus,
  onOpenPending,
  greeting,
  profileName,
  onNavigateAgenda,
  onNavigateMessages,
}: InicioScreenProps) => {
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const todayConfirmed = useMemo(() => todayApps.filter(a => a.status === 'confirmed'), [todayApps]);
  const facturacion = useMemo(() => todayConfirmed.reduce((s, a) => s + (services.find(x => x.id === a.serviceId)?.price ?? 0), 0), [todayConfirmed, services]);
  const occupied = useMemo(() => todayApps.filter(a => a.status !== 'cancelled').length, [todayApps]);
  const vacantes = Math.max(0, TOTAL_SLOTS - occupied);
  const kpiValues = {
    turnosHoy: todayApps.length,
    vacantes,
    facturacion
  };
  // Live-updating "now" — recompute every 60s so countdowns ("en 45 min") stay fresh
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);
  const upcomingTop3 = useMemo(() => {
    const active = todayApps.filter(a => a.status !== 'cancelled' && a.status !== 'no_show');
    const upcoming = active.filter(a => {
      const [h, m] = a.startTime.split(':').map(Number);
      const appTime = new Date(a.date);
      appTime.setHours(h, m, 0, 0);
      return isAfter(appTime, now);
    }).sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
    if (upcoming.length > 0) return upcoming.slice(0, 3);
    // Fallback: show the last appointment of the day (for demo/end-of-day)
    const last = active.slice().sort((a, b) => toMins(b.startTime) - toMins(a.startTime))[0];
    return last ? [last] : [];
  }, [todayApps, now]);
  const nextApp = upcomingTop3[0] ?? null;
  const todaySorted = useMemo(() => todayApps.filter(a => a.status !== 'cancelled').slice().sort((a, b) => toMins(a.startTime) - toMins(b.startTime)), [todayApps]);
  const minsUntilNext = useMemo(() => {
    if (!nextApp) return null;
    const [h, m] = nextApp.startTime.split(':').map(Number);
    const diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
    if (diff <= 0) return null;
    if (diff < 60) return `en ${diff} min`;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `en ${hrs}h ${mins}min` : `en ${hrs}h`;
  }, [nextApp, now]);
  const vacantBlocks = useMemo(() => {
    const blocks: string[] = [];
    for (let h = 9; h < 18; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      const timeMins = h * 60;
      const isOccupied = todayApps.some(a => {
        const svc = services.find(s => s.id === a.serviceId);
        const start = toMins(a.startTime);
        const end = start + (svc?.duration ?? 30);
        return timeMins >= start && timeMins < end && a.status !== 'cancelled';
      });
      if (!isOccupied) blocks.push(timeStr);
    }
    return blocks;
  }, [todayApps, services]);
  return <div className="overflow-auto h-full" style={{ background: 'transparent' }}>
    <div className="px-4 sm:px-8 py-4 max-w-[960px] mx-auto w-full box-border">

      {/* ── Section header (coherent with other sections) ── */}
      <div className="anim-float-in" style={{ paddingBottom: '16px', borderBottom: `1px solid ${T.border}`, marginBottom: '16px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 400, color: T.dark, fontFamily: DM_SERIF, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.15 }}>
          <span>{greeting}, </span>
          <span style={{ fontStyle: 'italic' }}>{profileName}</span>
          <span>.</span>
        </h2>
      </div>

      {/* ── Conversational subtitle — date + today stats + week projection — todos linkeados a secciones internas ── */}
      {(() => {
        const turnosHoy = todayApps.length;
        const confirmados = todayConfirmed.length;
        const pendientes = todayApps.filter(a => a.status === 'pending').length;
        const unreadMsgs = messages.filter(m => m.unread).length;
        const charlasBot = messages.length;
        // Week-ahead pending (tomorrow → +7 days)
        const today = startOfToday();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
        const weekPending = appointments.filter(a => a.date >= tomorrow && a.date <= weekEnd && a.status === 'pending').length;
        const dateStr = ((s: string) => s.charAt(0).toUpperCase() + s.slice(1))(format(now, "EEEE d 'de' MMMM", { locale: es }));
        // Scroll targets within Inicio
        const scrollTo = (selector: string, block: 'start' | 'center' = 'center') => {
          const el = document.querySelector(selector);
          if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block });
        };
        type Part = { text: string; color: string; emphasis?: boolean; onClick?: () => void };
        const todayParts: Part[] = [];
        if (turnosHoy === 0) {
          todayParts.push({ text: 'Hoy no tenés turnos agendados', color: T.text2, onClick: () => scrollTo('[data-agenda-list="true"]', 'start') });
        } else {
          todayParts.push({ text: `Hoy tenés ${turnosHoy} ${turnosHoy === 1 ? 'turno' : 'turnos'}`, color: T.text2, emphasis: true, onClick: () => scrollTo('[data-agenda-list="true"]', 'start') });
          // "X confirmados" removido — redundante con "X turnos" + "X sin confirmar"
          if (pendientes > 0) todayParts.push({ text: `${pendientes} sin confirmar`, color: T.orange, emphasis: true, onClick: onOpenPending });
          todayParts.push({ text: `${kpiValues.vacantes} vacantes`, color: T.text3, onClick: () => scrollTo('[data-slots-libres="true"]') });
        }
        if (unreadMsgs > 0) todayParts.push({ text: `${unreadMsgs} ${unreadMsgs === 1 ? 'mensaje sin responder' : 'mensajes sin responder'}`, color: T.orange, emphasis: true, onClick: () => scrollTo('[data-messages-preview="true"]', 'start') });
        // "Tu agente respondió X charlas" removido — movido al tooltip del dot del topbar

        const renderPart = (part: Part, key: number, showDot: boolean) => (
          <span key={key}>
            {showDot && <span style={{ color: T.text3, margin: '0 8px' }}>·</span>}
            {part.onClick ? (
              <button
                onClick={part.onClick}
                className="hover:underline focus:outline-none focus-visible:underline"
                style={{ color: part.color, fontWeight: part.emphasis ? 500 : 400, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', textUnderlineOffset: '3px', textDecorationThickness: '1px' }}
              >
                {part.text}
              </button>
            ) : (
              <span style={{ color: part.color, fontWeight: part.emphasis ? 500 : 400 }}>{part.text}</span>
            )}
          </span>
        );

        return (
          <div className="anim-float-in" style={{ marginBottom: '28px', animationDelay: '50ms' }}>
            {/* Date line (muted) */}
            <p style={{ fontSize: '13px', fontWeight: 400, color: T.text3, marginBottom: '8px' }}>{dateStr}</p>
            {/* Today stats — calma, sin alertas */}
            <p style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.6 }}>
              {todayParts.map((part, i) => renderPart(part, i, i > 0))}
            </p>
          </div>
        );
      })()}

      {/* ── Agenda de hoy — Hero (próximo) + lista plana del resto del día ── */}
      <div data-agenda-list="true" className="anim-float-in" style={{ marginBottom: '28px', animationDelay: '100ms' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Agenda de hoy</p>
          <button onClick={onNavigateAgenda} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
            <span>Ver completa</span><ArrowRight size={11} />
          </button>
        </div>
        {todaySorted.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: T.text3, marginBottom: '12px' }}>Sin turnos para hoy</p>
            <button onClick={() => onAddAppointment(startOfToday(), '09:00')} style={{ fontSize: '12px', fontWeight: 500, color: '#fff', padding: '7px 16px', borderRadius: '10px', background: T.orange, border: 'none', cursor: 'pointer' }}>
              + Agregar turno
            </button>
          </div>
        ) : (() => {
          // Separate the "next" (hero) from the rest of the day
          const restOfDay = todaySorted.filter(a => a.id !== nextApp?.id);
          return (
            <div style={{ position: 'relative' }}>
              {/* HERO — next appointment (glass card with fade that bleeds into the list) */}
              {nextApp && (() => {
                const svc = services.find(s => s.id === nextApp.serviceId);
                const prov = providerMap[nextApp.providerId];
                const clientNote = clients.find(c => c.id === nextApp.clientId)?.notes;
                const isPending = nextApp.status === 'pending';
                return (
                  <div style={{ position: 'relative', marginBottom: restOfDay.length > 0 ? '4px' : 0 }} data-pending-app={isPending ? 'true' : undefined}>
                    {/* Glass background — extends down with mask fade into the list below */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0, right: 0,
                        bottom: restOfDay.length > 0 ? '-60px' : 0,
                        background: 'rgba(255,255,255,0.45)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(91,143,166,0.22)',
                        borderRadius: '18px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                        WebkitMaskImage: restOfDay.length > 0 ? 'linear-gradient(180deg, black 0%, black 70%, transparent 100%)' : 'none',
                        maskImage: restOfDay.length > 0 ? 'linear-gradient(180deg, black 0%, black 70%, transparent 100%)' : 'none',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                    />
                    {/* Hero content — sin border-left (el StatusPill indica el estado) */}
                    <button
                      onClick={() => onAppointmentClick(nextApp)}
                      className="w-full text-left transition-colors hover:bg-black/[0.02]"
                      style={{
                        position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'flex-start', gap: '20px',
                        padding: '16px 20px',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ minWidth: '88px', flexShrink: 0 }}>
                        <p style={{ fontFamily: INSTRUMENT_SERIF, fontSize: '40px', fontWeight: 400, letterSpacing: '-0.02em', color: T.dark, lineHeight: 1 }}>
                          {nextApp.startTime.split(':')[0]}<span style={{ color: SAGE }}>:</span>{nextApp.startTime.split(':')[1]}
                        </p>
                        {minsUntilNext && <p style={{ fontSize: '11px', color: T.text3, marginTop: '6px' }}>{minsUntilNext}</p>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '16px', fontWeight: 500, color: T.dark, lineHeight: 1.2 }}>{nextApp.clientName}</p>
                          <StatusPill status={nextApp.status} />
                        </div>
                        <p style={{ fontSize: '13px', color: T.text2, lineHeight: 1.45 }}>
                          <span>{svc?.name ?? '—'}</span>
                          <span style={{ color: T.text3 }}> · {svc?.duration ?? 0} min</span>
                          {prov && <><span style={{ color: T.text3 }}> · con </span><span>{prov.name}</span></>}
                        </p>
                        {clientNote && (
                          <p style={{ fontSize: '12px', color: T.text3, fontStyle: 'italic', marginTop: '2px' }}>{clientNote}</p>
                        )}
                      </div>
                      {prov && (
                        <div style={{ flexShrink: 0, marginTop: '4px' }}>
                          <ProviderAvatar provider={prov} size="sm" />
                        </div>
                      )}
                    </button>
                    {/* Inline actions for pending hero */}
                    {isPending && (
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 16px 128px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateStatus(nextApp.id, 'confirmed'); }}
                          className="flex items-center gap-1 transition-colors hover:opacity-90"
                          style={{ padding: '6px 14px', borderRadius: '8px', background: T.orange, color: '#fff', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                        >
                          <Check size={12} weight="bold" /><span>Confirmar</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateStatus(nextApp.id, 'cancelled'); }}
                          className="transition-colors hover:bg-black/[0.04]"
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'transparent', color: T.text2, fontSize: '12px', fontWeight: 400, border: `1px solid ${T.border}`, cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* REST OF DAY — plain list sin fondo */}
              {restOfDay.length > 0 && (
                <div style={{ position: 'relative', zIndex: 1, paddingTop: nextApp ? '4px' : 0 }}>
                  {restOfDay.map((app, i) => {
                    const svc = services.find(s => s.id === app.serviceId);
                    const prov = providerMap[app.providerId];
                    const isPending = app.status === 'pending';
                    return (
                      <div key={app.id} data-pending-app={isPending ? 'true' : undefined} style={{
                        borderBottom: !isPending && i < restOfDay.length - 1 ? `1px solid rgba(91,143,166,0.14)` : undefined,
                        // Pending → mini-card flotante con border completo sutil (no left-border "muy AI")
                        border: isPending ? '1px solid rgba(255,148,77,0.35)' : undefined,
                        borderRadius: isPending ? '10px' : undefined,
                        background: isPending ? 'rgba(255,148,77,0.03)' : 'transparent',
                        margin: isPending ? '4px 0' : undefined,
                        transition: 'background 0.15s',
                      }}>
                        <button onClick={() => onAppointmentClick(app)} className="w-full text-left transition-colors hover:bg-black/[0.02]" style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '12px 18px',
                          background: 'transparent',
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: SAGE, width: '44px', flexShrink: 0, fontFamily: GEIST_MONO }}>{app.startTime}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: 400, color: T.text, lineHeight: 1.3 }} className="truncate">{app.clientName}</p>
                            <p style={{ fontSize: '12px', fontWeight: 400, color: T.text2 }} className="truncate">{svc?.name ?? '—'}{prov && ` · con ${prov.name}`}</p>
                          </div>
                          {prov && <ProviderAvatar provider={prov} size="sm" />}
                          <StatusPill status={app.status} />
                        </button>
                        {isPending && (
                          <div className="flex items-center gap-2" style={{ padding: '0 18px 10px 76px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'confirmed'); }}
                              className="flex items-center gap-1 transition-colors hover:opacity-90"
                              style={{ padding: '5px 12px', borderRadius: '8px', background: T.orange, color: '#fff', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                            >
                              <Check size={12} weight="bold" /><span>Confirmar</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'cancelled'); }}
                              className="transition-colors hover:bg-black/[0.04]"
                              style={{ padding: '5px 12px', borderRadius: '8px', background: 'transparent', color: T.text2, fontSize: '12px', fontWeight: 400, border: `1px solid ${T.border}`, cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
        {/* Slots libres */}
        {vacantBlocks.length > 0 && <div data-slots-libres="true" style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px' }}>Slots libres</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {vacantBlocks.slice(0, 6).map(block => (
              <button key={block} onClick={() => onAddAppointment(startOfToday(), block)} style={{ padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'rgba(255,255,255,0.72)', border: `1px solid ${T.borderO}`, cursor: 'pointer' }}>{block}</button>
            ))}
            {vacantBlocks.length > 6 && <span style={{ fontSize: '12px', fontWeight: 400, color: T.text3, padding: '5px 6px' }}>+{vacantBlocks.length - 6} más</span>}
          </div>
        </div>}
      </div>

      {/* ── Próximos días — lista tranquila, sin fondo, sin urgencia ── */}
      {(() => {
        const today = startOfToday();
        const nextDays: { date: Date; total: number; pending: number }[] = [];
        for (let i = 1; i <= 7; i++) {
          const d = addDays(today, i);
          const dayApps = appointments.filter(a => isSameDay(a.date, d) && a.status !== 'cancelled' && a.status !== 'no_show');
          if (dayApps.length === 0) continue;
          nextDays.push({
            date: d,
            total: dayApps.length,
            pending: dayApps.filter(a => a.status === 'pending').length,
          });
        }
        if (nextDays.length === 0) return null;
        const formatDayLabel = (d: Date) => {
          const daysDiff = Math.round((d.getTime() - today.getTime()) / 86400000);
          const dateStr = format(d, "d 'de' MMM", { locale: es });
          if (daysDiff === 1) return { primary: 'Mañana', secondary: dateStr };
          const dayName = format(d, 'EEEE', { locale: es });
          return { primary: dayName.charAt(0).toUpperCase() + dayName.slice(1), secondary: dateStr };
        };
        return (
          <div className="anim-float-in" style={{ marginBottom: '28px', animationDelay: '150ms' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Próximos días</p>
              <button onClick={onNavigateAgenda} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span>Ver semana</span><ArrowRight size={11} />
              </button>
            </div>
            <div>
              {nextDays.slice(0, 5).map((d, i) => {
                const { primary, secondary } = formatDayLabel(d.date);
                return (
                  <button
                    key={d.date.toISOString()}
                    onClick={onNavigateAgenda}
                    className="w-full text-left transition-colors hover:bg-black/[0.02]"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '10px 8px',
                      borderBottom: i < Math.min(nextDays.length, 5) - 1 ? `1px solid rgba(91,143,166,0.14)` : undefined,
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ minWidth: '170px', display: 'flex', alignItems: 'baseline', gap: '8px', lineHeight: 1.3 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: T.text }}>{primary}</span>
                      <span style={{ fontSize: '12px', color: T.text3 }}>{secondary}</span>
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: T.text2 }}>
                      {d.total} {d.total === 1 ? 'turno' : 'turnos'}
                      {d.pending > 0 && (
                        <span style={{ color: T.text3 }}>{` · ${d.pending} por confirmar`}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Messages preview ── */}
      {messages.length > 0 && (() => {
        const unread = messages.filter(m => m.unread);
        const shown = unread.length > 0 ? unread : messages.slice(0, 2);
        return (
          <div data-messages-preview="true" className="anim-float-in" style={{ marginBottom: '24px', animationDelay: '160ms' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Mensajes</p>
                {unread.length > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 6px', borderRadius: '99px', background: T.orange, color: '#fff', fontSize: '10px', fontWeight: 600 }}>{unread.length}</span>
                )}
              </div>
              <button onClick={onNavigateMessages} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span>Ver todos</span><ArrowRight size={11} />
              </button>
            </div>
            <GlassCard className="overflow-hidden">
              {shown.map((msg, i) => {
                const initials = msg.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <button key={msg.id} onClick={onNavigateMessages} className="w-full text-left transition-colors hover:bg-black/[0.02]" style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 18px',
                    borderBottom: i < shown.length - 1 ? `1px solid ${T.border}` : undefined,
                    background: 'transparent',
                  }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: SAGE_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: '#fff' }}>{initials}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <p style={{ fontSize: '14px', fontWeight: msg.unread ? 500 : 400, color: T.text }}>{msg.clientName}</p>
                        <span style={{ fontSize: '11px', color: T.text3, flexShrink: 0, marginLeft: '8px' }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: msg.unread ? T.text2 : T.text3, fontWeight: 400, lineHeight: 1.4 }} className="truncate">{msg.preview}</p>
                    </div>
                  </button>
                );
              })}
            </GlassCard>
          </div>
        );
      })()}

      {/* ── Esta semana — comparación actual vs anterior con toggle + mini-bars ── */}
      <WeeklyComparison appointments={appointments} services={services} />

      <div style={{ height: '16px' }} />
    </div>
  </div>;
};

// ─── WEEKLY COMPARISON — hero metric + mini bars + sub-stats ──────────────────
const WeeklyComparison = ({ appointments, services }: { appointments: Appointment[]; services: Service[]; }) => {
  const [metric, setMetric] = useState<'turnos' | 'facturacion'>('turnos');
  const data = useMemo(() => {
    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const prevWeekStart = addDays(weekStart, -7);
    const weekEnd = addDays(weekStart, 6);
    const prevWeekEnd = addDays(weekStart, -1);
    const thisWeek = appointments.filter(a => a.date >= weekStart && a.date <= weekEnd);
    const prevWeek = appointments.filter(a => a.date >= prevWeekStart && a.date <= prevWeekEnd);
    const confirmed = thisWeek.filter(a => a.status === 'confirmed');
    const prevConfirmed = prevWeek.filter(a => a.status === 'confirmed');
    const facturacion = confirmed.reduce((s, a) => s + (services.find(sv => sv.id === a.serviceId)?.price ?? 0), 0);
    const prevFacturacion = prevConfirmed.reduce((s, a) => s + (services.find(sv => sv.id === a.serviceId)?.price ?? 0), 0);
    const prevFacturacionForBars = prevConfirmed;
    const deltaPct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0));
    const daysLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const dayBars = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dayConfirmed = confirmed.filter(a => isSameDay(a.date, day));
      const turnosDay = dayConfirmed.length;
      const facturacionDay = dayConfirmed.reduce((s, a) => s + (services.find(sv => sv.id === a.serviceId)?.price ?? 0), 0);
      return { label: daysLabels[i], turnos: turnosDay, facturacion: facturacionDay, isToday: isSameDay(day, today), isPast: day < today };
    });
    return {
      turnos: confirmed.length,
      prevTurnos: prevConfirmed.length,
      turnosDelta: deltaPct(confirmed.length, prevConfirmed.length),
      facturacion,
      prevFacturacion,
      facturacionDelta: deltaPct(facturacion, prevFacturacion),
      noShows: thisWeek.filter(a => a.status === 'no_show').length,
      uniqueClients: new Set(confirmed.map(a => a.clientId)).size,
      dayBars,
    };
  }, [appointments, services]);

  const isFacturacion = metric === 'facturacion';
  const currentValue = isFacturacion ? data.facturacion : data.turnos;
  const delta = isFacturacion ? data.facturacionDelta : data.turnosDelta;
  const barValues = data.dayBars.map(d => isFacturacion ? d.facturacion : d.turnos);
  const maxBar = Math.max(...barValues, 1);
  const deltaPositive = delta >= 0;
  const deltaColor = delta === 0 ? T.text3 : deltaPositive ? '#10B981' : '#C62828';

  return (
    <div className="anim-float-in" style={{ marginBottom: '8px', animationDelay: '180ms' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Esta semana</p>
        {/* Toggle turnos / facturación — segmented control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px', borderRadius: '10px', background: 'rgba(91,143,166,0.06)', border: '1px solid rgba(91,143,166,0.18)' }}>
          {(['turnos', 'facturacion'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              style={{
                padding: '4px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                background: metric === m ? '#fff' : 'transparent',
                color: metric === m ? T.dark : T.text2,
                boxShadow: metric === m ? '0 1px 3px rgba(27,45,59,0.10)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {m === 'turnos' ? 'Turnos' : 'Facturación'}
            </button>
          ))}
        </div>
      </div>
      <GlassCard style={{ padding: '24px 28px' }}>
        {/* Hero number + delta */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <p style={{ fontFamily: INSTRUMENT_SERIF, fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-0.02em', color: T.dark, lineHeight: 1 }}>
            {isFacturacion ? `$${currentValue.toLocaleString()}` : currentValue}
          </p>
          <p style={{ fontSize: '13px', color: T.text2 }}>
            {isFacturacion ? 'facturación' : `${currentValue === 1 ? 'turno' : 'turnos'} de lunes a domingo`}
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            marginLeft: 'auto',
            padding: '4px 10px',
            borderRadius: '99px',
            background: delta === 0 ? 'rgba(91,143,166,0.08)' : deltaPositive ? 'rgba(16,185,129,0.10)' : 'rgba(198,40,40,0.08)',
            color: deltaColor,
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap' as const,
          }}>
            {delta !== 0 && (deltaPositive ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />)}
            <span>{delta > 0 ? '+' : ''}{delta}% <span style={{ color: T.text3, fontWeight: 400 }}>vs semana anterior</span></span>
          </span>
        </div>
        {/* Mini bars por día */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '58px', marginBottom: '6px' }}>
          {data.dayBars.map((d, i) => {
            const val = isFacturacion ? d.facturacion : d.turnos;
            const pct = maxBar > 0 ? (val / maxBar) * 100 : 0;
            // Track baseline visible para días vacíos (distingue "sin data" vs "no existe")
            const bg = d.isToday ? T.orange : d.isPast ? 'rgba(68,114,196,0.55)' : 'rgba(91,143,166,0.32)';
            const hasData = val > 0;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                {/* Track baseline (visible en todos los días para no "desaparecer" los vacíos) */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: '4px',
                  background: hasData ? 'transparent' : (d.isPast ? 'rgba(91,143,166,0.20)' : 'rgba(91,143,166,0.14)'),
                  borderRadius: '2px',
                  pointerEvents: 'none',
                }} />
                {hasData && (
                  <div style={{
                    height: `${Math.max(pct, 8)}%`,
                    background: bg,
                    borderRadius: '4px 4px 0 0',
                    minHeight: '6px',
                    transition: 'height 0.3s ease, background 0.15s',
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          {data.dayBars.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' as const, fontSize: '11px', color: d.isToday ? T.orange : T.text3, fontWeight: d.isToday ? 500 : 400 }}>
              {d.label}
            </div>
          ))}
        </div>
        {/* Sub-stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: `1px solid ${T.border}`, fontSize: '13px' }}>
          {!isFacturacion && (
            <span style={{ color: T.text2 }}>
              <strong style={{ fontWeight: 500, color: T.dark }}>${data.facturacion.toLocaleString()}</strong>
              <span style={{ color: T.text3 }}> facturados</span>
            </span>
          )}
          {isFacturacion && (
            <span style={{ color: T.text2 }}>
              <strong style={{ fontWeight: 500, color: T.dark }}>{data.turnos}</strong>
              <span style={{ color: T.text3 }}> {data.turnos === 1 ? 'turno' : 'turnos'}</span>
            </span>
          )}
          <span style={{ color: T.text3 }}>·</span>
          <span style={{ color: T.text2 }}>
            <strong style={{ fontWeight: 500, color: T.dark }}>{data.uniqueClients}</strong>
            <span style={{ color: T.text3 }}> {data.uniqueClients === 1 ? 'cliente único' : 'clientes únicos'}</span>
          </span>
          <span style={{ color: T.text3 }}>·</span>
          <span style={{ color: T.text2 }}>
            <strong style={{ fontWeight: 500, color: data.noShows > 0 ? T.dark : T.text2 }}>{data.noShows}</strong>
            <span style={{ color: T.text3 }}> {data.noShows === 1 ? 'no-show' : 'no-shows'}</span>
          </span>
        </div>
      </GlassCard>
    </div>
  );
};

// ─── AGENDA SCREEN ─────────────────────────────────────────────────────────────
type AgendaScreenProps = {
  filteredApps: Appointment[];
  services: Service[];
  providers: Provider[];
  providerMap: Record<string, Provider>;
  blockedSlots: BlockedSlot[];
  onAppointmentClick: (a: Appointment) => void;
  onAddAppointment: (date?: Date, time?: string) => void;
  onBlockSlot: () => void;
};
const AgendaScreen = ({
  filteredApps,
  services,
  providers,
  providerMap,
  blockedSlots,
  onAppointmentClick,
  onAddAppointment,
  onBlockSlot
}: AgendaScreenProps) => {
  const [calView, setCalView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [weekStart, setWeekStart] = useState(startOfWeek(startOfToday(), {
    weekStartsOn: 1
  }));
  const [filterValues, setFilterValues] = useState<Set<string>>(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [pendingOnlyFilter, setPendingOnlyFilter] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) setFilterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const allProviders = useMemo(() => {
    const seen = new Set<string>();
    const out: {
      id: string;
      name: string;
      initials: string;
    }[] = [];
    filteredApps.forEach(a => {
      if (!seen.has(a.providerId) && providerMap[a.providerId]) {
        seen.add(a.providerId);
        out.push(providerMap[a.providerId]);
      }
    });
    return out;
  }, [filteredApps, providerMap]);
  const providerFilteredApps = useMemo(() => {
    const providerIds = Array.from(filterValues).filter(v => v.startsWith('p:')).map(v => v.slice(2));
    const serviceIds = Array.from(filterValues).filter(v => v.startsWith('s:')).map(v => v.slice(2));
    return filteredApps.filter(a => {
      const mp = providerIds.length === 0 || providerIds.includes(a.providerId);
      const ms = serviceIds.length === 0 || serviceIds.includes(a.serviceId);
      const mPending = !pendingOnlyFilter || a.status === 'pending';
      return mp && ms && mPending;
    });
  }, [filteredApps, filterValues, pendingOnlyFilter]);
  const totalPendingCount = useMemo(() => filteredApps.filter(a => a.status === 'pending').length, [filteredApps]);
  const selectedDateApps = useMemo(() => providerFilteredApps.filter(a => isSameDay(a.date, selectedDate)), [providerFilteredApps, selectedDate]);
  const switchToDay = (d: Date) => {
    setSelectedDate(d);
    setCalView('day');
  };
  const filterCount = filterValues.size;
  return <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-4 gap-0" style={{ background: 'transparent' }}>
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', paddingBottom: '16px', borderBottom: `1px solid ${T.border}`, marginBottom: '4px', flexShrink: 0 }}>
      <h2 style={{ fontSize: '24px', fontWeight: 400, color: T.dark, fontFamily: DM_SERIF, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.1 }}>Agenda</h2>
    </div>
    {/* Banner de pendientes removido — redundante con el filter "Pendientes" + modal desde Inicio */}
    <div className="flex-1 flex flex-col overflow-hidden" style={{ ...CONTENT_GLASS, maxWidth: '960px', margin: '0 auto', width: '100%' }}>
    <div style={{ padding: '0 4px' }}>
      <div className="py-2.5 flex items-center gap-2 flex-wrap shrink-0 px-3" style={{
        borderBottom: `1px solid ${T.border}`,
        background: 'transparent'
      }}>
        {/* Left side: view switcher + date nav */}
        <div className="flex items-center gap-0.5 p-1 rounded-xl shrink-0" style={{
          background: T.bg2
        }}>
          {(['day', 'week', 'month'] as const).map(v => <button key={v} onClick={() => setCalView(v)} className="px-2.5 py-1 rounded-lg text-xs font-normal transition-all whitespace-nowrap" style={{
            fontWeight: 400,
            background: calView === v ? 'rgba(255,255,255,0.85)' : 'transparent',
            color: calView === v ? T.text : T.text2,
            boxShadow: calView === v ? T.shadow : 'none'
          }}>{v === 'day' ? 'Día' : v === 'week' ? 'Sem' : 'Mes'}</button>)}
        </div>
        {calView === 'day' && <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretLeft className="w-3.5 h-3.5" style={{
              color: T.text2
            }} /></button>
          <span className="text-xs font-normal px-1 capitalize whitespace-nowrap" style={{
            color: T.text2
          }}>{format(selectedDate, 'EEE d MMM', {
              locale: es
            })} – {format(addDays(selectedDate, 6), 'd MMM yyyy', {
              locale: es
            })}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><CaretRight className="w-3.5 h-3.5" style={{
              color: T.text2
            }} /></button>
        </div>}
        {/* Right side: actions (Solo pendientes + Filtrar + Bloquear) — anchored right via ml-auto so they don't shift between views */}
        {totalPendingCount > 0 && (
          <button
            onClick={() => setPendingOnlyFilter(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all ml-auto"
            style={{
              background: pendingOnlyFilter ? '#D97706' : 'rgba(217,119,6,0.14)',
              color: pendingOnlyFilter ? '#fff' : '#B45309',
              border: `1px solid ${pendingOnlyFilter ? '#D97706' : 'rgba(217,119,6,0.45)'}`,
              cursor: 'pointer',
            }}
            title={pendingOnlyFilter ? 'Ver todos los turnos' : `Ver solo los ${totalPendingCount} pendientes`}
          >
            <Warning size={12} weight={pendingOnlyFilter ? 'fill' : 'fill'} />
            <span>{pendingOnlyFilter ? 'Todos' : `Pendientes (${totalPendingCount})`}</span>
          </button>
        )}
        <div ref={filterDropdownRef} className={cn('relative', totalPendingCount === 0 && 'ml-auto')}>
          <button onClick={() => setFilterDropdownOpen(v => !v)} className="flex items-center gap-1.5 text-xs font-normal px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all" style={{
            background: filterCount > 0 ? T.dark : T.bg2,
            color: filterCount > 0 ? '#fff' : T.text2,
            border: `1px solid ${filterCount > 0 ? T.dark : T.border}`
          }}>
            <Funnel className="w-3 h-3 shrink-0" /><span>{filterCount > 0 ? `Filtrar (${filterCount})` : 'Filtrar'}</span>
          </button>
          <AnimatePresence>
            {filterDropdownOpen && <motion.div initial={{
              opacity: 0,
              y: -6,
              scale: 0.97
            }} animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }} exit={{
              opacity: 0,
              y: -6,
              scale: 0.97
            }} transition={{
              duration: 0.12
            }} style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              minWidth: '210px',
              maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: T.shadowLg,
              border: `1px solid ${T.border}`,
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <button onClick={() => {
                setFilterValues(new Set());
                setFilterDropdownOpen(false);
              }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-normal text-left transition-colors hover:bg-black/5" style={{
                color: filterCount > 0 ? T.orange : T.text2,
                borderBottom: `1px solid ${T.border}`
              }}>
                <span>Limpiar filtros</span>
                {filterCount > 0 && <span className="ml-auto text-[11px] font-normal px-1.5 py-0.5 rounded-full" style={{
                  background: T.orange,
                  color: '#fff'
                }}>{filterCount}</span>}
              </button>
              {allProviders.length > 0 && <div>
                <p className="px-4 py-1.5 text-[11px] font-normal uppercase tracking-widest" style={{
                  color: T.text3,
                  background: T.bg2,
                  borderBottom: `1px solid ${T.border}`
                }}>Profesionales</p>
                {allProviders.map(p => {
                  const pVal = `p:${p.id}`;
                  const checked = filterValues.has(pVal);
                  return <button key={p.id} onClick={() => {
                    const next = new Set(filterValues);
                    if (next.has(pVal)) next.delete(pVal);else next.add(pVal);
                    setFilterValues(next);
                  }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-normal text-left transition-colors hover:bg-black/5" style={{
                    color: T.text
                  }}>
                  <span className={cn('w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors')} style={{
                      background: checked ? T.orange : 'transparent',
                      borderColor: checked ? T.orange : 'rgba(0,0,0,0.12)'
                    }}>{checked && <Check className="w-2.5 h-2.5 text-white" />}</span>
                  <span className="truncate">{p.name}</span>
                </button>;
                })}
              </div>}
              {services.length > 0 && <div>
                <p className="px-4 py-1.5 text-[11px] font-normal uppercase tracking-widest" style={{
                  color: T.text3,
                  background: T.bg2,
                  borderTop: `1px solid ${T.border}`,
                  borderBottom: `1px solid ${T.border}`
                }}>Servicios</p>
                {services.map(svc => {
                  const sVal = `s:${svc.id}`;
                  const checked = filterValues.has(sVal);
                  return <button key={svc.id} onClick={() => {
                    const next = new Set(filterValues);
                    if (next.has(sVal)) next.delete(sVal);else next.add(sVal);
                    setFilterValues(next);
                  }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-normal text-left transition-colors hover:bg-black/5" style={{
                    color: T.text
                  }}>
                  <span className={cn('w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors')} style={{
                      background: checked ? T.orange : 'transparent',
                      borderColor: checked ? T.orange : 'rgba(0,0,0,0.12)'
                    }}>{checked && <Check className="w-2.5 h-2.5 text-white" />}</span>
                  <span className="truncate">{svc.name}</span>
                </button>;
                })}
              </div>}
            </motion.div>}
          </AnimatePresence>
        </div>
        <button onClick={onBlockSlot} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-normal transition-all shrink-0" style={{
          background: 'transparent',
          color: T.text,
          border: `1px solid ${T.border}`
        }}>
          <Lock className="w-3.5 h-3.5" /><span className="hidden sm:inline">Bloquear</span>
        </button>
      </div>
    </div>
    {calView === 'day' && <div className="flex-1 overflow-hidden flex flex-col">
        <HomeAgendaGrid apps={selectedDateApps} services={services} providerMap={providerMap} onAppointmentClick={onAppointmentClick} onAddAppointment={onAddAppointment} targetDate={selectedDate} />
    </div>}
    {calView === 'week' && <div className="flex-1 overflow-hidden">
        <WeekView weekStart={weekStart} setWeekStart={setWeekStart} filteredApps={providerFilteredApps} blockedSlots={blockedSlots} services={services} providerMap={providerMap} onAppointmentClick={onAppointmentClick} onCellClick={onAddAppointment} />
    </div>}
    {calView === 'month' && <div className="flex-1 overflow-hidden">
        <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} filteredApps={providerFilteredApps} services={services} onSwitchToDay={switchToDay} />
    </div>}
    </div>
  </div>;
};

// ─── MOCK CHAT DATA ────────────────────────────────────────────────────────────
const MOCK_CHAT: Record<string, {
  from: 'bot' | 'client';
  text: string;
  time: string;
}[]> = {
  c1: [{
    from: 'bot',
    text: '¡Hola Juan! Soy el asistente de Peluquería El Barrio. ¿En qué puedo ayudarte?',
    time: '09:00'
  }, {
    from: 'client',
    text: '¿Tienen disponibilidad para el sábado a las 10?',
    time: '09:02'
  }, {
    from: 'bot',
    text: 'Maré revisar... Sí, tenemos lugar el sábado a las 10:00. ¿Lo reservo?',
    time: '09:02'
  }, {
    from: 'client',
    text: 'Sí, perfecto. Gracias!',
    time: '09:03'
  }, {
    from: 'bot',
    text: '¡Listo! Tu turno quedó confirmado para el sábado a las 10:00 — Corte Caballero. ¡Hasta pronto!',
    time: '09:03'
  }],
  c2: [{
    from: 'bot',
    text: '¡Hola María! Te recuerdo que tenés turno mañana a las 11:00 — Coloración Completa. ¿Confirmás?',
    time: '10:30'
  }, {
    from: 'client',
    text: 'Hola! Quería confirmar si mi turno del jueves sigue...',
    time: '10:35'
  }, {
    from: 'bot',
    text: 'Tu turno del jueves está confirmado para las 11:00. ¡Te esperamos!',
    time: '10:35'
  }],
  c3: [{
    from: 'bot',
    text: '¡Hola Laura! Tu turno de mañana a las 9:00 fue confirmado. ¡Te esperamos!',
    time: '18:00'
  }, {
    from: 'client',
    text: 'Perfecto! Nos vemos mañana a las 9.',
    time: '18:05'
  }],
  c4: [{
    from: 'bot',
    text: 'Hola Carlos, notamos que no pudiste asistir a tu turno del martes. ¿Querés reagendar?',
    time: '16:00'
  }, {
    from: 'client',
    text: 'Perdón por no haber avisado, se me complicó...',
    time: '16:10'
  }, {
    from: 'bot',
    text: 'No hay problema. ¿Querés que te busque un nuevo horario disponible?',
    time: '16:10'
  }],
  c5: [{
    from: 'client',
    text: '¿Puedo cambiar el turno de las 14:30 a las 15:00?',
    time: 'Ayer'
  }, {
    from: 'bot',
    text: 'Revisando disponibilidad... El horario de las 15:00 está ocupado. ¿Te sirve las 14:00 o las 16:00?',
    time: 'Ayer'
  }]
};

// ─── CLIENTS / MESSAGES SCREEN ─────────────────────────────────────────────────
const TAG_COLORS: Record<string, {
  bg: string;
  text: string;
}> = {
  frecuente: {
    bg: 'rgba(59,130,246,0.1)',
    text: '#3B82F6'
  },
  vip: {
    bg: 'rgba(107,143,126,0.12)',
    text: SAGE
  },
  riesgo: {
    bg: 'rgba(229,57,53,0.10)',
    text: '#C62828'
  },
  mañana: {
    bg: 'rgba(16,185,129,0.1)',
    text: '#10B981'
  }
};
type StatusFilterOption = 'all' | 'con_turno' | 'sin_turno' | 'con_ausencias';
const STATUS_FILTER_OPTIONS: {
  value: StatusFilterOption;
  label: string;
}[] = [{
  value: 'all',
  label: 'Todos'
}, {
  value: 'con_turno',
  label: 'Con turno próximo'
}, {
  value: 'sin_turno',
  label: 'Sin turno'
}, {
  value: 'con_ausencias',
  label: 'Con ausencias'
}];
// ─── MESSAGES SCREEN ────────────────────────────────────────────────────────────
type MessagesScreenProps = {
  messages: Message[];
  clients: Client[];
};
const MessagesScreen = ({ messages, clients }: MessagesScreenProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const clientMap = useMemo(() => {
    const m: Record<string, Client> = {};
    clients.forEach(c => { m[c.id] = c; });
    return m;
  }, [clients]);
  const selectedClient = selectedClientId ? clientMap[selectedClientId] : null;
  const chatMessages = selectedClient ? MOCK_CHAT[selectedClient.id] ?? [] : [];
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-4" style={{ background: 'transparent' }}>
      {/* ── Section header ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', paddingBottom: '16px', borderBottom: `1px solid ${T.border}`, marginBottom: '8px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 400, color: T.dark, fontFamily: DM_SERIF, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.1 }}>Mensajes</h2>
      </div>
      {/* ── Panels ── */}
      <div className="flex-1 flex overflow-hidden gap-3" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Left: conversation list */}
      <div className={cn('flex flex-col overflow-hidden shrink-0 md:w-[320px]', selectedClientId ? 'hidden md:flex' : 'flex w-full')} style={{ background: 'transparent' }}>
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.04)' }}>
            <MagnifyingGlass className="w-4 h-4 shrink-0" style={{ color: T.text3 }} />
            <input type="text" placeholder="Buscar conversación..." className="flex-1 text-sm bg-transparent focus:outline-none" style={{ color: T.text }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0
            ? <div className="flex flex-col items-center justify-center h-full py-12"><ChatCircle className="w-10 h-10 mb-2" style={{ color: T.text3 }} /><p className="text-sm font-normal" style={{ color: T.text3 }}>Sin mensajes</p></div>
            : messages.map((msg) => {
                const isSelected = selectedClientId === msg.clientId;
                const initials = msg.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <button key={msg.id} onClick={() => setSelectedClientId(msg.clientId)} className="w-full text-left transition-colors hover:bg-black/[0.02]" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: isSelected ? `rgba(68,114,196,0.06)` : 'transparent', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4472C4, #98BAE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 400, color: '#fff' }}>{initials}</div>
                      {msg.unread && <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: T.orange, border: '2px solid #fff' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <p style={{ fontSize: '13px', fontWeight: msg.unread ? 500 : 400, color: T.text }}>{msg.clientName}</p>
                        <span style={{ fontSize: '11px', color: T.text3, flexShrink: 0, marginLeft: '8px' }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: msg.unread ? T.text2 : T.text3, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.preview}</p>
                    </div>
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* Right: conversation */}
      {selectedClient ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(91,143,166,0.22)', boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)' }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <button onClick={() => setSelectedClientId(null)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5"><CaretLeft className="w-4 h-4" style={{ color: T.text2 }} /></button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4472C4, #98BAE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 400, color: '#fff' }}>
              {selectedClient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 400, color: T.text }}>{selectedClient.name}</p>
              <p style={{ fontSize: '12px', color: T.text3 }}>{selectedClient.phone}</p>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {chatMessages.length === 0
              ? <div className="flex flex-col items-center justify-center h-full"><ChatCircle className="w-10 h-10 mb-2" style={{ color: T.text3 }} /><p className="text-sm font-normal" style={{ color: T.text3 }}>Sin mensajes aún</p></div>
              : chatMessages.map((cm, i) => (
                  <div key={i} className={cn('flex', cm.from === 'bot' ? 'justify-start' : 'justify-end')}>
                    {cm.from === 'bot' && <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'linear-gradient(135deg, #4472C4, #98BAE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '4px' }}>P</div>}
                    <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: cm.from === 'bot' ? '8px 18px 18px 18px' : '18px 8px 18px 18px', background: cm.from === 'bot' ? 'rgba(255,255,255,0.60)' : `rgba(68,114,196,0.12)`, border: `1px solid ${cm.from === 'bot' ? T.border : 'rgba(68,114,196,0.22)'}`, boxShadow: '0 1px 4px rgba(27,45,59,0.06)' }}>
                      <p style={{ fontSize: '13px', color: T.text, lineHeight: 1.5 }}>{cm.text}</p>
                      <p style={{ fontSize: '10px', color: T.text3, marginTop: '4px', textAlign: cm.from === 'bot' ? 'left' : 'right' }}>{cm.time}</p>
                    </div>
                  </div>
                ))
            }
          </div>
          {/* Input */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${T.border}` }}>
              <input type="text" placeholder="Escribí un mensaje..." value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 text-sm bg-transparent focus:outline-none" style={{ color: T.text }} />
              <button style={{ padding: '4px 10px', borderRadius: '8px', background: chatInput ? 'linear-gradient(135deg, #4472C4, #98BAE8)' : T.bg2, color: chatInput ? '#fff' : T.text3, fontSize: '12px', transition: 'all 0.15s', border: 'none', cursor: 'pointer' }}>Enviar</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center" style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.40)', border: '1px solid rgba(68,114,196,0.22)' }}>
          <div style={{ textAlign: 'center' }}>
            <ChatCircle className="w-12 h-12 mx-auto mb-3" style={{ color: T.text3 }} />
            <p style={{ fontSize: '14px', color: T.text3 }}>Seleccioná una conversación</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

type ClientsScreenProps = {
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  messages: Message[];
  onNewClient: () => void;
  onNavigateMessages?: () => void;
  initialClientId?: string | null;
  onClientOpened?: () => void;
};
const ClientsScreen = ({
  clients,
  appointments,
  services,
  messages,
  onNewClient,
  onNavigateMessages,
  initialClientId,
  onClientOpened
}: ClientsScreenProps) => {
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId ?? null);
  const [clientPanelTab, setClientPanelTab] = useState<'chat' | 'history'>('chat');
  const [chatInput, setChatInput] = useState('');
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) setStatusDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
      setClientPanelTab('chat');
      if (onClientOpened) onClientOpened();
    }
  }, [initialClientId, onClientOpened]);
  const selectedClient = clients.find(c => c.id === selectedClientId) ?? null;
  const messageByClient = useMemo(() => {
    const map: Record<string, Message> = {};
    messages.forEach(m => {
      map[m.clientId] = m;
    });
    return map;
  }, [messages]);
  const clientStats = useMemo(() => clients.map(c => {
    const apps = appointments.filter(a => a.clientId === c.id);
    const now = new Date();
    const futureApps = apps.filter(a => isAfter(a.date, now) && a.status !== 'cancelled' && a.status !== 'no_show')
      .sort((a, b) => a.date.getTime() - b.date.getTime() || toMins(a.startTime) - toMins(b.startTime));
    const pastConfirmed = apps.filter(a => a.date < now && a.status === 'confirmed')
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    const nextApp = futureApps[0] ?? null;
    const lastApp = pastConfirmed[0] ?? null;
    const hasUpcoming = futureApps.length > 0;
    const hasNoShows = apps.some(a => a.status === 'no_show');
    const confirmedCount = apps.filter(a => a.status === 'confirmed').length;
    return {
      client: c,
      totalApps: apps.length,
      confirmedCount,
      hasUpcoming,
      hasNoShows,
      nextApp,
      lastApp,
    };
  }), [clients, appointments]);
  const filtered = clientStats.filter(({
    client,
    hasUpcoming,
    hasNoShows,
    totalApps
  }) => {
    const matchSearch = client.name.toLowerCase().includes(search.toLowerCase()) || client.phone.includes(search);
    let matchStatus = true;
    if (statusFilter === 'con_turno') matchStatus = hasUpcoming;else if (statusFilter === 'sin_turno') matchStatus = totalApps === 0 || !hasUpcoming;else if (statusFilter === 'con_ausencias') matchStatus = hasNoShows;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    // Orden por relevancia CRM:
    // 1. Clientes con próximo turno (más cercano primero)
    // 2. Clientes con último turno (más reciente primero)
    // 3. Clientes sin actividad (alfabético)
    if (a.nextApp && b.nextApp) return a.nextApp.date.getTime() - b.nextApp.date.getTime();
    if (a.nextApp && !b.nextApp) return -1;
    if (!a.nextApp && b.nextApp) return 1;
    if (a.lastApp && b.lastApp) return b.lastApp.date.getTime() - a.lastApp.date.getTime();
    if (a.lastApp && !b.lastApp) return -1;
    if (!a.lastApp && b.lastApp) return 1;
    return a.client.name.localeCompare(b.client.name);
  });
  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setClientPanelTab('chat');
    setChatInput('');
  };
  const clientApps = useMemo(() => {
    if (!selectedClient) return [];
    return appointments.filter(a => a.clientId === selectedClient.id).sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
  }, [appointments, selectedClient]);
  const pastApps = useMemo(() => clientApps.filter(a => a.date < new Date() || ['cancelled', 'no_show'].includes(a.status)), [clientApps]);
  const totalSpend = pastApps.filter(a => a.status === 'confirmed').reduce((s, a) => s + (services.find(x => x.id === a.serviceId)?.price ?? 0), 0);
  const noShows = clientApps.filter(a => a.status === 'no_show').length;
  const chatMessages = selectedClient ? MOCK_CHAT[selectedClient.id] ?? [] : [];
  const clientMsg = selectedClient ? messageByClient[selectedClient.id] : null;
  const unreadCount = clientStats.filter(({
    client
  }) => messageByClient[client.id]?.unread).length;
  const currentStatusLabel = STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label ?? 'Todos';
  return <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-4" style={{ background: 'transparent' }}>
    {/* ── Section header ── */}
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', paddingBottom: '16px', borderBottom: `1px solid ${T.border}`, marginBottom: '8px', flexShrink: 0 }}>
      <h2 style={{ fontSize: '24px', fontWeight: 400, color: T.dark, fontFamily: DM_SERIF, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.1 }}>Clientes</h2>
    </div>
    {/* ── Panels ── */}
    <div className="flex-1 flex overflow-hidden gap-3" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
    {/* Left panel — inbox (sin fondo: regla "fondo = atención", el detail tiene el fondo) */}
    <div className={cn('flex flex-col overflow-hidden shrink-0 md:w-[320px]', selectedClientId ? 'hidden md:flex' : 'flex w-full')} style={{ background: 'transparent' }}>
      <div className="px-4 py-3 shrink-0" style={{
        borderBottom: `1px solid ${T.border}`,
        background: 'transparent'
      }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2.5" style={{
          border: `1px solid ${T.border}`,
          background: 'rgba(0,0,0,0.04)'
        }}>
          <MagnifyingGlass className="w-4 h-4 shrink-0" style={{
            color: T.text3
          }} />
          <input type="text" placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent focus:outline-none" style={{
            color: T.text
          }} />
          {search && <button onClick={() => setSearch('')} className="shrink-0 p-0.5 rounded-md hover:bg-black/5"><X className="w-3 h-3" style={{
              color: T.text3
            }} /></button>}
        </div>
        <div className="flex items-center gap-2">
          {/* Filtro 'No leídos' removido — no aplica en Clientes (es CRM, no inbox) */}
          <div ref={statusDropdownRef} className="relative flex-1">
            <button onClick={() => setStatusDropdownOpen(v => !v)} className="w-full flex items-center justify-between gap-1.5 text-[12px] font-normal px-3 py-1.5 rounded-xl transition-all" style={{
              background: statusFilter !== 'all' ? T.orangeLight : T.bg2,
              color: statusFilter !== 'all' ? T.orange : T.text2,
              border: `1px solid ${statusFilter !== 'all' ? T.borderO : T.border}`
            }}>
              <span className="truncate">{currentStatusLabel}</span>
              <CaretDown className="w-3 h-3 shrink-0" style={{
                transform: statusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s'
              }} />
            </button>
            <AnimatePresence>
              {statusDropdownOpen && <motion.div initial={{
                opacity: 0,
                y: -4,
                scale: 0.97
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -4,
                scale: 0.97
              }} transition={{
                duration: 0.12
              }} style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: T.shadowLg,
                border: `1px solid ${T.border}`,
                zIndex: 50,
                overflow: 'hidden'
              }}>
                {STATUS_FILTER_OPTIONS.map(opt => <button key={opt.value} onClick={() => {
                  setStatusFilter(opt.value);
                  setStatusDropdownOpen(false);
                }} className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-normal text-left transition-colors hover:bg-black/5" style={{
                  color: statusFilter === opt.value ? T.orange : T.text,
                  fontWeight: 400,
                  borderBottom: `1px solid ${T.border}`
                }}>
                  <span>{opt.label}</span>
                  {statusFilter === opt.value && <Check className="w-3.5 h-3.5" style={{
                    color: T.orange
                  }} />}
                </button>)}
              </motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(({
          client,
          totalApps,
          confirmedCount,
          nextApp,
          lastApp,
          hasNoShows,
        }) => {
          const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          const isSelected = selectedClientId === client.id;

          // Build contextual CRM subtitle (smart: próximo > último > sin actividad)
          const formatRelative = (d: Date) => {
            const todayStart = startOfToday();
            const daysDiff = Math.round((d.getTime() - todayStart.getTime()) / 86400000);
            if (daysDiff === 0) return 'hoy';
            if (daysDiff === 1) return 'mañana';
            if (daysDiff === -1) return 'ayer';
            if (daysDiff > 1 && daysDiff <= 7) return format(d, 'EEEE', { locale: es });
            if (daysDiff < -1 && daysDiff >= -7) return `hace ${Math.abs(daysDiff)} días`;
            return format(d, "d 'de' MMM", { locale: es });
          };
          let subtitle: React.ReactNode;
          if (nextApp) {
            const svc = services.find(s => s.id === nextApp.serviceId);
            subtitle = (
              <span>
                <span style={{ color: T.orange, fontWeight: 500 }}>Próximo</span>
                <span style={{ color: T.text3 }}> · </span>
                <span style={{ color: T.text2 }}>{formatRelative(nextApp.date)} {nextApp.startTime}</span>
                {svc && <><span style={{ color: T.text3 }}> · </span><span style={{ color: T.text3 }}>{svc.name}</span></>}
              </span>
            );
          } else if (lastApp) {
            subtitle = (
              <span style={{ color: T.text3 }}>
                Último {formatRelative(lastApp.date)} · {confirmedCount} {confirmedCount === 1 ? 'visita' : 'visitas'}
              </span>
            );
          } else {
            subtitle = <span style={{ color: T.text3, fontStyle: 'italic' }}>Sin turnos aún</span>;
          }

          return (
            <div key={client.id} onClick={() => handleSelectClient(client.id)} className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-black/[0.02]" style={{
              background: isSelected ? T.orangePale : 'transparent',
              borderBottom: `1px solid ${T.border}`,
              borderLeft: isSelected ? `3px solid ${T.orange}` : '3px solid transparent'
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-white text-sm shrink-0" style={{ background: SAGE }}>{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2" style={{ marginBottom: '3px' }}>
                  <p className="font-medium text-[14px] truncate" style={{ color: T.text }}>{client.name}</p>
                  {/* Tags visibles en el list item */}
                  {client.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] font-normal px-1.5 py-0.5 rounded-full shrink-0" style={{
                      background: TAG_COLORS[tag]?.bg ?? T.bg2,
                      color: TAG_COLORS[tag]?.text ?? T.text2,
                    }}>{tag}</span>
                  ))}
                  {hasNoShows && (
                    <span title="Tiene no-shows" className="shrink-0" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '2px',
                      fontSize: '10px', color: '#C62828',
                    }}>
                      <Warning size={10} weight="fill" />
                    </span>
                  )}
                </div>
                <p className="text-[12px] truncate" style={{ lineHeight: 1.4 }}>{subtitle}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-center py-8 font-normal" style={{
          color: T.text3
        }}>Sin resultados</p>}
      </div>
    </div>
    {/* Right panel — metrics-focused client card */}
    {selectedClient ? (() => {
      const upcomingApps = clientApps.filter(a => a.date >= new Date() && a.status !== 'cancelled' && a.status !== 'no_show');
      const confirmedCount = clientApps.filter(a => a.status === 'confirmed').length;
      const lastVisit = pastApps.filter(a => a.status === 'confirmed').sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      // Service preferences
      const serviceCounts: Record<string, number> = {};
      clientApps.forEach(a => { if (a.status === 'confirmed') serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] ?? 0) + 1; });
      const favoriteServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const initials = selectedClient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      return (
        <div key={selectedClient.id} className="flex-1 flex flex-col overflow-hidden anim-float-in" style={{
          borderRadius: '18px',
          background: 'rgba(255,255,255,0.50)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(91,143,166,0.22)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
        }}>
          {/* Header */}
          <div className="px-6 py-5 shrink-0 flex items-start gap-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <button onClick={() => setSelectedClientId(null)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 mr-0 shrink-0">
              <CaretLeft className="w-4 h-4" style={{ color: T.text2 }} />
            </button>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-medium text-white text-base shrink-0" style={{ background: SAGE }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontFamily: DM_SERIF, fontSize: '22px', fontWeight: 400, color: T.dark, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.15 }}>{selectedClient.name}</h3>
              <div className="flex items-center gap-3 mt-1.5" style={{ flexWrap: 'wrap' }}>
                <span className="flex items-center gap-1.5 text-[13px]" style={{ color: T.text2 }}><Phone size={12} />{selectedClient.phone}</span>
                {selectedClient.tags.map(tag => <span key={tag} className="text-[11px] font-normal px-2 py-0.5 rounded-full" style={{
                  background: TAG_COLORS[tag]?.bg ?? T.bg2,
                  color: TAG_COLORS[tag]?.text ?? T.text2
                }}>{tag}</span>)}
              </div>
            </div>
            <button onClick={() => onNavigateMessages?.()} className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors hover:opacity-90" style={{ background: T.bg2, color: T.text, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
              <ChatCircle size={14} /><span>Ver conversación</span>
            </button>
          </div>

          {/* Body — metrics dashboard */}
          <div className="flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
            {/* Stats grid */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-3" style={{ color: T.text3 }}>Métricas</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Turnos', value: String(clientApps.length), icon: Calendar, accent: T.dark },
                  { label: 'Confirmados', value: String(confirmedCount), icon: CheckCircle, accent: '#10B981' },
                  { label: 'No-shows', value: String(noShows), icon: Warning, accent: noShows > 0 ? '#C62828' : T.text3 },
                  { label: 'Lifetime', value: totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—', icon: CurrencyDollar, accent: T.orange },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: T.text3 }}>{stat.label}</p>
                      <stat.icon size={12} style={{ color: stat.accent, opacity: 0.7 }} />
                    </div>
                    <p style={{ fontFamily: INSTRUMENT_SERIF, fontSize: '22px', lineHeight: 1, color: stat.accent, letterSpacing: '-0.01em' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Last visit + Favorite services */}
            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: `1px solid ${T.border}`, marginTop: '12px' }}>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-2" style={{ color: T.text3 }}>Último turno</p>
                {lastVisit ? (
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} style={{ color: T.text2 }} />
                    <div>
                      <p className="text-[13px]" style={{ color: T.text }}>{format(lastVisit.date, "d 'de' MMMM, yyyy", { locale: es })}</p>
                      <p className="text-[12px]" style={{ color: T.text3 }}>{services.find(s => s.id === lastVisit.serviceId)?.name ?? '—'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] italic" style={{ color: T.text3 }}>Sin visitas previas</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-2" style={{ color: T.text3 }}>Servicios favoritos</p>
                {favoriteServices.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {favoriteServices.map(([sid, count]) => {
                      const svc = services.find(s => s.id === sid);
                      if (!svc) return null;
                      return (
                        <span key={sid} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(68,114,196,0.08)', color: T.text }}>
                          <Heart size={10} weight="fill" style={{ color: T.orange }} />{svc.name} <span style={{ color: T.text3 }}>×{count}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] italic" style={{ color: T.text3 }}>Aún no hay datos</p>
                )}
              </div>
            </div>

            {/* Notas */}
            <div className="px-6 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-2" style={{ color: T.text3 }}>Notas internas</p>
              {selectedClient.notes ? (
                <p className="text-[13px] leading-relaxed" style={{ color: T.text2 }}>{selectedClient.notes}</p>
              ) : (
                <p className="text-[13px] italic" style={{ color: T.text3 }}>Sin notas. Agregá detalles del cliente para que el agente los tenga en cuenta.</p>
              )}
            </div>

            {/* Próximos turnos */}
            {upcomingApps.length > 0 && (
              <div className="px-6 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-3" style={{ color: T.text3 }}>Próximos turnos</p>
                <div className="space-y-2">
                  {upcomingApps.map(app => {
                    const svc = services.find(s => s.id === app.serviceId);
                    return (
                      <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid ${T.border}` }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px]" style={{ color: T.text }}>{format(app.date, "d MMM", { locale: es })} · {app.startTime}</p>
                          <p className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{svc?.name ?? '—'}</p>
                        </div>
                        <StatusPill status={app.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historial */}
            <div className="px-6 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.09em] mb-3" style={{ color: T.text3 }}>Historial</p>
              <div className="space-y-2">
                {pastApps.length === 0 && <p className="text-[13px] italic" style={{ color: T.text3 }}>Sin historial aún</p>}
                {pastApps.slice(0, 8).map(app => {
                  const svc = services.find(s => s.id === app.serviceId);
                  const sc = STATUS_CONFIG[app.status];
                  return (
                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.40)', border: `1px solid ${T.border}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[12px]" style={{ color: T.text }}>{format(app.date, "d MMM yyyy", { locale: es })}</p>
                          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: T.text2 }}><Clock size={10} />{app.startTime} — {svc?.name}</p>
                      </div>
                      {svc && app.status === 'confirmed' && <p className="text-[13px] shrink-0" style={{ color: T.text }}>${svc.price.toLocaleString()}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    })() : <div className="hidden md:flex flex-1 items-center justify-center flex-col" style={{
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.40)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(91,143,166,0.22)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
      padding: '40px 32px',
    }}>
      {/* Editorial empty state for Clientes */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(68,114,196,0.10), rgba(91,143,166,0.06))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <User size={28} style={{ color: T.orange }} weight="duotone" />
      </div>
      <h3 style={{
        fontFamily: DM_SERIF, fontSize: '22px', fontWeight: 400,
        color: T.dark, margin: 0, marginBottom: '6px',
        letterSpacing: '-0.01em',
      }}>
        Ficha del cliente
      </h3>
      <p className="text-center" style={{
        fontSize: '13px', fontWeight: 400, color: T.text3,
        maxWidth: '280px', lineHeight: 1.5, marginBottom: '20px',
      }}>
        Seleccioná un cliente de la lista para ver sus métricas, historial y servicios favoritos.
      </p>
      <div className="flex items-center gap-2" style={{ fontSize: '12px', color: T.text3 }}>
        <span>O</span>
        <button onClick={onNewClient} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-90" style={{ background: T.orange, color: '#fff', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          <UserPlus size={14} />
          <span>Crear cliente nuevo</span>
        </button>
      </div>
    </div>}
    </div>
  </div>;
};

// ─── CONFIG SCREEN ─────────────────────────────────────────────────────────────
type ConfigScreenProps = {
  services: Service[];
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  onAddService: () => void;
  onEditService: (s: Service) => void;
};
const REMINDER_ITEMS = [{
  id: 'r1',
  title: 'Recordatorio 24 h antes',
  sub: 'El bot envía un mensaje el día anterior',
  defaultOn: true
}, {
  id: 'r2',
  title: 'Recordatorio 2 h antes',
  sub: 'Mensaje de confirmación de último momento',
  defaultOn: true
}, {
  id: 'r3',
  title: 'Mensaje de cancelación',
  sub: 'Notificación automática si se cancela',
  defaultOn: false
}, {
  id: 'r4',
  title: 'Encuesta post-turno',
  sub: 'Pedido de reseña luego del servicio',
  defaultOn: false
}];
const CONFIG_NAV = [
  { sectionId: 'negocio',    sectionLabel: 'Negocio',    subsections: [{ id: 'general', label: 'General' }, { id: 'sedes', label: 'Sedes' }, { id: 'equipo', label: 'Equipo' }] },
  { sectionId: 'operacion',  sectionLabel: 'Operación',  subsections: [{ id: 'servicios', label: 'Servicios' }, { id: 'disponibilidad', label: 'Disponibilidad' }, { id: 'recursos', label: 'Recursos' }] },
  { sectionId: 'experiencia',sectionLabel: 'Experiencia',subsections: [{ id: 'asistente', label: 'Asistente IA' }, { id: 'notificaciones', label: 'Notificaciones' }, { id: 'politicas', label: 'Políticas' }] },
  { sectionId: 'cuenta',     sectionLabel: 'Cuenta',     subsections: [{ id: 'facturacion', label: 'Facturación' }] },
];
const ConfigScreen = ({
  services,
  providers,
  setProviders,
  onAddService,
  onEditService
}: ConfigScreenProps) => {
  const toggleProvider = (id: string) => setProviders(prev => prev.map(p => p.id === id ? {
    ...p,
    active: !p.active
  } : p));
  const [reminders, setReminders] = useState<Record<string, boolean>>(Object.fromEntries(REMINDER_ITEMS.map(r => [r.id, r.defaultOn])));
  const [botFromTime, setBotFromTime] = useState('09:00');
  const [botToTime, setBotToTime] = useState('20:00');
  const [botDnd, setBotDnd] = useState(true);
  const [botMode, setBotMode] = useState<BotMode>('auto');
  const maxProviders = 5;
  const [activeSub, setActiveSub] = useState<string>('general');
  const [activeSection, setActiveSection] = useState<string>('negocio');
  const configScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollSubRef = useRef<string | null>(null);

  useEffect(() => {
    const container = configScrollRef.current;
    if (!container) return;
    // If we have a pending scroll after a section switch, execute it now
    const pending = pendingScrollSubRef.current;
    if (pending) {
      pendingScrollSubRef.current = null;
      const el = container.querySelector(`[data-sub="${pending}"]`);
      if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveSub(visible[0].target.getAttribute('data-sub') ?? '');
    }, { root: container, rootMargin: '0px 0px -55% 0px', threshold: 0 });
    container.querySelectorAll('[data-sub]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  const navigateToSection = (sectionId: string) => {
    const section = CONFIG_NAV.find(s => s.sectionId === sectionId);
    if (!section) return;
    setActiveSection(sectionId);
    setActiveSub(section.subsections[0].id);
    if (configScrollRef.current) configScrollRef.current.scrollTop = 0;
  };

  const scrollToSub = (subId: string, sectionId: string) => {
    if (sectionId !== activeSection) {
      pendingScrollSubRef.current = subId;
      setActiveSection(sectionId);
      setActiveSub(subId);
    } else {
      setActiveSub(subId);
      const el = configScrollRef.current?.querySelector(`[data-sub="${subId}"]`);
      if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full px-4 sm:px-8 py-4" style={{ background: 'transparent' }}>
      {/* ── Section header ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', paddingBottom: '16px', borderBottom: `1px solid ${T.border}`, marginBottom: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 400, color: T.dark, fontFamily: DM_SERIF, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.1 }}>Configuración</h2>
        {/* Mobile-only subsection selector */}
        <select
          className="md:hidden text-[13px] rounded-lg border px-3 py-1.5 max-w-[180px]"
          style={{ background: 'rgba(255,255,255,0.6)', borderColor: T.border, color: T.text, fontFamily: DM_SANS, outline: 'none' }}
          value={activeSub}
          onChange={e => {
            const subId = e.target.value;
            const section = CONFIG_NAV.find(s => s.subsections.some(sub => sub.id === subId));
            if (section) scrollToSub(subId, section.sectionId);
          }}
        >
          {CONFIG_NAV.map(section => (
            <optgroup key={section.sectionId} label={section.sectionLabel}>
              {section.subsections.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {/* ── Panels ── */}
      <div className="flex-1 flex overflow-hidden gap-3 min-h-0" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>

        {/* ── Left nav with scrollspy (sin fondo: regla "fondo = atención") ── */}
        <div className="hidden md:flex flex-col shrink-0 overflow-y-auto min-h-0 h-full" style={{ width: '196px', background: 'transparent' }}>
          <nav style={{ padding: '8px 8px 16px' }}>
            {CONFIG_NAV.map((section, si) => {
              const isSectionActive = activeSection === section.sectionId;
              return (
                <div key={section.sectionId} style={{ marginTop: si > 0 ? '8px' : 0 }}>
                  {/* Section label — clickable, navigates to first subsection */}
                  <button onClick={() => navigateToSection(section.sectionId)} style={{ display: 'block', width: '100%', textAlign: 'left' as const, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: isSectionActive ? T.orange : T.text3, padding: '8px 12px 5px', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'color 0.15s', userSelect: 'none' as const }}>
                    {section.sectionLabel}
                  </button>
                  {/* Subsection items */}
                  {section.subsections.map(sub => {
                    const isSubActive = isSectionActive && activeSub === sub.id;
                    return (
                      <button key={sub.id} onClick={() => scrollToSub(sub.id, section.sectionId)} style={{ display: 'flex', alignItems: 'center', padding: isSubActive ? '7px 12px 7px 9px' : '7px 12px', borderRadius: isSubActive ? '0 10px 10px 0' : '8px', width: '100%', background: isSubActive ? 'rgba(68,114,196,0.09)' : 'transparent', color: isSubActive ? T.dark : T.text2, fontSize: '13px', fontWeight: isSubActive ? 500 : 400, cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: `3px solid ${isSubActive ? T.orange : 'transparent'}` }}>
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Right content — sin fondo propio, las CARDS internas son las "zonas de atención" ── */}
        <div ref={configScrollRef} className="flex-1 overflow-y-auto min-h-0 h-full" style={{ background: 'transparent' }}>

          <div key={activeSection} className="space-y-10 p-1 pb-24 anim-float-in">

            {/* ── NEGOCIO ── */}
            {activeSection === 'negocio' && <>

            {/* GENERAL */}
            <div data-sub="general">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>General</p>
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Datos del negocio</h3></div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Nombre</label><input type="text" defaultValue="Barbería Norte" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Dirección</label><input type="text" defaultValue="Av. Corrientes 1234, CABA" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Teléfono de contacto</label><input type="text" defaultValue="+54 11 4567-8901" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Instagram</label><input type="text" defaultValue="@barberia.norte" className={inp} style={inpStyle} /></div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Horarios de atención</h3></div>
                  <div className="divide-y" style={{ borderColor: T.border }}>
                    {DAYS_ORDER.map(dayIdx => (
                      <div key={dayIdx} className="flex items-center gap-4 px-5 py-3">
                        <p className="text-sm font-normal w-24 shrink-0" style={{ color: T.text }}>{DAY_NAMES[dayIdx]}</p>
                        {dayIdx === 0 ? <span className="text-xs font-normal px-2 py-1 rounded-lg" style={{ background: T.bg2, color: T.text3 }}>Cerrado</span> : <span className="text-xs font-normal" style={{ color: T.text3 }}>09:00 – 13:00 / 15:00 – 19:00</span>}
                        <Toggle checked={dayIdx !== 0} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEDES */}
            <div data-sub="sedes">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Sedes</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div><h3 className="font-normal text-sm" style={{ color: T.text }}>Sede principal</h3><p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>Av. Corrientes 1234, CABA</p></div>
                  <span className="text-xs font-normal px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.07)', color: '#059669', border: '1px solid rgba(16,185,129,0.18)' }}>Activa</span>
                </div>
              </div>
            </div>

            {/* EQUIPO */}
            <div data-sub="equipo">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Equipo</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Profesionales</h3><p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>Máximo 5 · El/la dueño/a siempre es prestador</p></div>
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {providers.map(p => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-normal text-white text-sm shrink-0" style={{ background: p.color ?? SAGE }}>{p.initials}</div>
                      <div className="flex-1 min-w-0"><p className="font-normal text-sm" style={{ color: T.text }}>{p.name}</p><p className="text-xs font-normal" style={{ color: T.text3 }}>{p.role === 'owner' ? 'Dueño/a' : 'Staff'}</p></div>
                      <Toggle checked={p.active} onChange={() => toggleProvider(p.id)} disabled={p.role === 'owner'} />
                    </div>
                  ))}
                  {providers.length < maxProviders && <div className="px-5 py-3"><button className="flex items-center gap-2 text-sm font-normal" style={{ color: T.orange }}><Plus className="w-4 h-4" /><span>Agregar profesional</span></button></div>}
                </div>
              </div>
            </div>

            </>}{/* end negocio */}

            {/* ── OPERACION ── */}
            {activeSection === 'operacion' && <>

            {/* SERVICIOS */}
            <div data-sub="servicios">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3 }}>Servicios</p>
                <button onClick={onAddService} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '10px', background: T.orange, color: '#fff', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}><Plus className="w-3 h-3" /><span>Nuevo</span></button>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {services.map(svc => {
                    const IconComp = getServiceIcon(svc.name);
                    const activeDays = Object.keys(svc.availability).map(Number).filter(d => (svc.availability[d]?.length ?? 0) > 0);
                    return (
                      <div key={svc.id} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: SAGE }}><IconComp className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-normal text-sm" style={{ color: T.text }}>{svc.name}</p>
                          <p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>{svc.duration} min · ${svc.price.toLocaleString()}</p>
                          <div className="flex gap-1 mt-1.5 flex-wrap">{DAYS_ORDER.map(d => <span key={d} className="text-[11px] font-normal px-1.5 py-0.5 rounded-md" style={{ background: activeDays.includes(d) ? `${svc.color}20` : T.bg2, color: activeDays.includes(d) ? svc.color : T.text3 }}>{DAY_NAMES[d].slice(0, 3)}</span>)}</div>
                        </div>
                        <button onClick={() => onEditService(svc)} className="p-2 rounded-xl hover:bg-black/5 transition-colors shrink-0" style={{ color: T.text2 }}><Gear size={16} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DISPONIBILIDAD */}
            <div data-sub="disponibilidad">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Disponibilidad</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Slots y disponibilidad</h3></div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Slots totales por día</label><input type="number" defaultValue={20} className={inp} style={inpStyle} /></div>
                  <div><label className={lbl}>Duración mínima (min)</label><input type="number" defaultValue={30} className={inp} style={inpStyle} /></div>
                  <div><label className={lbl}>Tiempo entre turnos (min)</label><input type="number" defaultValue={10} className={inp} style={inpStyle} /></div>
                  <div><label className={lbl}>Máx. turnos por día</label><input type="number" defaultValue={16} className={inp} style={inpStyle} /></div>
                </div>
              </div>
            </div>

            {/* RECURSOS */}
            <div data-sub="recursos">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Recursos</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4"><h3 className="font-normal text-sm" style={{ color: T.text }}>Recursos del negocio</h3><p className="text-xs font-normal mt-1" style={{ color: T.text3 }}>Gestioná equipos, sillas y herramientas disponibles.</p></div>
              </div>
            </div>

            </>}{/* end operacion */}

            {/* ── EXPERIENCIA ── */}
            {activeSection === 'experiencia' && <>

            {/* ASISTENTE IA */}
            <div data-sub="asistente">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Asistente IA</p>
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Configuración del asistente</h3></div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Nombre del asistente</label><input type="text" defaultValue="Perla Bot" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Tono</label><select className={inp} style={inpStyle} defaultValue="friendly"><option value="friendly">Amigable y cercano</option><option value="formal">Formal y profesional</option><option value="casual">Casual y divertido</option></select></div>
                    <div className="sm:col-span-2"><label className={lbl}>Mensaje de bienvenida</label><textarea defaultValue="¡Hola! Soy el asistente de Barbería Norte. ¿En qué puedo ayudarte?" rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" style={inpStyle} /></div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Horario del asistente</h3></div>
                  <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div className="flex-1 min-w-0"><p className="text-sm font-normal" style={{ color: T.text }}>Horario de actividad</p><p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>El asistente responde en este rango</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <input type="time" value={botFromTime} onChange={e => setBotFromTime(e.target.value)} className={inp} style={{ ...inpStyle, width: '100px', padding: '6px 10px' }} />
                      <span className="text-xs" style={{ color: T.text3 }}>a</span>
                      <input type="time" value={botToTime} onChange={e => setBotToTime(e.target.value)} className={inp} style={{ ...inpStyle, width: '100px', padding: '6px 10px' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0"><p className="text-sm font-normal" style={{ color: T.text }}>No molestar</p><p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>Pausa notificaciones fuera del horario activo</p></div>
                    <Toggle checked={botDnd} onChange={setBotDnd} />
                  </div>
                </div>
              </div>
            </div>

            {/* NOTIFICACIONES */}
            <div data-sub="notificaciones">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Notificaciones</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Recordatorios automáticos</h3></div>
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {REMINDER_ITEMS.map(r => (
                    <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0"><p className="text-sm font-normal" style={{ color: T.text }}>{r.title}</p><p className="text-xs font-normal" style={{ color: T.text3 }}>{r.sub}</p></div>
                      <Toggle checked={!!reminders[r.id]} onChange={v => setReminders(prev => ({ ...prev, [r.id]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* POLÍTICAS */}
            <div data-sub="politicas">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Políticas</p>
              <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Cancelaciones</h3></div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Límite de cancelación (horas)</label><input type="number" defaultValue={12} className={inp} style={inpStyle} /></div>
                  <div><label className={lbl}>Política de no-show</label><select className={inp} style={inpStyle} defaultValue="warn"><option value="none">Sin acción</option><option value="warn">Avisar al cliente</option><option value="block">Bloquear al cliente</option></select></div>
                </div>
              </div>
            </div>

            </>}{/* end experiencia */}

            {/* ── CUENTA ── */}
            {activeSection === 'cuenta' && <>

            {/* FACTURACIÓN */}
            <div data-sub="facturacion">
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: T.text3, marginBottom: '12px' }}>Facturación</p>
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Perfil</h3></div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Nombre</label><input type="text" defaultValue="Camila Navarro" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Email</label><input type="email" defaultValue="camila@barberia.com" className={inp} style={inpStyle} /></div>
                    <div><label className={lbl}>Teléfono</label><input type="text" defaultValue="+54 11 9876-5432" className={inp} style={inpStyle} /></div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}><h3 className="font-normal text-sm" style={{ color: T.text }}>Plan activo</h3></div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div><p className="text-sm font-normal" style={{ color: T.text }}>Plan Básico</p><p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>Hasta 5 profesionales · 1 sede · Asistente WhatsApp</p></div>
                    <button style={{ padding: '6px 14px', borderRadius: '10px', background: T.orange, color: '#fff', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Mejorar</button>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
                  <div className="divide-y" style={{ borderColor: T.border }}>
                    <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-black/[0.02] transition-colors text-left"><Lock size={16} style={{ color: T.text2, flexShrink: 0 }} /><span className="text-sm font-normal" style={{ color: T.text }}>Cambiar contraseña</span></button>
                    <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-black/[0.02] transition-colors text-left"><SignOut size={16} style={{ color: T.text2, flexShrink: 0 }} /><span className="text-sm font-normal" style={{ color: T.text }}>Cerrar sesión</span></button>
                  </div>
                </div>
              </div>
            </div>

            </>}{/* end cuenta */}

          </div>
        </div>
      </div>
    </div>
  );
};

// ─── APPOINTMENT DETAIL ────────────────────────────────────────────────────────
type ApptDetailProps = {
  appointment: Appointment;
  services: Service[];
  providerMap: Record<string, Provider>;
  clientMap: Record<string, Client>;
  onClose: () => void;
  onReschedule: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenClient: (id: string) => void;
};
const AppointmentDetail = ({
  appointment,
  services,
  providerMap,
  clientMap,
  onClose,
  onReschedule,
  onUpdateStatus,
  onOpenClient
}: ApptDetailProps) => {
  const svc = services.find(s => s.id === appointment.serviceId);
  const prov = providerMap[appointment.providerId];
  const sc = STATUS_CONFIG[appointment.status];
  const clientData = clientMap[appointment.clientId];
  const showToast = React.useContext(ToastContext);
  const rows = [{
    label: 'Servicio',
    value: svc?.name ?? '—'
  }, {
    label: 'Fecha',
    value: format(appointment.date, "d 'de' MMMM yyyy", {
      locale: es
    })
  }, {
    label: 'Hora',
    value: appointment.startTime
  }, {
    label: 'Duración',
    value: `${svc?.duration ?? '—'} min`
  }, {
    label: 'Precio',
    value: svc ? `$${svc.price.toLocaleString()}` : '—'
  }];
  const initials = appointment.clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  return <div className="flex flex-col h-full overflow-hidden">
    {/* Header */}
    <div className="shrink-0 px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 shrink-0">
        <CaretLeft className="w-4 h-4" style={{ color: T.text2 }} />
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-normal text-base truncate" style={{ color: T.text }}>{appointment.clientName}</h3>
        <p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>{svc?.name ?? '—'} · {appointment.startTime}</p>
      </div>
      <span className="text-[11px] font-normal px-2.5 py-1 rounded-full shrink-0" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
    </div>

    {/* Body */}
    <div className="flex-1 overflow-y-auto">
      <div style={{ padding: '20px' }}>

        {/* Client card — único con card visual */}
        <div onClick={() => onOpenClient(appointment.clientId)} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-opacity hover:opacity-80" style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-normal shrink-0" style={{ background: SAGE_GRAD }}>{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="font-normal text-sm" style={{ color: T.text }}>{appointment.clientName}</p>
            {clientData?.phone && <div className="flex items-center gap-1 mt-0.5" style={{ color: T.text2 }}>
              <Phone className="w-3 h-3" />
              <span className="text-xs">{clientData.phone}</span>
            </div>}
          </div>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: T.text3 }} />
        </div>

        {/* Datos del servicio — filas con divisores */}
        <div style={{ marginTop: '20px' }}>
          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : undefined }}>
              <span style={{ fontSize: '12px', color: T.text3 }}>{row.label}</span>
              <span style={{ fontSize: '13px', color: T.text, fontWeight: 400 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Profesional — debajo del servicio */}
        {prov && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: prov.color ?? SAGE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 400, flexShrink: 0 }}>{prov.initials}</div>
            <div>
              <p style={{ fontSize: '11px', color: T.text3, marginBottom: '2px' }}>Profesional</p>
              <p style={{ fontSize: '13px', color: T.text }}>{prov.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Footer buttons */}
    <div className="shrink-0 p-4" style={{ borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Fila 1: acciones primarias */}
        <div style={{ display: 'grid', gridTemplateColumns: appointment.status === 'confirmed' ? '1fr' : '1fr 1fr', gap: '8px' }}>
          {appointment.status !== 'confirmed' && (
            <button onClick={() => { onUpdateStatus(appointment.id, 'confirmed'); showToast('Turno confirmado'); }}
              className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
              style={{ background: SAGE, color: '#fff' }}>
              <CheckCircle className="w-3.5 h-3.5" /><span>Confirmar</span>
            </button>
          )}
          <button onClick={onReschedule}
            className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
            style={{ background: T.dark, color: '#fff' }}>
            <CalendarCheck className="w-3.5 h-3.5" /><span>Reagendar</span>
          </button>
        </div>
        {/* Fila 2: acciones destructivas */}
        {(appointment.status !== 'no_show' && appointment.status !== 'cancelled') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => { onUpdateStatus(appointment.id, 'no_show'); showToast('Marcado como no-show'); }}
              className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(68,114,196,0.08)', color: T.text2, border: `1px solid ${T.border}` }}>
              <XCircle className="w-3.5 h-3.5" /><span>No show</span>
            </button>
            <button onClick={() => { onUpdateStatus(appointment.id, 'cancelled'); showToast('Turno cancelado'); }}
              className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(68,114,196,0.08)', color: T.text2, border: `1px solid ${T.border}` }}>
              <X className="w-3.5 h-3.5" /><span>Cancelar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </div>;
};

// ─── NEW APPOINTMENT FORM ──────────────────────────────────────────────────────
type NewAppFormState = {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  providerId: string;
  date: string;
  time: string;
};
type NewAppointmentFormProps = {
  clients: Client[];
  services: Service[];
  providers: Provider[];
  newAppForm: NewAppFormState;
  setNewAppForm: React.Dispatch<React.SetStateAction<NewAppFormState>>;
  onClose: () => void;
  onSubmit: () => void;
};
const NewAppointmentForm = ({
  clients,
  services,
  providers,
  newAppForm,
  setNewAppForm,
  onClose,
  onSubmit
}: NewAppointmentFormProps) => {
  const [clientQuery, setClientQuery] = useState(newAppForm.clientName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientSelected, setClientSelected] = useState(false);
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientQuery.toLowerCase()) || c.phone.includes(clientQuery));
  const showCreate = clientQuery.trim().length > 0 && !filteredClients.some(c => c.name.toLowerCase() === clientQuery.trim().toLowerCase());
  const handleSelectClient = (c: Client) => {
    setClientQuery(c.name);
    setNewAppForm(f => ({
      ...f,
      clientName: c.name,
      clientPhone: c.phone
    }));
    setClientSelected(true);
    setDropdownOpen(false);
  };
  const handleCreateNew = () => {
    setNewAppForm(f => ({
      ...f,
      clientName: clientQuery.trim()
    }));
    setClientSelected(true);
    setDropdownOpen(false);
  };
  return <div className="space-y-3">
    <div className="relative">
      <label className={lbl}>Cliente</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><MagnifyingGlass className="w-3.5 h-3.5" style={{
            color: T.text3
          }} /></div>
        <input type="text" placeholder="Buscar cliente por nombre o teléfono..." value={clientQuery} onChange={e => {
          setClientQuery(e.target.value);
          setNewAppForm(f => ({
            ...f,
            clientName: e.target.value
          }));
          setClientSelected(false);
        }} onFocus={() => setDropdownOpen(true)} onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#6b8f7e]/40 transition-colors" style={inpStyle} />
        {clientSelected && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Check className="w-3.5 h-3.5" style={{
            color: '#43A047'
          }} /></div>}
      </div>
      {dropdownOpen && !clientSelected && <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl overflow-hidden z-50" style={{
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowLg
      }}>
        {filteredClients.map(c => {
          const initials = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          return <div key={c.id} onMouseDown={() => handleSelectClient(c)} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-black/5" style={{
            borderBottom: `1px solid ${T.border}`
          }}><div className="w-8 h-8 rounded-lg flex items-center justify-center font-normal text-white text-xs shrink-0" style={{
              background: T.orange
            }}>{initials}</div><div className="flex-1 min-w-0"><p className="text-sm font-normal truncate" style={{
                color: T.text
              }}>{c.name}</p><p className="text-xs font-normal" style={{
                color: T.text2
              }}>{c.phone || 'Sin teléfono'}</p></div></div>;
        })}
        {showCreate && <div onMouseDown={handleCreateNew} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-black/5"><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
            background: T.orangeLight
          }}><UserPlus className="w-4 h-4" style={{
              color: T.orange
            }} /></div><div className="flex-1 min-w-0"><p className="text-sm font-normal" style={{
              color: T.orange
            }}>Crear cliente nuevo</p><p className="text-xs font-normal truncate" style={{
              color: T.text3
            }}>"{clientQuery.trim()}"</p></div></div>}
        {filteredClients.length === 0 && !showCreate && <div className="px-4 py-3 text-sm font-normal" style={{
          color: T.text3
        }}>Sin resultados</div>}
      </div>}
    </div>
    <div><label className={lbl}>Servicio</label><select value={newAppForm.serviceId} onChange={e => setNewAppForm(f => ({
        ...f,
        serviceId: e.target.value
      }))} className={inp} style={inpStyle}>{services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.duration} min · ${s.price.toLocaleString()}</option>)}</select></div>
    <div><label className={lbl}>Profesional</label><select value={newAppForm.providerId} onChange={e => setNewAppForm(f => ({
        ...f,
        providerId: e.target.value
      }))} className={inp} style={inpStyle}><option value="general">General (primer disponible)</option>{providers.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={lbl}>Fecha</label><input type="date" value={newAppForm.date} onChange={e => setNewAppForm(f => ({
          ...f,
          date: e.target.value
        }))} className={inp} style={inpStyle} /></div>
      <div><label className={lbl}>Hora</label><input type="time" value={newAppForm.time} onChange={e => setNewAppForm(f => ({
          ...f,
          time: e.target.value
        }))} className={inp} style={inpStyle} /></div>
    </div>
    {newAppForm.serviceId && <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{
      background: T.orangeLight,
      border: `1px solid ${T.borderO}`
    }}><Clock className="w-3.5 h-3.5 shrink-0" style={{
        color: T.orange
      }} /><span className="text-xs" style={{
        color: T.orange
      }}><span>Duración: </span><strong>{services.find(s => s.id === newAppForm.serviceId)?.duration} min</strong></span></div>}
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-normal" style={{
        border: `1px solid ${T.border}`
      }}>Cancelar</button>
      <button onClick={onSubmit} disabled={!newAppForm.clientName.trim() || !newAppForm.serviceId} className="flex-1 py-3 rounded-xl text-sm font-normal text-white disabled:opacity-50 flex items-center justify-center gap-2" style={{
        background: T.dark
      }}><span>Crear turno</span></button>
    </div>
  </div>;
};

// ─── SERVICE EDIT ──────────────────────────────────────────────────────────────
type ServiceEditProps = {
  service: Service;
  onChange: (s: Service) => void;
  onSave: (s: Service) => void;
  onDelete: (id: string) => void;
  addTimeRange: (d: number) => void;
  removeTimeRange: (d: number, rid: string) => void;
  updateTimeRange: (d: number, rid: string, field: 'start' | 'end', val: string) => void;
  onClose: () => void;
};
const ServiceEdit = ({
  service,
  onChange,
  onSave,
  onDelete,
  addTimeRange,
  removeTimeRange,
  updateTimeRange,
  onClose
}: ServiceEditProps) => {
  const showToast = React.useContext(ToastContext);
  return <div className="flex flex-col h-full overflow-hidden">
    <div className="shrink-0 px-5 py-4 flex items-center gap-3" style={{
      borderBottom: `1px solid ${T.border}`
    }}>
      <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 shrink-0"><CaretLeft className="w-4 h-4" style={{
          color: T.text2
        }} /></button>
      <h3 className="font-normal text-base flex-1 truncate" style={{
        color: T.text
      }}>Editar servicio</h3>
      <button onClick={() => {
        onDelete(service.id);
        showToast('Servicio eliminado');
      }} className="p-2 rounded-xl hover:bg-rose-50 transition-colors shrink-0"><Trash className="w-4 h-4" style={{
          color: '#C62828'
        }} /></button>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <div><label className={lbl}>Nombre</label><input type="text" value={service.name} placeholder="Ej: Corte de cabello" onChange={e => onChange({
          ...service,
          name: e.target.value
        })} className={inp} style={inpStyle} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lbl}>Duración (min)</label><input type="number" value={service.duration} placeholder="30" onChange={e => onChange({
            ...service,
            duration: Number(e.target.value)
          })} className={inp} style={inpStyle} /></div>
        <div><label className={lbl}>Precio ($)</label><input type="number" value={service.price} placeholder="0" onChange={e => onChange({
            ...service,
            price: Number(e.target.value)
          })} className={inp} style={inpStyle} /></div>
      </div>
      <div>
        <label className={lbl}>Color</label>
        <div className="flex gap-2 flex-wrap mt-1">{COLOR_OPTIONS.map(c => <button key={c.hex} onClick={() => onChange({
            ...service,
            color: c.hex
          })} className="w-7 h-7 rounded-full border-2 transition-all" style={{
            background: c.hex,
            borderColor: service.color === c.hex ? T.text : 'transparent',
            transform: service.color === c.hex ? 'scale(1.2)' : 'scale(1)'
          }} title={c.label} />)}</div>
      </div>
      <div>
        <p className="text-[12px] font-normal uppercase tracking-widest mb-3" style={{
          color: T.text3
        }}>Disponibilidad</p>
        {DAYS_ORDER.map(dayIdx => <div key={dayIdx} className="p-4 rounded-2xl mb-2" style={{
          background: T.bg2,
          border: `1px solid ${T.border}`
        }}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-normal" style={{
              color: T.text
            }}>{DAY_NAMES[dayIdx]}</p>
            <button onClick={() => addTimeRange(dayIdx)} className="text-xs font-normal px-2.5 py-1 rounded-lg" style={{
              background: T.orangeLight,
              color: T.orange
            }}>+ Agregar</button>
          </div>
          {(service.availability[dayIdx] || []).map(range => <div key={range.id} className="flex items-center gap-2 mb-2">
            <input type="time" value={range.start} onChange={e => updateTimeRange(dayIdx, range.id, 'start', e.target.value)} className="text-xs p-2 rounded-lg border-none focus:outline-none min-w-0 flex-1" style={{
              background: T.bg2
            }} />
            <span className="text-xs shrink-0" style={{
              color: T.text3
            }}>→</span>
            <input type="time" value={range.end} onChange={e => updateTimeRange(dayIdx, range.id, 'end', e.target.value)} className="text-xs p-2 rounded-lg border-none focus:outline-none min-w-0 flex-1" style={{
              background: T.bg2
            }} />
            <button onClick={() => removeTimeRange(dayIdx, range.id)} className="p-2 rounded-lg hover:bg-rose-50 transition-colors shrink-0" style={{
              color: '#C62828'
            }}><X className="w-3.5 h-3.5" /></button>
          </div>)}
          {(service.availability[dayIdx] || []).length === 0 && <p className="text-xs font-normal" style={{
            color: T.text3
          }}>Sin horarios — cerrado este día</p>}
        </div>)}
      </div>
    </div>
    <div className="shrink-0 p-4" style={{
      borderTop: `1px solid ${T.border}`
    }}>
      <button onClick={() => {
        onSave(service);
        showToast('✓ Servicio guardado');
      }} className="w-full py-3 rounded-xl text-sm font-normal text-white flex items-center justify-center gap-2" style={{
        background: T.dark
      }}><FloppyDisk className="w-4 h-4" /><span>Guardar cambios</span></button>
    </div>
  </div>;
};

// ─── USER MENU ─────────────────────────────────────────────────────────────────
type UserMenuProps = {
  profile: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  onOpenSubscription: () => void;
  onOpenSupport: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
};
const ITEMS_CONFIG = [{
  id: 'account',
  icon: Gear,
  label: 'Mi cuenta',
  action: 'account' as const
}, {
  id: 'subscription',
  icon: CreditCard,
  label: 'Suscripción',
  action: 'subscription' as const
}, {
  id: 'share',
  icon: ShareNetwork,
  label: 'Compartir enlace',
  action: null as null
}, {
  id: 'support',
  icon: Question,
  label: 'Soporte',
  action: 'support' as const
}];
const UserMenu = ({
  profile,
  onClose,
  onLogout,
  onOpenAccount,
  onOpenSubscription,
  onOpenSupport,
  anchorRef
}: UserMenuProps) => {
  const rect = anchorRef.current?.getBoundingClientRect();
  const bottom = rect ? window.innerHeight - rect.top + 8 : 80;
  const left = rect ? rect.left : 16;
  return <motion.div initial={{
    opacity: 0,
    y: -8,
    scale: 0.97
  }} animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }} exit={{
    opacity: 0,
    y: -8,
    scale: 0.97
  }} transition={{
    duration: 0.15
  }} style={{
    position: 'fixed',
    top: 'auto',
    bottom: `${bottom}px`,
    left: `${left}px`,
    width: '220px',
    background: 'rgba(250,248,244,0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: T.shadowLg,
    border: `1px solid ${T.border}`,
    zIndex: 70,
    overflow: 'hidden'
  }}>
    <div className="px-4 py-3" style={{
      borderBottom: `1px solid ${T.border}`
    }}>
      <p className="text-sm font-normal" style={{
        color: T.text
      }}>{profile.name} {profile.lastName}</p>
      <p className="text-xs font-normal mt-0.5" style={{
        color: T.text3
      }}>{profile.email}</p>
    </div>
    <div className="py-1">
      {ITEMS_CONFIG.map(item => <button key={item.id} onClick={() => {
        if (item.action === 'account') onOpenAccount();else if (item.action === 'subscription') onOpenSubscription();else if (item.action === 'support') onOpenSupport();
        onClose();
      }} className="w-full flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 text-left" style={{
        color: T.text
      }}>
        <div className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{
          background: item.action === 'account' ? 'rgba(0,0,0,0.05)' : 'transparent'
        }}><item.icon style={{
            width: '18px',
            height: '18px'
          }} /></div>
        <span>{item.label}</span>
      </button>)}
    </div>
    <div style={{
      borderTop: `1px solid ${T.border}`
    }}>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 text-left" style={{
        color: '#C62828'
      }}><SignOut className="w-4 h-4 shrink-0" /><span>Cerrar sesión</span></button>
    </div>
  </motion.div>;
};

// ─── PENDING MODAL — central place to resolve pending appointments ─────────────
type PendingModalProps = {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  services: Service[];
  providerMap: Record<string, Provider>;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
};
const PendingModal = ({ open, onClose, appointments, services, providerMap, onUpdateStatus }: PendingModalProps) => {
  const showToast = React.useContext(ToastContext);
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;

  // Build time buckets of pending appointments
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);
  const pending = appointments.filter(a => a.status === 'pending');
  const bucketOf = (a: Appointment): 'hoy' | 'manana' | 'semana' | 'despues' => {
    if (isSameDay(a.date, today)) return 'hoy';
    if (isSameDay(a.date, tomorrow)) return 'manana';
    if (a.date <= weekEnd) return 'semana';
    return 'despues';
  };
  const buckets: { key: string; label: string; items: Appointment[] }[] = [
    { key: 'hoy',      label: 'Hoy',          items: pending.filter(a => bucketOf(a) === 'hoy').sort((a, b) => toMins(a.startTime) - toMins(b.startTime)) },
    { key: 'manana',   label: 'Mañana',       items: pending.filter(a => bucketOf(a) === 'manana').sort((a, b) => toMins(a.startTime) - toMins(b.startTime)) },
    { key: 'semana',   label: 'Esta semana',  items: pending.filter(a => bucketOf(a) === 'semana').sort((a, b) => a.date.getTime() - b.date.getTime() || toMins(a.startTime) - toMins(b.startTime)) },
    { key: 'despues',  label: 'Después',      items: pending.filter(a => bucketOf(a) === 'despues').sort((a, b) => a.date.getTime() - b.date.getTime() || toMins(a.startTime) - toMins(b.startTime)) },
  ].filter(b => b.items.length > 0);

  const total = pending.length;

  const handlePhone = (phone: string) => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      window.location.href = `tel:${phone}`;
    } else {
      if (navigator.clipboard) navigator.clipboard.writeText(phone);
      showToast?.(`${phone} · copiado al portapapeles`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
        className="relative flex flex-col w-full rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxWidth: '560px', maxHeight: '85vh', background: '#ffffff', border: `1px solid ${T.border}` }}
      >
        {/* Mobile handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
        </div>
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <h3 style={{ fontFamily: DM_SERIF, fontSize: '22px', fontWeight: 400, color: T.dark, margin: 0, letterSpacing: '-0.005em', lineHeight: 1.15 }}>Pendientes por resolver</h3>
            <p style={{ fontSize: '13px', color: T.text3, marginTop: '4px' }}>
              {total === 0
                ? 'No hay turnos esperando confirmación'
                : `${total} ${total === 1 ? 'turno espera' : 'turnos esperan'} tu confirmación`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 shrink-0" aria-label="Cerrar">
            <X size={16} style={{ color: T.text2 }} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: '40px 12px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Sparkle size={24} weight="fill" style={{ color: '#10B981' }} />
              </div>
              <h4 style={{ fontFamily: DM_SERIF, fontSize: '20px', fontWeight: 400, color: T.dark, margin: 0, letterSpacing: '-0.005em' }}>Todo al día</h4>
              <p style={{ fontSize: '13px', color: T.text3, marginTop: '6px', maxWidth: '260px', lineHeight: 1.5 }}>
                No hay turnos que necesiten tu confirmación. Bien hecho.
              </p>
            </div>
          ) : (
            <div>
              {buckets.map((bucket, bi) => (
                <div key={bucket.key} style={{ marginBottom: bi < buckets.length - 1 ? '20px' : 0 }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px' }}>{bucket.label}</p>
                  <div className="space-y-2">
                    {bucket.items.map(app => {
                      const svc = services.find(s => s.id === app.serviceId);
                      const prov = providerMap[app.providerId];
                      const showDate = bucket.key === 'semana' || bucket.key === 'despues';
                      return (
                        <div
                          key={app.id}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,148,77,0.35)',
                            background: 'rgba(255,148,77,0.03)',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div style={{ minWidth: '64px', flexShrink: 0 }}>
                              {showDate && (
                                <p style={{ fontSize: '11px', color: T.text3, marginBottom: '2px' }}>
                                  {format(app.date, "EEE d MMM", { locale: es }).replace(/^./, c => c.toUpperCase())}
                                </p>
                              )}
                              <p style={{ fontFamily: GEIST_MONO, fontSize: '14px', fontWeight: 500, color: T.dark }}>{app.startTime}</p>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: T.dark, lineHeight: 1.2 }}>{app.clientName}</p>
                              <p style={{ fontSize: '12px', color: T.text2, marginTop: '2px' }}>
                                {svc?.name ?? '—'}
                                <span style={{ color: T.text3 }}> · {svc?.duration ?? 0} min</span>
                                {prov && <><span style={{ color: T.text3 }}> · con </span><span>{prov.name}</span></>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3" style={{ paddingLeft: '76px' }}>
                            <button
                              onClick={() => { onUpdateStatus(app.id, 'confirmed'); showToast?.('Turno confirmado'); }}
                              className="flex items-center gap-1 transition-colors hover:opacity-90"
                              style={{ padding: '6px 12px', borderRadius: '8px', background: T.orange, color: '#fff', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                            >
                              <Check size={12} weight="bold" /><span>Confirmar</span>
                            </button>
                            <button
                              onClick={() => { onUpdateStatus(app.id, 'cancelled'); showToast?.('Turno cancelado'); }}
                              className="transition-colors hover:bg-black/[0.04]"
                              style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', color: T.text2, fontSize: '12px', fontWeight: 400, border: `1px solid ${T.border}`, cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                            {app.clientPhone && (
                              <button
                                onClick={() => handlePhone(app.clientPhone)}
                                className="flex items-center gap-1 ml-auto transition-colors hover:bg-black/[0.04]"
                                style={{ padding: '6px 10px', borderRadius: '8px', background: 'transparent', color: T.text2, fontSize: '12px', fontWeight: 400, border: 'none', cursor: 'pointer' }}
                                title={app.clientPhone}
                              >
                                <Phone size={12} /><span className="hidden sm:inline">Llamar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── MODALS ────────────────────────────────────────────────────────────────────
const ShareModal = ({
  onClose
}: {
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const link = 'https://turnobot.app/p/peluqueria-el-barrio';
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return <ModalOverlay onClose={onClose}>
    <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
        color: T.text
      }}>Compartir enlace</h3><button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
    <p className="text-sm font-normal mb-4" style={{
      color: T.text2
    }}>Compartí este link con tus clientes para que reserven turnos online.</p>
    <div className="flex items-center gap-2">
      <div className="flex-1 px-3 py-2.5 rounded-xl text-xs font-mono truncate" style={{
        background: T.bg2,
        color: T.text2,
        border: `1px solid ${T.border}`
      }}>{link}</div>
      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-normal shrink-0 transition-all" style={{
        background: copied ? '#43A047' : T.dark,
        color: '#fff'
      }}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? 'Copiado!' : 'Copiar'}</span></button>
    </div>
  </ModalOverlay>;
};
const AccountModal = ({
  profile,
  onSave,
  onClose
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState(profile);
  return <ModalOverlay onClose={onClose} maxW="480px">
    <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
        color: T.text
      }}>Mi cuenta</h3><button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lbl}>Nombre</label><input type="text" value={form.name} placeholder="Nombre" onChange={e => setForm(f => ({
            ...f,
            name: e.target.value
          }))} className={inp} style={inpStyle} /></div>
        <div><label className={lbl}>Apellido</label><input type="text" value={form.lastName} placeholder="Apellido" onChange={e => setForm(f => ({
            ...f,
            lastName: e.target.value
          }))} className={inp} style={inpStyle} /></div>
      </div>
      <div><label className={lbl}>Email</label><input type="text" value={form.email} placeholder="nombre@email.com" onChange={e => setForm(f => ({
          ...f,
          email: e.target.value
        }))} className={inp} style={inpStyle} /></div>
      <div><label className={lbl}>Teléfono</label><input type="text" value={form.phone} placeholder="Ej: 1122334455" onChange={e => setForm(f => ({
          ...f,
          phone: e.target.value
        }))} className={inp} style={inpStyle} /></div>
    </div>
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-normal" style={{
        border: `1px solid ${T.border}`
      }}>Cancelar</button>
      <button onClick={() => {
        onSave(form);
        onClose();
      }} className="flex-1 py-3 rounded-xl text-sm font-normal text-white flex items-center justify-center gap-2" style={{
        background: T.dark
      }}><FloppyDisk className="w-4 h-4" /><span>Guardar</span></button>
    </div>
  </ModalOverlay>;
};
const SubscriptionModal = ({
  onClose
}: {
  onClose: () => void;
}) => <ModalOverlay onClose={onClose}>
  <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
      color: T.text
    }}>Suscripción</h3><button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
  <div className="rounded-xl p-4 mb-4" style={{
    background: T.orangeLight,
    border: `1px solid ${T.borderO}`
  }}>
    <p className="text-sm font-normal" style={{
      color: T.dark
    }}>Plan Básico</p>
    <p className="text-xs font-normal mt-1" style={{
      color: T.text2
    }}>Hasta 3 profesionales · Bot ilimitado · 500 turnos/mes</p>
  </div>
  <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-normal text-white" style={{
    background: T.dark
  }}><Gear size={16} /><span>Actualizar plan</span></button>
</ModalOverlay>;
const SupportModal = ({
  onClose
}: {
  onClose: () => void;
}) => <ModalOverlay onClose={onClose}>
  <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
      color: T.text
    }}>Soporte</h3><button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
  <div className="space-y-3">
    {[{
      icon: Envelope,
      label: 'Enviar email',
      sub: 'soporte@turnobot.app'
    }, {
      icon: ChatCircleDots,
      label: 'Chat en vivo',
      sub: 'Respuesta en minutos'
    }, {
      icon: Question,
      label: 'Centro de ayuda',
      sub: 'Guías y tutoriales'
    }].map(item => <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl" style={{
      background: T.bg2,
      border: `1px solid ${T.border}`
    }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
        background: T.orangeLight
      }}><item.icon className="w-4 h-4" style={{
          color: T.orange
        }} /></div>
      <div><p className="text-sm font-normal" style={{
          color: T.text
        }}>{item.label}</p><p className="text-xs font-normal mt-0.5" style={{
          color: T.text3
        }}>{item.sub}</p></div>
    </div>)}
  </div>
</ModalOverlay>;
const NewClientModal = ({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (c: Client) => void;
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    notes: ''
  });
  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      id: Math.random().toString(36).slice(2),
      name: form.name.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      tags: [],
      birthday: ''
    });
    onClose();
  };
  return <ModalOverlay onClose={onClose}>
    <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
        color: T.text
      }}>Nuevo cliente</h3><button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
    <div className="space-y-3">
      <div><label className={lbl}>Nombre</label><input value={form.name} onChange={e => setForm(f => ({
          ...f,
          name: e.target.value
        }))} className={inp} style={inpStyle} placeholder="Nombre completo" /></div>
      <div><label className={lbl}>Teléfono</label><input value={form.phone} onChange={e => setForm(f => ({
          ...f,
          phone: e.target.value
        }))} className={inp} style={inpStyle} placeholder="Ej: 1122334455" /></div>
      <div><label className={lbl}>Notas</label><textarea value={form.notes} onChange={e => setForm(f => ({
          ...f,
          notes: e.target.value
        }))} rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-[#4472C4]/30" style={inpStyle} placeholder="Preferencias, alergias..." /></div>
    </div>
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-normal" style={{
        border: `1px solid ${T.border}`
      }}>Cancelar</button>
      <button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 py-3 rounded-xl text-sm font-normal text-white flex items-center justify-center gap-2" style={{
        background: T.dark
      }}><UserPlus className="w-4 h-4" /><span>Crear cliente</span></button>
    </div>
  </ModalOverlay>;
};

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export const SalonAdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'José',
    lastName: 'Pérez',
    email: 'jose@peluqueriaelbarrio.com',
    phone: '',
    age: '',
    sex: ''
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [botSettingsOpen, setBotSettingsOpen] = useState(false);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const agentAnchorRef = useRef<HTMLDivElement>(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  // Bot status: 'active' | 'pending' | 'paused' — derived from real state in the future
  const botStatus: 'active' | 'pending' | 'paused' = 'active';
  const botStatusColor = botStatus === 'active' ? '#10B981' : botStatus === 'pending' ? '#F59E0B' : '#EF4444';
  const botStatusLabel = botStatus === 'active' ? 'Activo' : botStatus === 'pending' ? 'Pendientes' : 'Pausado';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchorRef = useRef<HTMLButtonElement>(null);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(INITIAL_BLOCKED_SLOTS);
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [messages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppModal, setNewAppModal] = useState(false);
  const [blockingSlot, setBlockingSlot] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState<NewAppFormState>({
    clientName: '',
    clientPhone: '',
    serviceId: services[0]?.id ?? '',
    providerId: 'general',
    date: format(startOfToday(), 'yyyy-MM-dd'),
    time: '09:00'
  });
  const [blockForm, setBlockForm] = useState({
    date: format(startOfToday(), 'yyyy-MM-dd'),
    start: '12:00',
    end: '13:00',
    reason: ''
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: ''
  });
  const greeting = useMemo(() => getDynamicGreeting(), []);
  const providerMap = useMemo(() => {
    const m: Record<string, Provider> = {};
    providers.forEach(p => {
      m[p.id] = p;
    });
    return m;
  }, [providers]);
  const clientMap = useMemo(() => {
    const m: Record<string, Client> = {};
    clients.forEach(c => {
      m[c.id] = c;
    });
    return m;
  }, [clients]);
  const todayApps = useMemo(() => appointments.filter(a => isSameDay(a.date, startOfToday())), [appointments]);
  const updateStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? {
      ...a,
      status
    } : a));
    setSelectedAppointment(prev => prev?.id === id ? {
      ...prev,
      status
    } : prev);
  }, []);
  const openReschedule = () => {
    if (!selectedAppointment) return;
    setRescheduleForm({
      date: format(selectedAppointment.date, 'yyyy-MM-dd'),
      time: selectedAppointment.startTime
    });
    setRescheduling(true);
  };
  const handleReschedule = () => {
    if (!selectedAppointment) return;
    const newDate = new Date(rescheduleForm.date + 'T00:00:00');
    setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? {
      ...a,
      date: newDate,
      startTime: rescheduleForm.time,
      status: 'confirmed'
    } : a));
    setSelectedAppointment(prev => prev ? {
      ...prev,
      date: newDate,
      startTime: rescheduleForm.time,
      status: 'confirmed'
    } : prev);
    setRescheduling(false);
  };
  const openNewApp = useCallback((date?: Date, time?: string) => {
    setNewAppForm({
      clientName: '',
      clientPhone: '',
      serviceId: services[0]?.id ?? '',
      providerId: 'general',
      date: format(date ?? startOfToday(), 'yyyy-MM-dd'),
      time: time ?? '09:00'
    });
    setNewAppModal(true);
  }, [services]);
  const createAppointment = () => {
    const existing = clients.find(c => c.phone === newAppForm.clientPhone || c.name === newAppForm.clientName);
    let clientId = existing?.id ?? '';
    if (!existing && newAppForm.clientName.trim()) {
      clientId = Math.random().toString(36).slice(2);
      setClients(prev => [...prev, {
        id: clientId,
        name: newAppForm.clientName.trim(),
        phone: newAppForm.clientPhone.trim(),
        notes: '',
        tags: [],
        birthday: ''
      }]);
    }
    const resolvedProviderId = newAppForm.providerId === 'general' ? providers[0]?.id ?? '' : newAppForm.providerId;
    const app: Appointment = {
      id: Math.random().toString(36).slice(2),
      clientId,
      clientName: newAppForm.clientName.trim() || existing?.name || 'Sin nombre',
      clientPhone: newAppForm.clientPhone.trim(),
      serviceId: newAppForm.serviceId,
      providerId: resolvedProviderId,
      date: new Date(newAppForm.date + 'T00:00:00'),
      startTime: newAppForm.time,
      status: 'pending'
    };
    setAppointments(prev => [...prev, app]);
    setNewAppModal(false);
  };
  const addBlockedSlot = () => {
    setBlockedSlots(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      date: new Date(blockForm.date + 'T00:00:00'),
      start: blockForm.start,
      end: blockForm.end,
      reason: blockForm.reason
    }]);
    setBlockingSlot(false);
    setBlockForm({
      date: format(startOfToday(), 'yyyy-MM-dd'),
      start: '12:00',
      end: '13:00',
      reason: ''
    });
  };
  const addService = () => {
    const svc: Service = {
      id: Math.random().toString(36).slice(2),
      name: 'Nuevo Servicio',
      duration: 30,
      price: 0,
      color: '#6B7280',
      availability: {}
    };
    setServices(prev => [...prev, svc]);
    setEditingService(svc);
  };
  const saveService = (svc: Service) => {
    setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
    setEditingService(null);
  };
  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    if (editingService?.id === id) setEditingService(null);
  };
  const addTimeRange = (dayIdx: number) => {
    if (!editingService) return;
    const nr: TimeRange = {
      id: Math.random().toString(36).slice(2),
      start: '09:00',
      end: '18:00'
    };
    setEditingService({
      ...editingService,
      availability: {
        ...editingService.availability,
        [dayIdx]: [...(editingService.availability[dayIdx] || []), nr]
      }
    });
  };
  const removeTimeRange = (dayIdx: number, rid: string) => {
    if (!editingService) return;
    const upd = (editingService.availability[dayIdx] || []).filter(r => r.id !== rid);
    const av = {
      ...editingService.availability
    };
    if (upd.length === 0) delete av[dayIdx];else av[dayIdx] = upd;
    setEditingService({
      ...editingService,
      availability: av
    });
  };
  const updateTimeRange = (dayIdx: number, rid: string, field: 'start' | 'end', val: string) => {
    if (!editingService) return;
    const upd = (editingService.availability[dayIdx] || []).map(r => r.id === rid ? {
      ...r,
      [field]: val
    } : r);
    setEditingService({
      ...editingService,
      availability: {
        ...editingService.availability,
        [dayIdx]: upd
      }
    });
  };
  const handleLogin = (googleUser?: boolean) => {
    if (googleUser) setProfile(p => ({
      ...p,
      name: 'José',
      lastName: 'Pérez',
      email: 'jose@peluqueriaelbarrio.com'
    }));
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserMenuOpen(false);
  };
  const handleOpenClient = useCallback((clientId: string) => {
    setSelectedAppointment(null);
    setPendingClientId(clientId);
    setActiveTab('clients');
  }, []);
  const getTabTitle = (tab: NavTab) => {
    if (tab === 'home') return null;
    return NAV_ITEMS.find(n => n.id === tab)?.label ?? '';
  };
  if (!isLoggedIn) return <LoginScreen onLogin={() => handleLogin(true)} />;
  return <ToastProvider>
    <div className="flex h-screen overflow-hidden" style={{
      fontFamily: DM_SANS,
      fontWeight: 400
    }}>
      <GlowBackground />
      <aside className="hidden md:flex flex-col" style={{
        position: 'absolute',
        left: 0,
        top: '60px',
        bottom: 0,
        width: sidebarExpanded ? '224px' : '68px',
        background: 'rgba(240,245,248,0.88)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        borderRight: '1px solid rgba(27,45,59,0.08)',
        boxShadow: sidebarExpanded ? '4px 0 32px rgba(27,45,59,0.10)' : 'none',
        transition: 'width 0.24s cubic-bezier(0.25,1,0.5,1), box-shadow 0.24s',
        zIndex: 15,
        // overflow visible so tooltips can escape; nav items themselves clip text via overflow:hidden where needed
      }}>
        <nav className="flex-1 py-4 px-2.5 space-y-0.5">
          {NAV_ITEMS.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn('group relative w-full flex items-center overflow-visible transition-all duration-150', sidebarExpanded ? 'justify-start' : 'justify-center')} style={{
            height: '42px',
            paddingLeft: sidebarExpanded ? '14px' : '0',
            paddingRight: sidebarExpanded ? '14px' : '0',
            borderRadius: '12px',
            background: activeTab === item.id ? 'rgba(68,114,196,0.10)' : 'transparent',
            color: activeTab === item.id ? T.text : '#9f9b93',
            fontWeight: 400
          }}>
            <item.icon style={{
              width: '18px',
              height: '18px',
              flexShrink: 0
            }} />
            {/* Hover tooltip when sidebar is collapsed */}
            {!sidebarExpanded && (
              <span className="hidden md:block absolute left-full ml-3 px-2.5 py-1.5 text-[12px] font-normal whitespace-nowrap rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: T.dark, color: '#fff', boxShadow: '0 4px 12px rgba(27,45,59,0.18)', zIndex: 30 }}>
                {item.label}
              </span>
            )}
            <AnimatePresence>{sidebarExpanded && <motion.span initial={{
                opacity: 0,
                x: -8
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -8
              }} transition={{
                duration: 0.15
              }} className="ml-3 text-sm whitespace-nowrap" style={{
                color: activeTab === item.id ? '#1A1A1A' : '#9f9b93'
              }}>{item.label}</motion.span>}</AnimatePresence>
          </button>)}
        </nav>
        <div className="shrink-0 overflow-hidden" style={{
          padding: '12px 10px'
        }}>
          <button ref={userMenuAnchorRef} onClick={() => setUserMenuOpen(v => !v)} className={cn('w-full flex items-center overflow-hidden transition-colors rounded-xl', sidebarExpanded ? 'justify-start' : 'justify-center')} style={{
            padding: '6px',
            background: userMenuOpen ? 'rgba(0,0,0,0.05)' : 'transparent'
          }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-normal text-xs shrink-0 text-white" style={{
              background: SAGE
            }}>{profile.name[0] ?? 'J'}</div>
            <AnimatePresence>{sidebarExpanded && <motion.div initial={{
                opacity: 0,
                x: -8
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -8
              }} transition={{
                duration: 0.15
              }} className="ml-2.5 overflow-hidden flex-1 text-left"><p className="text-xs font-normal truncate leading-tight" style={{
                  color: T.text
                }}>{profile.name} {profile.lastName}</p><p className="text-[12px] leading-tight" style={{
                  color: T.text3
                }}>Plan Básico</p></motion.div>}</AnimatePresence>
          </button>
        </div>
      </aside>
      <AnimatePresence>{userMenuOpen && <UserMenu profile={profile} onClose={() => setUserMenuOpen(false)} onLogout={handleLogout} onOpenAccount={() => setAccountOpen(true)} onOpenSubscription={() => setSubscriptionOpen(true)} onOpenSupport={() => setSupportOpen(true)} anchorRef={userMenuAnchorRef} />}</AnimatePresence>
      {/* ── Fixed topbar ── */}
      <div className="pr-4 md:pr-5 flex items-center justify-between gap-3" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '60px', zIndex: 20,
        background: 'rgba(240,245,248,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(27,45,59,0.08)',
        paddingLeft: '13px',
      }}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarExpanded(v => !v)}
            className="hidden md:flex transition-colors hover:opacity-80 items-center justify-center"
            style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              background: sidebarExpanded ? 'rgba(68,114,196,0.10)' : 'transparent',
              border: 'none',
              flexShrink: 0,
            }}
            aria-label={sidebarExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
          >
            <SidebarSimple size={18} style={{ color: sidebarExpanded ? T.dark : T.text2 }} weight={sidebarExpanded ? 'fill' : 'regular'} />
          </button>
          {/* Perla wordmark — dot integrates bot status with rich tooltip on hover */}
          <div ref={agentAnchorRef} style={{ position: 'relative' }}>
            <PerlaWordmark
              size="md"
              color={T.dark}
              dotColor={agentStatus.state === 'active' ? T.orange : '#F57C00'}
              pulse={agentStatus.state === 'active'}
              onWordmarkClick={() => setAgentPanelOpen((v) => !v)}
              dotTitle={agentStatus.state === 'active' ? 'Agente activo' : 'Agente pausado'}
              dotTooltip={(() => {
                const responded = messages.length;
                const waiting = messages.filter(m => m.unread).length;
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: botStatusColor, display: 'inline-block' }} />
                      <strong style={{ fontWeight: 500 }}>Tu agente · {botStatusLabel}</strong>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '11.5px' }}>
                      Respondió {responded} {responded === 1 ? 'charla' : 'charlas'} hoy
                      {waiting > 0 ? ` · ${waiting} ${waiting === 1 ? 'espera respuesta' : 'esperan respuesta'}` : ' · nadie esperando'}
                    </div>
                  </>
                );
              })()}
              className="shrink-0"
            />
            <PerlaStatusPanel
              open={agentPanelOpen}
              onClose={() => setAgentPanelOpen(false)}
              anchorRef={agentAnchorRef}
              onOpenBotSettings={() => setBotSettingsOpen(true)}
              status={agentStatus}
              stats={agentDailyStats}
              activity={agentActivity}
            />
          </div>
          {/* Divider */}
          <div className="hidden md:block" style={{ width: '1px', height: '22px', background: 'rgba(27,45,59,0.14)', flexShrink: 0 }} />
          {/* Business name with chevron (future multi-tenant switch) */}
          <button className="hidden md:flex items-center gap-1.5 min-w-0 rounded-lg px-2 py-1 transition-colors hover:bg-black/[0.04]" style={{ flexShrink: 1 }}>
            <span className="text-[14px] leading-tight truncate" style={{ color: T.text, fontWeight: 500, fontFamily: DM_SANS }}>Barbería Norte</span>
            <CaretDown size={12} style={{ color: T.text3, flexShrink: 0 }} />
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => openNewApp()} className="flex items-center justify-center gap-1.5 text-xs font-medium rounded-xl transition-all hover:opacity-90 active:scale-95" style={{
              background: T.orange,
              color: '#fff',
              height: '36px',
              padding: '0 14px',
            }}><Plus size={14} weight="bold" /><span className="hidden sm:inline">Nuevo turno</span></button>
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(v => !v)} className="rounded-xl transition-colors hover:opacity-80 flex items-center justify-center" style={{
                background: T.bg2,
                border: `1px solid ${T.border}`,
                width: '36px', height: '36px',
              }}><Bell size={16} style={{
                  color: T.text2
                }} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{
                  background: T.orange
                }} /></button>
              <AnimatePresence>{notifOpen && <motion.div initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97
                }} animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97
                }} transition={{
                  duration: 0.15
                }} className="hidden md:block" style={{
                  position: 'fixed',
                  top: '72px',
                  right: '16px',
                  width: '340px',
                  background: 'rgba(250,248,244,0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  boxShadow: T.shadowLg,
                  border: `1px solid ${T.border}`,
                  zIndex: 60
                }}>
                <div className="flex items-center justify-between px-4 py-3" style={{
                    borderBottom: `1px solid ${T.border}`
                  }}><h4 className="text-sm font-normal" style={{
                      color: T.text
                    }}>Notificaciones</h4><button onClick={() => setNotifOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5"><X className="w-3.5 h-3.5" style={{
                        color: T.text2
                      }} /></button></div>
                <div className="overflow-y-auto" style={{
                    maxHeight: '380px'
                  }}>{NOTIFS.map(n => <NotifItem key={n.id} n={n} />)}</div>
                <div className="px-4 py-2.5"><button className="text-xs w-full text-center font-normal" style={{
                      color: T.orange
                    }}>Ver todas</button></div>
              </motion.div>}</AnimatePresence>
              {notifOpen && <div className="fixed inset-0 z-50 hidden md:block" onClick={() => setNotifOpen(false)} />}
            </div>
          </div>
        </div>
      {/* ── Main content ── */}
      <main className="flex flex-col min-w-0 overflow-hidden absolute top-[60px] right-0 bottom-0 left-0 md:left-[68px] z-[1]">
        <div className="flex-1 overflow-hidden pb-[calc(58px+env(safe-area-inset-bottom))] md:pb-0 flex flex-col">
          {activeTab === 'home' && <div className="flex-1 overflow-hidden h-full flex flex-col">
              <InicioScreen todayApps={todayApps} appointments={appointments} services={services} providerMap={providerMap} clients={clients} messages={messages} onAppointmentClick={app => setSelectedAppointment(app)} onAddAppointment={openNewApp} onUpdateStatus={updateStatus} onOpenPending={() => setPendingModalOpen(true)} greeting={greeting} profileName={profile.name} onNavigateAgenda={() => setActiveTab('agenda')} onNavigateMessages={() => setActiveTab('messages')} />
            </div>}
            {activeTab === 'agenda' && <div className="flex-1 flex flex-col overflow-hidden h-full">
              <AgendaScreen filteredApps={appointments} services={services} providers={providers} providerMap={providerMap} blockedSlots={blockedSlots} onAppointmentClick={app => setSelectedAppointment(app)} onAddAppointment={openNewApp} onBlockSlot={() => setBlockingSlot(true)} />
            </div>}
            {activeTab === 'clients' && <div className="flex-1 flex flex-col overflow-hidden h-full">
              <ClientsScreen clients={clients} appointments={appointments} services={services} messages={messages} onNewClient={() => setNewClientOpen(true)} onNavigateMessages={() => setActiveTab('messages')} initialClientId={pendingClientId} onClientOpened={() => setPendingClientId(null)} />
            </div>}
            {activeTab === 'messages' && <div className="flex-1 flex flex-col overflow-hidden h-full">
              <MessagesScreen messages={messages} clients={clients} />
            </div>}
            {activeTab === 'config' && <div className="flex-1 overflow-hidden h-full min-h-0">
              <ConfigScreen services={services} providers={providers} setProviders={setProviders} onAddService={addService} onEditService={svc => setEditingService(svc)} />
            </div>}
        </div>
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20" style={{
        background: 'rgba(250,248,244,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        height: 'calc(58px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <div className="flex h-full">
          {NAV_ITEMS.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors hover:bg-black/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4472C4]/40 focus-visible:ring-inset" style={{
            color: activeTab === item.id ? T.dark : T.text3
          }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{
              background: activeTab === item.id ? 'rgba(68,114,196,0.10)' : 'transparent'
            }}><item.icon style={{
                width: '18px',
                height: '18px'
              }} /></div>
            <span className="text-[12px]" style={{
              fontWeight: 400
            }}>{item.label}</span>
          </button>)}
        </div>
      </nav>
      <AnimatePresence>
        {selectedAppointment && <DrawerOverlay key="appt-drawer" onClose={() => setSelectedAppointment(null)}>
          <AppointmentDetail appointment={selectedAppointment} services={services} providerMap={providerMap} clientMap={clientMap} onClose={() => setSelectedAppointment(null)} onReschedule={openReschedule} onUpdateStatus={updateStatus} onOpenClient={handleOpenClient} />
        </DrawerOverlay>}
      </AnimatePresence>
      <AnimatePresence>
        {editingService && <DrawerOverlay key="svc-drawer" onClose={() => setEditingService(null)} wide>
          <ServiceEdit service={editingService} onChange={setEditingService} onSave={saveService} onDelete={deleteService} addTimeRange={addTimeRange} removeTimeRange={removeTimeRange} updateTimeRange={updateTimeRange} onClose={() => setEditingService(null)} />
        </DrawerOverlay>}
      </AnimatePresence>
      <AnimatePresence>
        {rescheduling && selectedAppointment && <ModalOverlay key="reschedule" onClose={() => setRescheduling(false)}>
          <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
              color: T.text
            }}>Reprogramar turno</h3><button onClick={() => setRescheduling(false)} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
          <div className="rounded-xl p-3 mb-5" style={{
            background: T.bg2
          }}><p className="font-normal text-sm" style={{
              color: T.text
            }}>{selectedAppointment.clientName}</p><p className="text-xs mt-0.5 font-normal" style={{
              color: T.text3
            }}>{format(selectedAppointment.date, 'd MMM yyyy', {
                locale: es
              })} · {selectedAppointment.startTime}</p></div>
          <div className="space-y-3">
            <div><label className={lbl}>Nueva fecha</label><input type="date" value={rescheduleForm.date} onChange={e => setRescheduleForm(f => ({
                ...f,
                date: e.target.value
              }))} className={inp} style={inpStyle} /></div>
            <div><label className={lbl}>Hora</label><input type="time" value={rescheduleForm.time} onChange={e => setRescheduleForm(f => ({
                ...f,
                time: e.target.value
              }))} className={inp} style={inpStyle} /></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setRescheduling(false)} className="flex-1 py-3 rounded-xl text-sm font-normal" style={{
              border: `1px solid ${T.border}`
            }}>Cancelar</button>
            <button onClick={handleReschedule} className="flex-1 py-3 rounded-xl text-sm font-normal text-white flex items-center justify-center gap-2" style={{
              background: T.dark
            }}><CalendarCheck className="w-4 h-4" /><span>Confirmar</span></button>
          </div>
        </ModalOverlay>}
      </AnimatePresence>
      <AnimatePresence>
        {newAppModal && <ModalOverlay onClose={() => setNewAppModal(false)} maxW="480px">
          <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
              color: T.text
            }}>Nuevo turno</h3><button onClick={() => setNewAppModal(false)} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
          <NewAppointmentForm clients={clients} services={services} providers={providers} newAppForm={newAppForm} setNewAppForm={setNewAppForm} onClose={() => setNewAppModal(false)} onSubmit={createAppointment} />
        </ModalOverlay>}
      </AnimatePresence>
      <AnimatePresence>
        {blockingSlot && <ModalOverlay key="block-slot" onClose={() => setBlockingSlot(false)}>
          <div className="flex items-center justify-between mb-5"><h3 className="text-base font-normal" style={{
              color: T.text
            }}>Bloquear horario</h3><button onClick={() => setBlockingSlot(false)} className="p-2 rounded-xl hover:bg-black/5"><X className="w-4 h-4" /></button></div>
          <div className="space-y-3">
            <div><label className={lbl}>Fecha</label><input type="date" value={blockForm.date} onChange={e => setBlockForm(f => ({
                ...f,
                date: e.target.value
              }))} className={inp} style={inpStyle} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Desde</label><input type="time" value={blockForm.start} onChange={e => setBlockForm(f => ({
                  ...f,
                  start: e.target.value
                }))} className={inp} style={inpStyle} /></div>
              <div><label className={lbl}>Hasta</label><input type="time" value={blockForm.end} onChange={e => setBlockForm(f => ({
                  ...f,
                  end: e.target.value
                }))} className={inp} style={inpStyle} /></div>
            </div>
            <div><label className={lbl}>Motivo (opcional)</label><input type="text" placeholder="ej: Almuerzo, Día libre..." value={blockForm.reason} onChange={e => setBlockForm(f => ({
                ...f,
                reason: e.target.value
              }))} className={inp} style={inpStyle} /></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setBlockingSlot(false)} className="flex-1 py-3 rounded-xl text-sm font-normal" style={{
              border: `1px solid ${T.border}`
            }}>Cancelar</button>
            <button onClick={addBlockedSlot} className="flex-1 py-3 rounded-xl text-sm font-normal text-white flex items-center justify-center gap-2" style={{
              background: T.dark
            }}><Lock className="w-4 h-4" /><span>Bloquear</span></button>
          </div>
        </ModalOverlay>}
      </AnimatePresence>
      <AnimatePresence>{shareOpen && <ShareModal key="share" onClose={() => setShareOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{accountOpen && <AccountModal key="account" profile={profile} onSave={setProfile} onClose={() => setAccountOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{subscriptionOpen && <SubscriptionModal key="sub" onClose={() => setSubscriptionOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{supportOpen && <SupportModal key="support" onClose={() => setSupportOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{newClientOpen && <NewClientModal key="new-client" onClose={() => setNewClientOpen(false)} onSave={c => setClients(prev => [...prev, c])} />}</AnimatePresence>
      <BotSettingsModal open={botSettingsOpen} onClose={() => setBotSettingsOpen(false)} />
      <AnimatePresence>
        {pendingModalOpen && (
          <PendingModal
            key="pending-modal"
            open={pendingModalOpen}
            onClose={() => setPendingModalOpen(false)}
            appointments={appointments}
            services={services}
            providerMap={providerMap}
            onUpdateStatus={updateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  </ToastProvider>;
};
export default SalonAdminDashboard;