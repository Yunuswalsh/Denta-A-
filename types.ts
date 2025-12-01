
export enum UrgencyLevel {
  LOW = 'Düşük',
  MEDIUM = 'Orta',
  HIGH = 'Yüksek',
  EMERGENCY = 'Acil'
}

export interface Review {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  availableDays: number[]; // 0=Sunday, 1=Monday...
  reviews?: Review[];
  averageRating?: number;
}

export interface Service {
  id: string;
  name: string;
  priceRange: string;
  duration: string;
  description: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  patientTC: string; // New: National ID
  patientAge: number; // New: Age
  medicalHistory: string; // New: Medical History
  visitReason: string; // New: Why are they coming?
  date: string; // ISO Date string
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
}

export interface AIAnalysisLog {
  id: string;
  userComplaint: string;
  aiResponse: string;
  urgency: UrgencyLevel;
  timestamp: number;
  hasImage: boolean;
  imageBase64?: string; // Store small thumbnail or ref
  doctorComment?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
}
