import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Home, Users, Settings, Bell, Plus, ChevronDown, ChevronLeft, ChevronRight, X, Scissors, Clock, Lock, Eye, CheckCircle2, XCircle, AlertCircle, CalendarClock, Phone, MessageCircle, Brush, Wind, Sparkles, Wand2, Smile, Droplets, Save, Trash2, LogOut, Share2, Copy, Check, Search, UserPlus, CreditCard, HelpCircle, Mail, MessageSquare, Filter, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfToday, isSameDay, startOfWeek, addWeeks, subWeeks, getHours, addDays, subDays, startOfMonth, endOfMonth, isToday, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Service, Appointment, Client, BlockedSlot, TimeRange, AppointmentStatus, Provider, NavTab, Message, UserProfile } from './types';
import { INITIAL_SERVICES, INITIAL_APPOINTMENTS, INITIAL_CLIENTS, INITIAL_BLOCKED_SLOTS, DAYS_ORDER, DAY_NAMES, INITIAL_PROVIDERS, INITIAL_MESSAGES, T } from './mockData';
import { LoginScreen } from './LoginScreen';
import { GlassCard, StatusPill, ProviderAvatar, Toggle } from '@/components/dashboard';
const inp = 'w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#5B8FA6]/30 focus:border-[#5B8FA6]/40 transition-colors';
const inpStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(61,90,78,0.08)',
  color: '#2a3d35'
};
const lbl = 'text-[12px] font-normal uppercase tracking-wider text-[#6b7d74] mb-1 block';
const OPENING_HOURS = "'Opening Hours Sans', ui-sans-serif, system-ui, sans-serif";
const DM_SANS = OPENING_HOURS;
const BRICOLAGE = OPENING_HOURS;
const GEIST_MONO = "'Geist', ui-monospace, monospace";
const INSTRUMENT_SERIF = "'Fraunces', ui-serif, Georgia, serif";
const CHIP_BASE: React.CSSProperties = { display: 'inline-flex', alignItems: 'baseline', gap: '2px', padding: '1px 7px 2px', borderRadius: '5px', fontWeight: 700, lineHeight: 1, verticalAlign: 'middle', border: '1px solid transparent', whiteSpace: 'nowrap', fontFamily: GEIST_MONO };
const CHIP_BLUE: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(59,130,246,0.07)', borderColor: 'rgba(59,130,246,0.16)', color: '#2563EB' };
const CHIP_GREEN: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.18)', color: '#059669' };
const CHIP_TEAL: React.CSSProperties = { ...CHIP_BASE, background: 'rgba(91,143,166,0.09)', borderColor: 'rgba(91,143,166,0.22)', color: '#4A7A94' };
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
  maxWidth: '1080px',
  margin: '0 auto',
  width: '100%',
  padding: '0 32px',
  boxSizing: 'border-box'
};
const SAGE = '#5B8FA6';
const SAGE_GRAD = 'linear-gradient(135deg, #5B8FA6, #99C3D6)';
const CONTENT_GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.60)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow: '0 4px 24px rgba(27,45,59,0.07)',
};
const CARD_GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.74)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow: '0 2px 4px rgba(27,45,59,0.07), 0 8px 32px rgba(27,45,59,0.09), 0 24px 48px rgba(27,45,59,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
  border: '1px solid rgba(255,255,255,0.88)'
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
  icon: Home,
  label: 'Inicio'
}, {
  id: 'agenda',
  icon: Calendar,
  label: 'Agenda'
}, {
  id: 'clients',
  icon: Users,
  label: 'Clientes'
}, {
  id: 'config',
  icon: Settings,
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
  icon: Brush
}, {
  keywords: ['keratina', 'alisado', 'lacio'],
  icon: Wind
}, {
  keywords: ['maquillaje', 'makeup'],
  icon: Sparkles
}, {
  keywords: ['uña', 'manicur', 'pedicur'],
  icon: Wand2
}, {
  keywords: ['facial', 'limpieza', 'hidratación'],
  icon: Droplets
}, {
  keywords: ['cejas', 'pestañas', 'depilación'],
  icon: Smile
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
        }}><CheckCircle2 className="w-3 h-3" /><span>Confirmar turno</span></button>}
        {isNoShowType && <button onClick={() => showToast('Marcado como no-show')} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-normal" style={{
          background: 'rgba(245,124,0,0.12)',
          color: '#E65100'
        }}><AlertCircle className="w-3 h-3" /><span>Marcar no-show</span></button>}
      </div>}
      {expanded && n.priority !== 'urgent' && <p className="text-[12px] mt-1 font-normal" style={{
        color: T.orange
      }}>Marcar como leída</p>}
      <p className="text-[12px] mt-1 font-normal" style={{
        color: T.text3
      }}>{n.time}</p>
    </div>
    <ChevronDown className="w-3.5 h-3.5 shrink-0 mt-1" style={{
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
      <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronLeft className="w-3.5 h-3.5" style={{
          color: T.text2
        }} /></button>
      <span className="text-xs font-normal px-1 capitalize whitespace-nowrap" style={{
        color: T.text2
      }}>{format(weekStart, 'd MMM', {
          locale: es
        })} – {format(addDays(weekStart, 6), 'd MMM yyyy', {
          locale: es
        })}</span>
      <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronRight className="w-3.5 h-3.5" style={{
          color: T.text2
        }} /></button>
    </div>
    <div className="shrink-0 flex" style={{
      background: '#ffffff',
      borderBottom: `1px solid ${T.border}`
    }}>
      <div className="shrink-0" style={{
        width: '44px'
      }} />
      {weekDays.map(day => <div key={day.toISOString()} className="flex-1 py-2 text-center border-l" style={{
        borderColor: T.border,
        background: isToday(day) ? T.orangePale : 'transparent'
      }} onClick={e => handleCellClick(e, day)}>
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
      </div>)}
    </div>
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,143,166,0.3) transparent' }}>
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
        <button onClick={() => setSelectedDate(subDays(startOfMonth(selectedDate), 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronLeft className="w-4 h-4" style={{ color: T.text2 }} /></button>
        <span className="text-sm font-normal px-2 capitalize" style={{ color: T.text }}>{format(selectedDate, 'MMMM yyyy', { locale: es })}</span>
        <button onClick={() => setSelectedDate(addDays(endOfMonth(selectedDate), 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronRight className="w-4 h-4" style={{ color: T.text2 }} /></button>
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
        return <div key={i} onClick={() => onSwitchToDay(day)} className="overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-sm flex flex-col" style={{
          ...CARD_GLASS,
          background: isToday(day) ? T.orangePale : inMonth ? 'rgba(250,248,244,0.55)' : T.bg2,
          border: `1px solid ${isToday(day) ? T.borderO : T.border}`,
          opacity: inMonth ? 1 : 0.45,
          padding: '6px 8px',
        }}>
          <p className="text-xs font-normal mb-1 w-6 h-6 flex items-center justify-center rounded-full shrink-0" style={{
            background: isToday(day) ? T.orange : 'transparent',
            color: isToday(day) ? '#fff' : inMonth ? T.text : T.text3
          }}>{format(day, 'd')}</p>
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
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: '20px', boxShadow: '0 16px 60px rgba(27,45,59,0.18)', padding: '28px', maxWidth: '360px', width: '100%' }}>
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
              <button key={m.id} onClick={() => setMode(m.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${mode === m.id ? SAGE : T.border}`, background: mode === m.id ? 'rgba(91,143,166,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
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
  services: Service[];
  providerMap: Record<string, Provider>;
  clients: Client[];
  messages: Message[];
  onAppointmentClick: (a: Appointment) => void;
  onAddAppointment: (date?: Date, time?: string) => void;
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
  services,
  providerMap,
  clients,
  messages,
  onAppointmentClick,
  onAddAppointment,
  greeting,
  profileName,
  onNavigateAgenda,
  onNavigateMessages,
}: InicioScreenProps) => {
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [botSettingsOpen, setBotSettingsOpen] = useState(false);
  const todayConfirmed = useMemo(() => todayApps.filter(a => a.status === 'confirmed'), [todayApps]);
  const facturacion = useMemo(() => todayConfirmed.reduce((s, a) => s + (services.find(x => x.id === a.serviceId)?.price ?? 0), 0), [todayConfirmed, services]);
  const occupied = useMemo(() => todayApps.filter(a => a.status !== 'cancelled').length, [todayApps]);
  const vacantes = Math.max(0, TOTAL_SLOTS - occupied);
  const kpiValues = {
    turnosHoy: todayApps.length,
    vacantes,
    facturacion
  };
  const now = new Date();
  const nextApp = useMemo(() => {
    const active = todayApps.filter(a => a.status !== 'cancelled' && a.status !== 'no_show');
    const upcoming = active.filter(a => {
      const [h, m] = a.startTime.split(':').map(Number);
      const appTime = new Date(a.date);
      appTime.setHours(h, m, 0, 0);
      return isAfter(appTime, now);
    }).sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
    if (upcoming[0]) return upcoming[0];
    // Fallback: show the last appointment of the day (for demo/end-of-day)
    return active.slice().sort((a, b) => toMins(b.startTime) - toMins(a.startTime))[0] ?? null;
  }, [todayApps, now]);
  const todaySorted = useMemo(() => todayApps.filter(a => a.status !== 'cancelled').slice().sort((a, b) => toMins(a.startTime) - toMins(b.startTime)), [todayApps]);
  const proximoRef = useRef<HTMLDivElement>(null);
  const [agendaHeight, setAgendaHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = proximoRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setAgendaHeight(el.offsetHeight));
    obs.observe(el);
    setAgendaHeight(el.offsetHeight);
    return () => obs.disconnect();
  }, []);
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
  const [hoveredChip, setHoveredChip] = useState<'turnos' | 'confirmados' | 'vacantes' | 'facturacion' | null>(null);
  const chipTooltipData = useMemo(() => {
    const byProv: Record<string, number> = {};
    todayApps.filter(a => a.status !== 'cancelled').forEach(a => {
      const prov = providerMap[a.providerId];
      if (!prov) return;
      const parts = prov.name.split(' ');
      const short = parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '');
      byProv[short] = (byProv[short] ?? 0) + 1;
    });
    const pending = todaySorted.filter(a => a.status !== 'confirmed');
    const bySvc: Record<string, number> = {};
    todayConfirmed.forEach(a => {
      const svc = services.find(s => s.id === a.serviceId);
      if (!svc) return;
      bySvc[svc.name] = (bySvc[svc.name] ?? 0) + svc.price;
    });
    return { byProv, pending, bySvc };
  }, [todayApps, todaySorted, todayConfirmed, services, providerMap]);
  return <div className="overflow-auto h-full" style={{ background: 'transparent' }}>
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1080px] mx-auto w-full box-border">

      {/* ── Greeting ── */}
      <div style={{ marginBottom: '14px' }}>
        <h2 className="leading-tight" style={{ color: T.text, fontFamily: OPENING_HOURS, fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 400, letterSpacing: '0.005em' }}>
          <span>{greeting}, </span>
          <span style={{ fontFamily: INSTRUMENT_SERIF, fontStyle: 'italic', fontWeight: 400 }}>{profileName}</span>
          <span>.</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 400, color: T.text3 }}>{((s: string) => s.charAt(0).toUpperCase() + s.slice(1))(format(now, "EEEE d 'de' MMMM", { locale: es }))}</span>
          <button onClick={() => setBotSettingsOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', background: 'rgba(91,143,166,0.08)', border: '1px solid rgba(91,143,166,0.18)', cursor: 'pointer', transition: 'background 0.15s' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '99px', background: SAGE, display: 'inline-block', boxShadow: '0 0 0 3px rgba(91,143,166,0.18)', animation: 'sagePulse 2s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 400, color: T.text2, letterSpacing: '0.02em' }}>Asistente activo</span>
          </button>
        </div>
      </div>
      <BotSettingsModal open={botSettingsOpen} onClose={() => setBotSettingsOpen(false)} />

      {/* ── Narrative KPIs ── */}
      {(() => {
        const TT_BASE: React.CSSProperties = { position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: T.dark, color: '#fff', borderRadius: '9px', padding: '8px 12px', fontSize: '11px', fontWeight: 400, lineHeight: 1.7, whiteSpace: 'nowrap', zIndex: 100, pointerEvents: 'none', boxShadow: '0 4px 20px rgba(27,45,59,0.25)', fontFamily: OPENING_HOURS };
        const Arrow = () => <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${T.dark}` }} />;
        const W = ({ id, children, tooltip }: { id: typeof hoveredChip; children: React.ReactNode; tooltip: React.ReactNode }) => (
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'baseline' }} onMouseEnter={() => setHoveredChip(id)} onMouseLeave={() => setHoveredChip(null)}>
            {children}
            {hoveredChip === id && <span style={TT_BASE}>{tooltip}<Arrow /></span>}
          </span>
        );
        const { byProv, pending, bySvc } = chipTooltipData;
        const provLine = Object.entries(byProv).map(([n, c]) => `${n}: ${c}`).join('  ·  ') || '—';
        const pendLine = pending.length === 0 ? 'Todos confirmados' : `Sin confirmar: ${pending.map(a => a.clientName.split(' ')[0]).join(', ')}`;
        const slotLine = vacantBlocks.length === 0 ? 'Sin vacantes' : vacantBlocks.slice(0, 5).join(' · ') + (vacantBlocks.length > 5 ? ` +${vacantBlocks.length - 5} más` : '');
        const svcLines = Object.entries(bySvc).map(([n, amt]) => `${n}: $${amt.toLocaleString()}`);
        return (
          <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(27,45,59,0.07)' }}>
            <p style={{ fontSize: '16px', lineHeight: 2.2, color: T.text, fontWeight: 400 }}>
              {'Hoy tenés '}
              <W id="turnos" tooltip={<>{provLine}</>}>
                <span style={CHIP_BLUE}><span style={CHIP_VAL}>{kpiValues.turnosHoy}</span>{' '}<span style={CHIP_UNIT}>turnos</span></span>
              </W>
              {', de los cuales '}
              <W id="confirmados" tooltip={<>{pendLine}</>}>
                <span style={CHIP_GREEN}><span style={CHIP_VAL}>{todayConfirmed.length}</span>{' '}<span style={CHIP_UNIT}>confirmados</span></span>
              </W>
              {' y quedan '}
              <W id="vacantes" tooltip={<>{slotLine}</>}>
                <span style={CHIP_TEAL}><span style={CHIP_VAL}>{kpiValues.vacantes}</span>{' '}<span style={CHIP_UNIT}>vacantes</span></span>
              </W>
              {'.'}<br />
              {'Facturación estimada: '}
              <W id="facturacion" tooltip={<>{svcLines.length > 0 ? svcLines.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>) : '—'}</>}>
                <span style={CHIP_GREEN}><span style={CHIP_VAL}>${kpiValues.facturacion.toLocaleString()}</span></span>
              </W>
              {'.'}
            </p>
          </div>
        );
      })()}

      {/* ── Two-column: próximo turno + agenda del día ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

        {/* Left: Próximo turno */}
        <div ref={proximoRef}>
          <p style={{ fontSize: '12px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Próximo turno</p>
          {nextApp ? (() => {
            const svc = services.find(s => s.id === nextApp.serviceId);
            const prov = providerMap[nextApp.providerId];
            const clientNote = clients.find(c => c.id === nextApp.clientId)?.notes;
            return <GlassCard as="button" onClick={() => onAppointmentClick(nextApp)} className="w-full text-left p-5 transition-all hover:shadow-lg" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Time + countdown */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontFamily: INSTRUMENT_SERIF, fontSize: 'clamp(44px, 8vw, 58px)', fontWeight: 300, letterSpacing: '-0.02em', color: T.dark, lineHeight: 1 }}>
                  {nextApp.startTime.split(':')[0]}<span style={{ color: SAGE }}>:</span>{nextApp.startTime.split(':')[1]}
                </p>
                {minsUntilNext && <span style={{ fontSize: '12px', fontWeight: 400, color: T.text3, paddingBottom: '6px' }}>{minsUntilNext}</span>}
              </div>
              {/* Client name */}
              <p style={{ fontSize: '15px', fontWeight: 400, color: T.text, marginBottom: clientNote ? '4px' : '8px' }}>{nextApp.clientName}</p>
              {/* Client note */}
              {clientNote && <p style={{ fontSize: '12px', fontWeight: 400, color: T.text2, fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.5 }}>{clientNote}</p>}
              {/* Status + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <StatusPill status={nextApp.status} />
                <span style={{ fontSize: '12px', color: T.text3 }}>{format(nextApp.date, "EEEE d 'de' MMMM", { locale: es })}</span>
              </div>
              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(27,45,59,0.07)', marginBottom: '14px' }} />
              {/* Provider */}
              {prov && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ProviderAvatar provider={prov} size="lg" />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 400, color: T.text }}>{prov.name}</p>
                  <p style={{ fontSize: '12px', fontWeight: 400, color: T.text2, marginTop: '2px' }}>{svc?.name ?? '—'} · {svc?.duration ?? 0} min</p>
                </div>
              </div>}
            </GlassCard>;
          })() : <GlassCard className="p-5">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 0', textAlign: 'center' }}>
              <CalendarClock className="w-8 h-8" style={{ color: '#c5d1cc' }} />
              <p style={{ fontSize: '14px', fontWeight: 400, color: T.text3 }}>Sin turnos próximos</p>
              <button onClick={() => onAddAppointment(startOfToday(), '09:00')} style={{ fontSize: '12px', fontWeight: 400, color: SAGE, padding: '6px 16px', borderRadius: '99px', background: 'rgba(107,143,126,0.10)', border: '1px solid rgba(107,143,126,0.20)' }}>
                + Agregar turno
              </button>
            </div>
          </GlassCard>}
        </div>

        {/* Right: Agenda del día — misma altura total que columna izquierda */}
        <div style={agendaHeight ? { height: agendaHeight, display: 'flex', flexDirection: 'column' } : {}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexShrink: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agenda de hoy</p>
            <button onClick={onNavigateAgenda} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 400, color: T.orange }}>
              <span>Ver completa</span><ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {/* Flex body: agenda GlassCard + slots libres */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <GlassCard className="overflow-hidden" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {todaySorted.length === 0
                ? <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 400, color: T.text3 }}>Sin turnos para hoy</p>
                  </div>
                : <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,143,166,0.3) transparent' }}>
                    {todaySorted.map((app, i) => {
                      const svc = services.find(s => s.id === app.serviceId);
                      const prov = providerMap[app.providerId];
                      const isNext = nextApp?.id === app.id;
                      return <button key={app.id} onClick={() => onAppointmentClick(app)} className="w-full text-left transition-colors hover:brightness-95" style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 16px',
                        borderBottom: i < todaySorted.length - 1 ? `1px solid ${T.border}` : undefined,
                        background: isNext ? 'rgba(107,143,126,0.06)' : 'transparent',
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 400, color: SAGE, width: '38px', flexShrink: 0, fontFamily: GEIST_MONO }}>{app.startTime}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 400, color: T.text, lineHeight: 1.2 }} className="truncate">{app.clientName}</p>
                          <p style={{ fontSize: '12px', fontWeight: 400, color: T.text2 }} className="truncate">{svc?.name ?? '—'}</p>
                        </div>
                        {prov && <ProviderAvatar provider={prov} size="sm" />}
                        <StatusPill status={app.status} />
                      </button>;
                    })}
                  </div>
              }
            </GlassCard>
            {/* Vacant slots quick add */}
            {vacantBlocks.length > 0 && <div style={{ marginTop: '12px', flexShrink: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Slots libres</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {vacantBlocks.slice(0, 6).map(block => (
                  <button key={block} onClick={() => onAddAppointment(startOfToday(), block)} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'rgba(255,255,255,0.72)', border: `1px solid ${T.borderO}` }}>{block}</button>
                ))}
                {vacantBlocks.length > 6 && <span style={{ fontSize: '12px', fontWeight: 400, color: T.text3, padding: '4px 6px' }}>+{vacantBlocks.length - 6} más</span>}
              </div>
            </div>}
          </div>
        </div>
      </div>

      {/* ── Messages preview ── */}
      {messages.length > 0 && (() => {
        const unread = messages.filter(m => m.unread);
        const shown = unread.length > 0 ? unread : messages.slice(0, 2);
        return (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ fontSize: '12px', fontWeight: 400, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mensajes</p>
                {unread.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '99px', background: T.orange, color: '#fff', fontSize: '9px', fontWeight: 400 }}>{unread.length}</span>}
              </div>
              <button onClick={onNavigateMessages} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 400, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span>Ver todos</span><ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <GlassCard className="overflow-hidden">
              {shown.map((msg, i) => {
                const initials = msg.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <button key={msg.id} onClick={onNavigateMessages} className="w-full text-left transition-colors hover:brightness-95" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: i < shown.length - 1 ? `1px solid ${T.border}` : undefined, background: 'transparent' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: SAGE_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 400, color: '#fff' }}>{initials}</div>
                      {msg.unread && <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: T.orange, border: '2px solid #fff' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <p style={{ fontSize: '13px', fontWeight: msg.unread ? 500 : 400, color: T.text }}>{msg.clientName}</p>
                        <span style={{ fontSize: '11px', color: T.text3, flexShrink: 0, marginLeft: '8px' }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: msg.unread ? T.text2 : T.text3, fontWeight: 400 }} className="truncate">{msg.preview}</p>
                    </div>
                  </button>
                );
              })}
            </GlassCard>
          </div>
        );
      })()}

      <div style={{ height: '16px' }} />
    </div>
  </div>;
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
    if (filterValues.size === 0) return filteredApps;
    const providerIds = Array.from(filterValues).filter(v => v.startsWith('p:')).map(v => v.slice(2));
    const serviceIds = Array.from(filterValues).filter(v => v.startsWith('s:')).map(v => v.slice(2));
    return filteredApps.filter(a => {
      const mp = providerIds.length === 0 || providerIds.includes(a.providerId);
      const ms = serviceIds.length === 0 || serviceIds.includes(a.serviceId);
      return mp && ms;
    });
  }, [filteredApps, filterValues]);
  const selectedDateApps = useMemo(() => providerFilteredApps.filter(a => isSameDay(a.date, selectedDate)), [providerFilteredApps, selectedDate]);
  const switchToDay = (d: Date) => {
    setSelectedDate(d);
    setCalView('day');
  };
  const filterCount = filterValues.size;
  return <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-4 gap-0" style={{ background: 'transparent' }}>
    <div className="flex-1 flex flex-col overflow-hidden" style={{ ...CONTENT_GLASS, maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
    <div style={{ padding: '0 4px' }}>
      <div className="py-2.5 flex items-center gap-2 flex-wrap shrink-0 px-3" style={{
        borderBottom: `1px solid ${T.border}`,
        background: 'transparent'
      }}>
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
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronLeft className="w-3.5 h-3.5" style={{
              color: T.text2
            }} /></button>
          <span className="text-xs font-normal px-1 capitalize whitespace-nowrap" style={{
            color: T.text2
          }}>{format(selectedDate, 'EEE d MMM', {
              locale: es
            })} – {format(addDays(selectedDate, 6), 'd MMM yyyy', {
              locale: es
            })}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-black/5"><ChevronRight className="w-3.5 h-3.5" style={{
              color: T.text2
            }} /></button>
        </div>}
        <div ref={filterDropdownRef} className="relative">
          <button onClick={() => setFilterDropdownOpen(v => !v)} className="flex items-center gap-1.5 text-xs font-normal px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all" style={{
            background: filterCount > 0 ? T.dark : T.bg2,
            color: filterCount > 0 ? '#fff' : T.text2,
            border: `1px solid ${filterCount > 0 ? T.dark : T.border}`
          }}>
            <Filter className="w-3 h-3 shrink-0" /><span>{filterCount > 0 ? `Filtrar (${filterCount})` : 'Filtrar'}</span>
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
type ClientsScreenProps = {
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  messages: Message[];
  onNewClient: () => void;
  initialClientId?: string | null;
  onClientOpened?: () => void;
};
const ClientsScreen = ({
  clients,
  appointments,
  services,
  messages,
  onNewClient,
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
    const hasUpcoming = apps.some(a => isAfter(a.date, new Date()) && a.status !== 'cancelled' && a.status !== 'no_show');
    const hasNoShows = apps.some(a => a.status === 'no_show');
    return {
      client: c,
      totalApps: apps.length,
      hasUpcoming,
      hasNoShows
    };
  }), [clients, appointments]);
  const filtered = clientStats.filter(({
    client,
    hasUpcoming,
    hasNoShows,
    totalApps
  }) => {
    const matchSearch = client.name.toLowerCase().includes(search.toLowerCase()) || client.phone.includes(search);
    const msg = messageByClient[client.id];
    const matchUnread = !unreadOnly || msg?.unread === true;
    let matchStatus = true;
    if (statusFilter === 'con_turno') matchStatus = hasUpcoming;else if (statusFilter === 'sin_turno') matchStatus = totalApps === 0 || !hasUpcoming;else if (statusFilter === 'con_ausencias') matchStatus = hasNoShows;
    return matchSearch && matchUnread && matchStatus;
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
  return <div className="w-full h-full flex overflow-hidden gap-3 py-4" style={{
    ...CONTAINER_STYLE,
    paddingTop: '16px',
    paddingBottom: '16px'
  }}>
    {/* Left panel — inbox */}
    <div className={cn('flex flex-col overflow-hidden shrink-0', selectedClientId ? 'hidden md:flex' : 'flex w-full md:w-auto')} style={{
      width: '320px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.80)',
      boxShadow: '0 4px 24px rgba(61,90,78,0.07)',
    }}>
      <div className="px-4 py-4 shrink-0" style={{
        borderBottom: `1px solid ${T.border}`,
        background: 'transparent'
      }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2.5" style={{
          border: `1px solid ${T.border}`,
          background: 'rgba(0,0,0,0.04)'
        }}>
          <Search className="w-4 h-4 shrink-0" style={{
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
          <button onClick={() => setUnreadOnly(v => !v)} className="flex items-center gap-1.5 text-[12px] font-normal px-3 py-1.5 rounded-xl transition-all shrink-0" style={{
            background: unreadOnly ? T.dark : T.bg2,
            color: unreadOnly ? '#fff' : T.text2,
            border: `1px solid ${unreadOnly ? T.dark : T.border}`
          }}>
            <MessageCircle className="w-3.5 h-3.5 shrink-0" /><span>No leídos</span>
            {unreadCount > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-normal" style={{
              background: unreadOnly ? 'rgba(255,255,255,0.25)' : T.orange,
              color: '#fff'
            }}>{unreadCount}</span>}
          </button>
          <div ref={statusDropdownRef} className="relative flex-1">
            <button onClick={() => setStatusDropdownOpen(v => !v)} className="w-full flex items-center justify-between gap-1.5 text-[12px] font-normal px-3 py-1.5 rounded-xl transition-all" style={{
              background: statusFilter !== 'all' ? T.orangeLight : T.bg2,
              color: statusFilter !== 'all' ? T.orange : T.text2,
              border: `1px solid ${statusFilter !== 'all' ? T.borderO : T.border}`
            }}>
              <span className="truncate">{currentStatusLabel}</span>
              <ChevronDown className="w-3 h-3 shrink-0" style={{
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
          totalApps
        }) => {
          const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          const msg = messageByClient[client.id];
          const isSelected = selectedClientId === client.id;
          return <div key={client.id} onClick={() => handleSelectClient(client.id)} className="flex items-center gap-3 px-4 py-5 cursor-pointer transition-colors" style={{
            background: isSelected ? T.orangePale : 'transparent',
            borderBottom: `1px solid ${T.border}`,
            borderLeft: isSelected ? `3px solid ${T.orange}` : '3px solid transparent'
          }}>
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-normal text-white text-sm shrink-0" style={{
                background: SAGE
              }}>{initials}</div>
              {msg?.unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{
                background: T.orange
              }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="font-normal text-sm truncate" style={{
                  color: T.text
                }}>{client.name}</p>
                {msg && <p className="text-xs shrink-0 font-normal" style={{
                  color: T.text3
                }}>{msg.time}</p>}
              </div>
              {msg ? <p className="text-xs truncate font-normal mt-0.5" style={{
                color: msg.unread ? T.text : T.text3,
                fontWeight: 400
              }}>{msg.preview}</p> : <p className="text-xs font-normal mt-0.5" style={{
                color: T.text3
              }}>{totalApps} {totalApps === 1 ? 'turno' : 'turnos'}</p>}
            </div>
          </div>;
        })}
        {filtered.length === 0 && <p className="text-sm text-center py-8 font-normal" style={{
          color: T.text3
        }}>Sin resultados</p>}
      </div>
    </div>
    {/* Right panel — conversation or empty state */}
    {selectedClient ? <div className="flex-1 flex flex-col overflow-hidden" style={{
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.80)',
      boxShadow: '0 4px 24px rgba(61,90,78,0.07)',
    }}>
      <div className="px-5 py-4 shrink-0 flex items-center gap-3" style={{
        borderBottom: `1px solid ${T.border}`,
        background: `linear-gradient(135deg, ${T.orangePale} 0%, transparent 100%)`
      }}>
        <button onClick={() => setSelectedClientId(null)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 mr-1 shrink-0"><ChevronLeft className="w-4 h-4" style={{
            color: T.text2
          }} /></button>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-normal text-white text-sm shrink-0" style={{
          background: SAGE
        }}>{selectedClient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-normal text-base leading-tight truncate" style={{
            color: T.text
          }}>{selectedClient.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5" style={{
            color: T.text3
          }}><Phone className="w-3 h-3" /><span className="text-xs">{selectedClient.phone}</span></div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedClient.tags.map(tag => <span key={tag} className="text-[11px] font-normal px-2 py-0.5 rounded-full" style={{
            background: TAG_COLORS[tag]?.bg ?? T.bg2,
            color: TAG_COLORS[tag]?.text ?? T.text2
          }}>{tag}</span>)}
          {noShows > 0 && <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-normal" style={{
            background: 'rgba(229,57,53,0.1)',
            color: '#C62828'
          }}><AlertCircle className="w-3.5 h-3.5" /><span>{noShows}</span></div>}
        </div>
      </div>
      <div className="px-4 py-3 shrink-0 flex gap-2" style={{
        borderBottom: `1px solid ${T.border}`
      }}>
        {([{
          id: 'chat',
          label: 'Conversación'
        }, {
          id: 'history',
          label: 'Historial'
        }] as const).map(tab => <button key={tab.id} onClick={() => setClientPanelTab(tab.id)} className="px-4 py-2 text-xs font-normal rounded-t-lg transition-all" style={{
          background: clientPanelTab === tab.id ? 'rgba(250,248,244,0.8)' : 'transparent',
          color: clientPanelTab === tab.id ? T.orange : T.text2,
          fontWeight: 400,
          borderBottom: clientPanelTab === tab.id ? `2px solid ${T.orange}` : '2px solid transparent',
          marginBottom: '-1px'
        }}>
          {tab.label}
          {tab.id === 'chat' && clientMsg?.unread && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[8px] font-normal" style={{
            background: T.orange
          }}>1</span>}
        </button>)}
      </div>
      {clientPanelTab === 'chat' ? <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
          background: 'transparent'
        }}>
          {chatMessages.length === 0 && <div className="flex flex-col items-center justify-center h-full py-12"><MessageCircle className="w-10 h-10 mb-2" style={{
              color: T.text3,
              opacity: 0.3
            }} /><p className="text-sm font-normal" style={{
              color: T.text3
            }}>Sin mensajes aún</p></div>}
          {chatMessages.map((cm, i) => <div key={i} className={cn('flex', cm.from === 'bot' ? 'justify-start' : 'justify-end')}>
            {cm.from === 'bot' && <div className="w-6 h-6 rounded-lg flex items-center justify-center font-normal text-white text-xs shrink-0 mr-2 mt-1 self-end" style={{
              background: SAGE_GRAD
            }}>TB</div>}
            <div className="max-w-[72%]">
              <div className="px-3.5 py-2.5 text-sm" style={{
                background: cm.from === 'bot' ? 'rgba(250,248,244,0.9)' : SAGE,
                color: cm.from === 'bot' ? T.text : '#fff',
                borderRadius: cm.from === 'bot' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                boxShadow: T.shadow,
                border: cm.from === 'bot' ? `1px solid ${T.borderO}` : 'none'
              }}>{cm.text}</div>
              <p className="text-[12px] mt-1 font-normal px-1" style={{
                color: T.text3,
                textAlign: cm.from === 'bot' ? 'left' : 'right'
              }}>{cm.time}</p>
            </div>
          </div>)}
        </div>
        <div className="px-4 py-3 shrink-0 flex gap-2" style={{
          borderTop: `1px solid ${T.border}`,
          background: 'transparent'
        }}>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{
            background: 'rgba(0,0,0,0.04)',
            border: `1px solid ${T.border}`
          }}>
            <MessageCircle className="w-3.5 h-3.5 shrink-0" style={{
              color: T.text3
            }} />
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Solo lectura — conversación del bot" readOnly className="flex-1 text-xs bg-transparent focus:outline-none cursor-not-allowed" style={{
              color: T.text3
            }} />
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-normal" style={{
            background: 'rgba(0,0,0,0.04)',
            color: T.text3,
            border: `1px solid ${T.border}`
          }}><Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Solo lectura</span></div>
        </div>
      </div> : <div className="flex-1 overflow-y-auto" style={{
        background: 'transparent'
      }}>
        <div className="grid grid-cols-3 bg-white" style={{
          borderBottom: `1px solid ${T.border}`
        }}>
          {[{
            label: 'Turnos',
            value: String(clientApps.length),
            red: false
          }, {
            label: 'Gastado',
            value: totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—',
            red: false
          }, {
            label: 'No shows',
            value: String(noShows),
            red: noShows > 0
          }].map((stat, i) => <div key={stat.label} className="p-4 text-center" style={{
            borderLeft: i > 0 ? `1px solid ${T.border}` : 'none'
          }}><p className="text-xl font-normal" style={{
              color: stat.red ? '#C62828' : T.text
            }}>{stat.value}</p><p className="text-[12px] font-normal uppercase tracking-wider mt-0.5" style={{
              color: T.text3
            }}>{stat.label}</p></div>)}
        </div>
        <div className="p-4">
          <p className="text-[12px] font-normal uppercase tracking-wider mb-3" style={{
            color: T.text3
          }}>Notas internas</p>
          {selectedClient.notes ? <p className="text-sm font-normal" style={{
            color: T.text2
          }}>{selectedClient.notes}</p> : <p className="text-xs font-normal italic" style={{
            color: T.text3
          }}>Sin notas</p>}
        </div>
        <div className="p-4">
          <p className="text-[12px] font-normal uppercase tracking-wider mb-3" style={{
            color: T.text3
          }}>Historial de turnos</p>
          <div className="space-y-2">
            {pastApps.length === 0 && <p className="text-sm font-normal text-center py-4" style={{
              color: T.text3
            }}>Sin historial aún</p>}
            {pastApps.map(app => {
              const svc = services.find(s => s.id === app.serviceId);
              const sc = STATUS_CONFIG[app.status];
              return <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-white" style={{
                border: `1px solid ${T.border}`
              }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-normal" style={{
                      color: T.text
                    }}>{format(app.date, 'd MMM yyyy', {
                        locale: es
                      })}</p>
                      <span className="text-[12px] font-normal px-2 py-0.5 rounded-full" style={{
                      background: sc.bg,
                      color: sc.text
                    }}>{sc.label}</span>
                    </div>
                    <p className="text-xs font-normal mt-0.5 flex items-center gap-1 truncate" style={{
                    color: T.text2
                  }}><Clock className="w-3 h-3 shrink-0" /><span>{app.startTime} — {svc?.name}</span></p>
                  </div>
                  {svc && app.status === 'confirmed' && <p className="text-sm font-normal shrink-0" style={{
                  color: T.text
                }}>${svc.price.toLocaleString()}</p>}
                </div>;
            })}
          </div>
        </div>
      </div>}
    </div> : <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3" style={{
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.80)',
      boxShadow: '0 4px 24px rgba(61,90,78,0.07)',
    }}>
      <MessageCircle className="w-12 h-12" style={{
        color: T.text3,
        opacity: 0.25
      }} />
      <p className="text-sm font-normal" style={{
        color: T.text3
      }}>Seleccioná una conversación para ver los detalles</p>
    </div>}
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
  return <div className="w-full space-y-5 overflow-auto h-full px-4 sm:px-8 py-6 max-w-[1080px] mx-auto box-border">
    <div>
      <p className="text-[12px] font-normal uppercase tracking-widest mb-3 px-1" style={{
        color: T.text3
      }}>Tu negocio</p>
      <div className="space-y-6">
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{
            borderBottom: `1px solid ${T.border}`
          }}><h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Datos del negocio</h3></div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Nombre del negocio</label><input type="text" defaultValue="Peluquería El Barrio" placeholder="Ej: Peluquería El Barrio" className={inp} style={inpStyle} /></div>
            <div><label className={lbl}>Dirección</label><input type="text" defaultValue="Av. Corrientes 1234, CABA" placeholder="Ej: Av. Corrientes 1234, CABA" className={inp} style={inpStyle} /></div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4 flex items-center gap-3 flex-wrap shrink-0" style={{
            borderBottom: `1px solid ${T.border}`
          }}>
            <h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Profesionales</h3>
            <p className="text-xs font-normal mt-0.5" style={{
              color: T.text3
            }}>Máximo 5 · El/la dueño/a siempre es prestador</p>
            <span className="text-sm font-normal" style={{
              color: providers.length >= maxProviders ? T.text3 : T.orange
            }}>{providers.length}/{maxProviders}</span>
          </div>
          <div className="divide-y" style={{
            borderColor: T.border
          }}>
            {providers.map(p => <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-normal text-white text-sm shrink-0" style={{
                background: p.color ?? SAGE
              }}>{p.initials}</div>
              <div className="flex-1 min-w-0"><p className="font-normal text-sm" style={{
                  color: T.text
                }}>{p.name}</p><p className="text-xs font-normal" style={{
                  color: T.text3
                }}>{p.role === 'owner' ? 'Dueño/a' : 'Staff'}</p></div>
              <Toggle checked={p.active} onChange={() => toggleProvider(p.id)} disabled={p.role === 'owner'} />
            </div>)}
            {providers.length < maxProviders && <div className="px-5 py-3"><button className="flex items-center gap-2 text-sm font-normal" style={{
                color: T.orange
              }}><Plus className="w-4 h-4" /><span>Agregar profesional</span></button></div>}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{
            borderBottom: `1px solid ${T.border}`
          }}><h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Servicios</h3></div>
          <div className="divide-y" style={{
            borderColor: T.border
          }}>
            {services.map(svc => {
              const IconComp = getServiceIcon(svc.name);
              const activeDays = Object.keys(svc.availability).map(Number).filter(d => (svc.availability[d]?.length ?? 0) > 0);
              return <div key={svc.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{
                  background: SAGE
                }}><IconComp className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-normal text-sm" style={{
                    color: T.text
                  }}>{svc.name}</p>
                  <p className="text-xs font-normal mt-0.5" style={{
                    color: T.text3
                  }}>{svc.duration} min · ${svc.price.toLocaleString()}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">{DAYS_ORDER.map(d => <span key={d} className="text-[11px] font-normal px-1.5 py-0.5 rounded-md" style={{
                      background: activeDays.includes(d) ? `${svc.color}20` : T.bg2,
                      color: activeDays.includes(d) ? svc.color : T.text3
                    }}>{DAY_NAMES[d].slice(0, 3)}</span>)}</div>
                </div>
                <button onClick={() => onEditService(svc)} className="p-2 rounded-xl hover:bg-black/5 transition-colors shrink-0" style={{
                  color: T.text2
                }}><Settings className="w-4 h-4" /></button>
              </div>;
            })}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{
            borderBottom: `1px solid ${T.border}`
          }}><h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Horarios de atención</h3></div>
          <div className="divide-y" style={{
            borderColor: T.border
          }}>
            {DAYS_ORDER.map(dayIdx => <div key={dayIdx} className="flex items-center gap-4 px-5 py-3">
              <p className="text-sm font-normal w-24 shrink-0" style={{
                color: T.text
              }}>{DAY_NAMES[dayIdx]}</p>
              {dayIdx === 0 ? <span className="text-xs font-normal px-2 py-1 rounded-lg" style={{
                background: T.bg2,
                color: T.text3
              }}>Cerrado</span> : <span className="text-xs font-normal" style={{
                color: T.text3
              }}>09:00 – 13:00 / 15:00 – 19:00</span>}
            </div>)}
          </div>
        </div>
      </div>
    </div>
    <div>
      <p className="text-[12px] font-normal uppercase tracking-widest mb-3 px-1 pt-2" style={{
        color: T.text3
      }}>Tu bot</p>
      <div className="space-y-6">
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{
            borderBottom: `1px solid ${T.border}`
          }}><h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Configuración del bot</h3></div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Nombre del bot</label><input type="text" defaultValue="BarrioBot" className={inp} style={inpStyle} /></div>
            <div><label className={lbl}>Tono del bot</label><select className={inp} style={inpStyle} defaultValue="friendly"><option value="friendly">Amigable y cercano</option><option value="formal">Formal y profesional</option><option value="casual">Casual y divertido</option></select></div>
            <div className="sm:col-span-2"><label className={lbl}>Mensaje de bienvenida</label><textarea defaultValue="¡Hola! Soy BarrioBot, el asistente de Peluquería El Barrio. ¿En qué puedo ayudarte?" rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-[#5B8FA6]/30" style={inpStyle} /></div>
            <div><label className={lbl}>Límite de cancelación (horas)</label><input type="number" defaultValue={12} className={inp} style={inpStyle} /></div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <h3 className="font-normal text-sm" style={{ color: T.text }}>Asistente virtual</h3>
          </div>
          {/* Horario activo */}
          <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal" style={{ color: T.text }}>Horario de actividad</p>
              <p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>El bot responde mensajes en este rango</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <input type="time" value={botFromTime} onChange={e => setBotFromTime(e.target.value)} className={inp} style={{ ...inpStyle, width: '100px', padding: '6px 10px' }} />
              <span className="text-xs" style={{ color: T.text3 }}>a</span>
              <input type="time" value={botToTime} onChange={e => setBotToTime(e.target.value)} className={inp} style={{ ...inpStyle, width: '100px', padding: '6px 10px' }} />
            </div>
          </div>
          {/* No molestar */}
          <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal" style={{ color: T.text }}>No molestar</p>
              <p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>Pausa notificaciones fuera del horario activo</p>
            </div>
            <Toggle checked={botDnd} onChange={setBotDnd} />
          </div>
          {/* Modo de respuesta */}
          <div className="px-5 py-4">
            <p className="text-sm font-normal mb-3" style={{ color: T.text }}>Modo de respuesta</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {BOT_MODES.map(m => (
                <button key={m.id} onClick={() => setBotMode(m.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${botMode === m.id ? SAGE : T.border}`, background: botMode === m.id ? 'rgba(91,143,166,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
                  <div>
                    <p className="text-sm font-normal" style={{ color: botMode === m.id ? T.dark : T.text }}>{m.label}</p>
                    <p className="text-xs font-normal mt-0.5" style={{ color: T.text3 }}>{m.desc}</p>
                  </div>
                  {botMode === m.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: SAGE, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ ...CARD_GLASS }}>
          <div className="px-5 py-4" style={{
            borderBottom: `1px solid ${T.border}`
          }}><h3 className="font-normal text-sm" style={{
              color: T.text
            }}>Recordatorios automáticos</h3></div>
          <div className="divide-y" style={{
            borderColor: T.border
          }}>
            {REMINDER_ITEMS.map(r => <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0"><p className="text-sm font-normal" style={{
                  color: T.text
                }}>{r.title}</p><p className="text-xs font-normal" style={{
                  color: T.text3
                }}>{r.sub}</p></div>
              <Toggle checked={!!reminders[r.id]} onChange={v => setReminders(prev => ({ ...prev, [r.id]: v }))} />
            </div>)}
            <div className="flex items-center gap-4 px-5 py-3.5" style={{
              opacity: 0.5
            }}>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-normal" style={{
                    color: T.text
                  }}>Saludo de cumpleaños</p><span className="text-[11px] font-normal px-2 py-0.5 rounded-full" style={{
                    background: T.orangeLight,
                    color: T.orange
                  }}>Próximamente</span></div><p className="text-xs font-normal" style={{
                  color: T.text3
                }}>El bot podría saludar a tus clientes en su cumpleaños</p></div>
              <div style={{ pointerEvents: 'none' }}><Toggle checked={false} disabled /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
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
        <ChevronLeft className="w-4 h-4" style={{ color: T.text2 }} />
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
              <CheckCircle2 className="w-3.5 h-3.5" /><span>Confirmar</span>
            </button>
          )}
          <button onClick={onReschedule}
            className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
            style={{ background: T.dark, color: '#fff' }}>
            <CalendarClock className="w-3.5 h-3.5" /><span>Reagendar</span>
          </button>
        </div>
        {/* Fila 2: acciones destructivas */}
        {(appointment.status !== 'no_show' || appointment.status !== 'cancelled') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {appointment.status !== 'no_show' && (
              <button onClick={() => { onUpdateStatus(appointment.id, 'no_show'); showToast('Marcado como no-show'); }}
                className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(91,143,166,0.08)', color: T.text2, border: `1px solid ${T.border}` }}>
                <XCircle className="w-3.5 h-3.5" /><span>No show</span>
              </button>
            )}
            {appointment.status !== 'cancelled' && (
              <button onClick={() => { onUpdateStatus(appointment.id, 'cancelled'); showToast('Turno cancelado'); }}
                className="py-2.5 rounded-xl text-xs font-normal flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(91,143,166,0.08)', color: T.text2, border: `1px solid ${T.border}` }}>
                <X className="w-3.5 h-3.5" /><span>Cancelar</span>
              </button>
            )}
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Search className="w-3.5 h-3.5" style={{
            color: T.text3
          }} /></div>
        <input type="text" placeholder="Buscar cliente por nombre o teléfono..." value={clientQuery} onChange={e => {
          setClientQuery(e.target.value);
          setNewAppForm(f => ({
            ...f,
            clientName: e.target.value
          }));
          setClientSelected(false);
        }} onFocus={() => setDropdownOpen(true)} onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#5B8FA6]/30 focus:border-[#6b8f7e]/40 transition-colors" style={inpStyle} />
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
      <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 shrink-0"><ChevronLeft className="w-4 h-4" style={{
          color: T.text2
        }} /></button>
      <h3 className="font-normal text-base flex-1 truncate" style={{
        color: T.text
      }}>Editar servicio</h3>
      <button onClick={() => {
        onDelete(service.id);
        showToast('Servicio eliminado');
      }} className="p-2 rounded-xl hover:bg-rose-50 transition-colors shrink-0"><Trash2 className="w-4 h-4" style={{
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
      }}><Save className="w-4 h-4" /><span>Guardar cambios</span></button>
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
  icon: Settings,
  label: 'Mi cuenta',
  action: 'account' as const
}, {
  id: 'subscription',
  icon: CreditCard,
  label: 'Suscripción',
  action: 'subscription' as const
}, {
  id: 'share',
  icon: Share2,
  label: 'Compartir enlace',
  action: null as null
}, {
  id: 'support',
  icon: HelpCircle,
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
      }}><LogOut className="w-4 h-4 shrink-0" /><span>Cerrar sesión</span></button>
    </div>
  </motion.div>;
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
      }}><Save className="w-4 h-4" /><span>Guardar</span></button>
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
  }}><Settings className="w-4 h-4" /><span>Actualizar plan</span></button>
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
      icon: Mail,
      label: 'Enviar email',
      sub: 'soporte@turnobot.app'
    }, {
      icon: MessageSquare,
      label: 'Chat en vivo',
      sub: 'Respuesta en minutos'
    }, {
      icon: HelpCircle,
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
        }))} rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-[#5B8FA6]/30" style={inpStyle} placeholder="Preferencias, alergias..." /></div>
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
      <aside onMouseEnter={() => setSidebarExpanded(true)} onMouseLeave={() => setSidebarExpanded(false)} className="hidden md:flex flex-col transition-all duration-300 ease-in-out overflow-hidden" style={{
        position: 'absolute',
        left: 0,
        top: '60px',
        bottom: 0,
        width: sidebarExpanded ? '196px' : '68px',
        background: 'transparent',
        zIndex: 15
      }}>
        <nav className="flex-1 py-4 px-2.5 space-y-0.5">
          {NAV_ITEMS.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className="w-full flex items-center overflow-hidden transition-all duration-150" style={{
            height: '42px',
            paddingLeft: '10px',
            borderRadius: '12px',
            background: activeTab === item.id ? 'rgba(107,143,126,0.10)' : 'transparent',
            color: activeTab === item.id ? T.text : '#9f9b93',
            fontWeight: 400
          }}>
            <item.icon style={{
              width: '18px',
              height: '18px',
              flexShrink: 0
            }} />
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
          <button ref={userMenuAnchorRef} onClick={() => setUserMenuOpen(v => !v)} className="w-full flex items-center overflow-hidden transition-colors rounded-xl" style={{
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
      <div className="px-4 md:px-5 flex items-center justify-between gap-3" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '60px', zIndex: 20,
        background: 'transparent'
      }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0 font-bold text-white text-sm" style={{
            background: SAGE_GRAD
          }}>TB</div>
          <p className="text-[15px] leading-tight" style={{ color: T.text, fontWeight: 500 }}>
            Turno<span style={{ color: T.orange }}>Bot</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => openNewApp()} className="flex items-center gap-1.5 text-xs font-normal px-3 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95" style={{
              background: T.orange,
              color: '#fff'
            }}><Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Nuevo turno</span></button>
            <button onClick={() => setShareOpen(true)} className="p-2 rounded-xl transition-colors hover:opacity-80" style={{
              background: T.bg2,
              border: `1px solid ${T.border}`
            }}><Share2 className="w-4 h-4" style={{
                color: T.text2
              }} /></button>
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)} className="p-2 rounded-xl transition-colors hover:opacity-80" style={{
                background: T.bg2,
                border: `1px solid ${T.border}`
              }}><Bell className="w-4 h-4" style={{
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
      <main className="flex flex-col min-w-0 overflow-hidden" style={{
        position: 'absolute',
        top: '60px',
        left: '68px',
        right: 0,
        bottom: 0,
        zIndex: 1
      }}>
        <div className="flex-1 overflow-hidden pb-16 md:pb-0 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <motion.div key="home" initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} transition={{
              duration: 0.2
            }} className="flex-1 overflow-hidden h-full flex flex-col">
              <InicioScreen todayApps={todayApps} services={services} providerMap={providerMap} clients={clients} messages={messages} onAppointmentClick={app => setSelectedAppointment(app)} onAddAppointment={openNewApp} greeting={greeting} profileName={profile.name} onNavigateAgenda={() => setActiveTab('agenda')} onNavigateMessages={() => setActiveTab('clients')} />
            </motion.div>}
            {activeTab === 'agenda' && <motion.div key="agenda" initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} transition={{
              duration: 0.2
            }} className="flex-1 flex flex-col overflow-hidden h-full">
              <AgendaScreen filteredApps={appointments} services={services} providers={providers} providerMap={providerMap} blockedSlots={blockedSlots} onAppointmentClick={app => setSelectedAppointment(app)} onAddAppointment={openNewApp} onBlockSlot={() => setBlockingSlot(true)} />
            </motion.div>}
            {activeTab === 'clients' && <motion.div key="clients" initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} transition={{
              duration: 0.2
            }} className="flex-1 flex flex-col overflow-hidden h-full">
              <ClientsScreen clients={clients} appointments={appointments} services={services} messages={messages} onNewClient={() => setNewClientOpen(true)} initialClientId={pendingClientId} onClientOpened={() => setPendingClientId(null)} />
            </motion.div>}
            {activeTab === 'config' && <motion.div key="config" initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} transition={{
              duration: 0.2
            }} className="flex-1 overflow-auto h-full">
              <ConfigScreen services={services} providers={providers} setProviders={setProviders} onAddService={addService} onEditService={svc => setEditingService(svc)} />
            </motion.div>}
          </AnimatePresence>
        </div>
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20" style={{
        background: 'rgba(250,248,244,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        height: '58px'
      }}>
        <div className="flex h-full">
          {NAV_ITEMS.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" style={{
            color: activeTab === item.id ? '#1A1A1A' : '#9f9b93'
          }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{
              background: activeTab === item.id ? 'rgba(0,0,0,0.05)' : 'transparent'
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
            }}><CalendarClock className="w-4 h-4" /><span>Confirmar</span></button>
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
    </div>
  </ToastProvider>;
};
export default SalonAdminDashboard;