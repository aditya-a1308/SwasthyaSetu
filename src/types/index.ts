export type Role = 'patient' | 'doctor' | 'admin'
export type Lang = 'en' | 'hi' | 'mr'
export type CallType = 'video' | 'audio'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type EmergencyStatus = 'pending' | 'dispatched' | 'resolved'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
  lang_pref: Lang
  avatar_url: string | null
  created_at: string
}

export interface Doctor {
  id: string
  specialty: string | null
  is_active: boolean
  bio: string | null
  qualification: string | null
  experience_years: number
  languages: string[]
  consultation_fee: number
  profiles?: Profile
}

export interface Patient {
  id: string
  date_of_birth: string | null
  blood_group: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_history: string | null
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  scheduled_at: string
  duration_minutes: number
  meet_link: string | null
  call_type: CallType
  status: AppointmentStatus
  symptoms: string | null
  notes: string | null
  is_emergency: boolean
  is_immediate: boolean
  created_at: string
  doctor?: Profile
  patient?: Profile
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface Consultation {
  id: string
  patient_id: string
  appointment_id: string | null
  messages: Message[]
  summary: string | null
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  content: string
  medicines: { name: string; dosage: string; duration: string }[]
  created_at: string
  doctor?: Profile
}

export interface EmergencyRequest {
  id: string
  patient_id: string
  location: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  status: EmergencyStatus
  created_at: string
}
