import { startOfToday, subDays, addDays } from 'date-fns';
import { Service, Appointment, Client, BlockedSlot, Provider, Message } from './types';
export const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};
export const INITIAL_PROVIDERS: Provider[] = [{
  id: 'p1',
  name: 'José Pérez',
  role: 'owner',
  color: '#C49580',
  initials: 'JP',
  active: true
}, {
  id: 'p2',
  name: 'Ana Gómez',
  role: 'staff',
  color: '#7FA8C4',
  initials: 'AG',
  active: true
}, {
  id: 'p3',
  name: 'Lucas Herrera',
  role: 'staff',
  color: '#6BABA4',
  initials: 'LH',
  active: true
}];
export const INITIAL_SERVICES: Service[] = [{
  id: 's1',
  name: 'Corte Caballero',
  duration: 30,
  price: 1500,
  color: '#3B82F6',
  availability: {
    1: [{
      id: 'r1',
      start: '09:00',
      end: '13:00'
    }, {
      id: 'r2',
      start: '15:00',
      end: '19:00'
    }],
    2: [{
      id: 'r3',
      start: '09:00',
      end: '13:00'
    }, {
      id: 'r4',
      start: '15:00',
      end: '19:00'
    }],
    3: [{
      id: 'r5',
      start: '09:00',
      end: '13:00'
    }, {
      id: 'r6',
      start: '15:00',
      end: '19:00'
    }],
    4: [{
      id: 'r7',
      start: '09:00',
      end: '13:00'
    }, {
      id: 'r8',
      start: '15:00',
      end: '19:00'
    }],
    5: [{
      id: 'r9',
      start: '09:00',
      end: '13:00'
    }, {
      id: 'r10',
      start: '15:00',
      end: '19:00'
    }]
  }
}, {
  id: 's2',
  name: 'Coloración Completa',
  duration: 120,
  price: 4500,
  color: '#8B5CF6',
  availability: {
    2: [{
      id: 'r11',
      start: '10:00',
      end: '14:00'
    }],
    4: [{
      id: 'r12',
      start: '10:00',
      end: '14:00'
    }]
  }
}, {
  id: 's3',
  name: 'Mechas + Corte',
  duration: 90,
  price: 5500,
  color: '#E8601A',
  availability: {
    3: [{
      id: 'r13',
      start: '09:00',
      end: '12:00'
    }],
    5: [{
      id: 'r14',
      start: '09:00',
      end: '12:00'
    }]
  }
}];
export const INITIAL_CLIENTS: Client[] = [{
  id: 'c1',
  name: 'Juan Pérez',
  phone: '1122334455',
  notes: 'Prefiere corte bajo. Alérgico a tinte amoniacal.',
  tags: ['frecuente'],
  birthday: '1990-03-15'
}, {
  id: 'c2',
  name: 'María García',
  phone: '1155667788',
  notes: 'Cliente frecuente. Siempre pide lo mismo.',
  tags: ['frecuente', 'vip'],
  birthday: '1985-07-22'
}, {
  id: 'c3',
  name: 'Laura Martínez',
  phone: '1198765432',
  notes: '',
  tags: [],
  birthday: ''
}, {
  id: 'c4',
  name: 'Carlos Rodríguez',
  phone: '1133445566',
  notes: 'No llegó en 2 ocasiones.',
  tags: ['riesgo'],
  birthday: '1992-11-05'
}, {
  id: 'c5',
  name: 'Sofía Benítez',
  phone: '1144556677',
  notes: 'Prefiere turno por las mañanas.',
  tags: ['mañana'],
  birthday: '1998-01-30'
}, {
  id: 'c6',
  name: 'José Ramírez',
  phone: '1166778899',
  notes: '',
  tags: [],
  birthday: ''
}, {
  id: 'c7',
  name: 'Mario Suárez',
  phone: '1177889900',
  notes: '',
  tags: [],
  birthday: ''
}];
const today = startOfToday();
const _d = new Date(); _d.setHours(_d.getHours() + 2, 0, 0, 0);
const nextDemoTime = `${String(_d.getHours()).padStart(2, '0')}:00`;
export const INITIAL_APPOINTMENTS: Appointment[] = [{
  id: 'a1',
  clientId: 'c1',
  clientName: 'Juan Pérez',
  clientPhone: '1122334455',
  serviceId: 's1',
  providerId: 'p1',
  date: today,
  startTime: '09:30',
  status: 'confirmed'
}, {
  id: 'a2',
  clientId: 'c2',
  clientName: 'María García',
  clientPhone: '1155667788',
  serviceId: 's2',
  providerId: 'p2',
  date: today,
  startTime: '11:00',
  status: 'pending'
},
// Overlapping pair 1: 10:00
{
  id: 'a-ov1a',
  clientId: 'c6',
  clientName: 'José Ramírez',
  clientPhone: '1166778899',
  serviceId: 's1',
  providerId: 'p1',
  date: today,
  startTime: '10:00',
  status: 'confirmed'
}, {
  id: 'a-ov1b',
  clientId: 'c7',
  clientName: 'Mario Suárez',
  clientPhone: '1177889900',
  serviceId: 's1',
  providerId: 'p3',
  date: today,
  startTime: '10:00',
  status: 'confirmed'
},
// Overlapping pair 2: 15:00
{
  id: 'a-ov2a',
  clientId: 'c3',
  clientName: 'Laura Martínez',
  clientPhone: '1198765432',
  serviceId: 's3',
  providerId: 'p1',
  date: today,
  startTime: '15:00',
  status: 'pending'
}, {
  id: 'a-ov2b',
  clientId: 'c5',
  clientName: 'Sofía Benítez',
  clientPhone: '1144556677',
  serviceId: 's1',
  providerId: 'p2',
  date: today,
  startTime: '15:00',
  status: 'confirmed'
}, {
  id: 'a3',
  clientId: 'c3',
  clientName: 'Laura Martínez',
  clientPhone: '1198765432',
  serviceId: 's3',
  providerId: 'p1',
  date: addDays(today, 1),
  startTime: '09:00',
  status: 'confirmed'
}, {
  id: 'a8',
  clientId: 'c2',
  clientName: 'Sofía Benítez',
  clientPhone: '1144556677',
  serviceId: 's2',
  providerId: 'p2',
  date: today,
  startTime: nextDemoTime,
  status: 'confirmed'
}, {
  id: 'a4',
  clientId: 'c4',
  clientName: 'Carlos Rodríguez',
  clientPhone: '1133445566',
  serviceId: 's1',
  providerId: 'p3',
  date: addDays(today, 2),
  startTime: '15:00',
  status: 'pending'
}, {
  id: 'a5',
  clientId: 'c1',
  clientName: 'Juan Pérez',
  clientPhone: '1122334455',
  serviceId: 's1',
  providerId: 'p1',
  date: subDays(today, 7),
  startTime: '09:30',
  status: 'confirmed'
}, {
  id: 'a6',
  clientId: 'c2',
  clientName: 'María García',
  clientPhone: '1155667788',
  serviceId: 's2',
  providerId: 'p2',
  date: subDays(today, 14),
  startTime: '11:00',
  status: 'confirmed'
}, {
  id: 'a7',
  clientId: 'c4',
  clientName: 'Carlos Rodríguez',
  clientPhone: '1133445566',
  serviceId: 's1',
  providerId: 'p3',
  date: subDays(today, 3),
  startTime: '15:00',
  status: 'no_show'
}, {
  id: 'a10',
  clientId: 'c3',
  clientName: 'Laura Martínez',
  clientPhone: '1198765432',
  serviceId: 's3',
  providerId: 'p1',
  date: subDays(today, 5),
  startTime: '10:00',
  status: 'cancelled'
}, {
  id: 'a9',
  clientId: 'c1',
  clientName: 'Juan Pérez',
  clientPhone: '1122334455',
  serviceId: 's1',
  providerId: 'p2',
  date: subDays(today, 21),
  startTime: '09:30',
  status: 'confirmed'
}, {
  id: 'a10',
  clientId: 'c2',
  clientName: 'María García',
  clientPhone: '1155667788',
  serviceId: 's1',
  providerId: 'p1',
  date: addDays(today, 3),
  startTime: '10:00',
  status: 'pending'
}, {
  id: 'a11',
  clientId: 'c5',
  clientName: 'Sofía Benítez',
  clientPhone: '1144556677',
  serviceId: 's2',
  providerId: 'p2',
  date: today,
  startTime: '14:30',
  status: 'confirmed'
}, {
  id: 'a12',
  clientId: 'c5',
  clientName: 'Sofía Benítez',
  clientPhone: '1144556677',
  serviceId: 's1',
  providerId: 'p3',
  date: addDays(today, 1),
  startTime: '11:00',
  status: 'confirmed'
}];
export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [{
  id: 'b1',
  date: addDays(today, 4),
  start: '12:00',
  end: '14:00',
  reason: 'Almuerzo extendido'
}];
export const INITIAL_MESSAGES: Message[] = [{
  id: 'm1',
  clientId: 'c2',
  clientName: 'María García',
  preview: 'Hola! Quería confirmar si mi turno del jueves sigue...',
  time: 'Hace 5 min',
  unread: true
}, {
  id: 'm2',
  clientId: 'c1',
  clientName: 'Juan Pérez',
  preview: '¿Tienen disponibilidad para el sábado a las 10?',
  time: 'Hace 1 h',
  unread: true
}, {
  id: 'm3',
  clientId: 'c4',
  clientName: 'Carlos Rodríguez',
  preview: 'Perdón por no haber avisado, se me complicó...',
  time: 'Hace 3 h',
  unread: false
}, {
  id: 'm4',
  clientId: 'c3',
  clientName: 'Laura Martínez',
  preview: 'Perfecto! Nos vemos mañana a las 9.',
  time: 'Ayer',
  unread: false
}, {
  id: 'm5',
  clientId: 'c5',
  clientName: 'Sofía Benítez',
  preview: '¿Puedo cambiar el turno de las 14:30 a las 15:00?',
  time: 'Ayer',
  unread: false
}];
export const T = {
  bg: '#f6f8fa',
  bg2: 'rgba(0,0,0,0.03)',
  card: 'rgba(246,248,250,0.55)',
  cardSolid: '#ffffff',
  orange: '#4472C4',
  orange2: '#6B9AD6',
  orange3: '#98BAE8',
  orangePale: 'rgba(68,114,196,0.07)',
  orangePale2: 'rgba(68,114,196,0.04)',
  orangeLight: 'rgba(68,114,196,0.10)',
  orangeMid: 'rgba(68,114,196,0.18)',
  dark: '#1B2D3B',
  dark2: '#12212E',
  text: '#243542',
  text2: '#5E7A8A',
  text3: '#8FA4AE',
  border: 'rgba(27,45,59,0.08)',
  borderO: 'rgba(68,114,196,0.22)',
  shadow: 'rgba(0,0,0,0.07) 0px 1px 2px, rgba(0,0,0,0.03) 0px -1px 1px inset, rgba(0,0,0,0.04) 0px 8px 24px',
  shadowMd: '0 4px 20px rgba(0,0,0,0.07)',
  shadowLg: '0 8px 48px rgba(0,0,0,0.08)',
  shadowO: '0 4px 16px rgba(27,45,59,0.18)',
  radius: '14px',
  radiusLg: '20px'
};

