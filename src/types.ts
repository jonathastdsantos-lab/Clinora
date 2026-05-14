export interface UserProfile {
  uid: string;
  email: string;
  clinicId: string;
  companyCode: string;
  role: 'admin' | 'professional' | 'receptionist' | 'super-admin';
  isSuperAdmin?: boolean;
  name?: string;
}

export interface Clinic {
  id: string;
  name: string;
  companyCode: string;
  ownerId: string;
  specialty: 'dentist' | 'medical' | 'aesthetic' | 'general';
  createdAt: any;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  createdAt: any;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  professionalId: string;
  professionalName?: string;
  startTime: any;
  endTime: any;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  procedure: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  professionalId: string;
  content: string;
  type: 'consultation' | 'evolution' | 'exam' | 'protocol';
  createdAt: any;
  assets?: string[];
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: any;
  status: 'pending' | 'received' | 'cancelled';
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  specialty: string;
  registration: string;
  email: string;
}
