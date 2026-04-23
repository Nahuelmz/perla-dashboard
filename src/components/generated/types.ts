export type TimeRange = {
  id: string;
  start: string;
  end: string;
};
export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  availability: Record<number, TimeRange[]>;
};
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show';
export type Provider = {
  id: string;
  name: string;
  role: 'owner' | 'staff';
  color: string;
  initials: string;
  active: boolean;
};
export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  providerId: string;
  date: Date;
  startTime: string;
  status: AppointmentStatus;
  notes?: string;
};
export type Client = {
  id: string;
  name: string;
  phone: string;
  notes: string;
  tags: string[];
  birthday: string;
};
export type BlockedSlot = {
  id: string;
  date: Date;
  start: string;
  end: string;
  reason: string;
};
export type NavTab = 'home' | 'agenda' | 'clients' | 'messages' | 'config';
export type Message = {
  id: string;
  clientId: string;
  clientName: string;
  preview: string;
  time: string;
  unread: boolean;
};
export type UserProfile = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  sex: string;
};