// ──────────────────────────────────────────────────────────
// Agent (Perla) status + activity — P5 Panel
// ──────────────────────────────────────────────────────────

export type AgentState = 'active' | 'paused';

export type AgentActivityType =
  | 'confirm'
  | 'schedule'
  | 'reschedule'
  | 'cancel'
  | 'reply';

export type AgentActivityItem = {
  id: string;
  type: AgentActivityType;
  label: string;     // e.g. "Confirmó turno de Sofía"
  timeAgo: string;   // e.g. "2h", "ayer", "hace 3h"
};

export const agentStatus: { state: AgentState; since: Date; subtitle: string } = {
  state: 'active',
  since: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26h ago
  subtitle: 'perla está respondiendo',
};

export const agentDailyStats = {
  turnos: 12,
  mensajes: 28,
  confirmRate: 94, // percent, integer
};

export const agentActivity: AgentActivityItem[] = [
  { id: 'a1', type: 'confirm',    label: 'Confirmó turno de Sofía',    timeAgo: '2h' },
  { id: 'a2', type: 'schedule',   label: 'Agendó a Matías (nuevo)',    timeAgo: '5h' },
  { id: 'a3', type: 'reply',      label: 'Respondió a 4 consultas',    timeAgo: '7h' },
  { id: 'a4', type: 'reschedule', label: 'Reagendó turno de Lucía',    timeAgo: 'ayer' },
];

// ──────────────────────────────────────────────────────────
// Clientes — Attention State (P4)
// ──────────────────────────────────────────────────────────

export type ClientAttentionState = 'activo' | 'en_riesgo' | 'inactivo';

/**
 * Determines the attention state of a client based on their appointment history.
 *
 * Rules:
 * - activo:    had a confirmed appointment in the last 30 days
 * - en_riesgo: last confirmed appointment is 31–60 days ago, OR had ≥1 no-show in last 60 days
 * - inactivo:  no appointments in the last 60 days, or never attended
 */
export function getClientAttentionState(
  clientId: string,
  appointments: Array<{ clientId: string; date: Date; status: string }>,
  now: Date = new Date()
): ClientAttentionState {
  const DAY_MS = 86_400_000;
  const daysSince = (d: Date) => Math.floor((now.getTime() - d.getTime()) / DAY_MS);

  const clientApps = appointments.filter((a) => a.clientId === clientId);
  if (clientApps.length === 0) return 'inactivo';

  const confirmedPast = clientApps
    .filter((a) => a.status === 'confirmed' && a.date <= now)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const noShowsRecent = clientApps.filter(
    (a) => a.status === 'no_show' && daysSince(a.date) <= 60
  );

  const lastConfirmed = confirmedPast[0];

  if (lastConfirmed) {
    const days = daysSince(lastConfirmed.date);
    if (days <= 30 && noShowsRecent.length === 0) return 'activo';
    if (days <= 60 || noShowsRecent.length >= 1) return 'en_riesgo';
    return 'inactivo';
  }

  // No confirmed history, but has appointments (e.g. only no-shows / cancellations)
  if (noShowsRecent.length >= 1) return 'en_riesgo';
  return 'inactivo';
}