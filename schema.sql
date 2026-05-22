-- Drop existing tables if any
DROP TABLE IF EXISTS emergency_requests CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name TEXT,
  phone TEXT,
  lang_pref TEXT DEFAULT 'en' CHECK (lang_pref IN ('en', 'hi', 'mr')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors (extra doctor-specific info)
CREATE TABLE doctors (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  specialty TEXT,
  is_active BOOLEAN DEFAULT false,
  bio TEXT,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['en'],
  consultation_fee INTEGER DEFAULT 0
);

-- Patients (extra patient-specific info)
CREATE TABLE patients (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  blood_group TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT
);

-- Appointments
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  meet_link TEXT,
  call_type TEXT DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  symptoms TEXT,
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Consultations (chat history with Groq)
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  patient_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  medicines JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Requests (ambulance booking)
CREATE TABLE emergency_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Doctors: anyone can read active doctors; doctors can update own record
CREATE POLICY "Anyone can view active doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own record" ON doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert own record" ON doctors FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients: patients can read/update own; doctors can read
CREATE POLICY "Patients can view own data" ON patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can update own data" ON patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patients can insert own data" ON patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Doctors can view patient data" ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);

-- Appointments: patient or doctor of that appointment can view
CREATE POLICY "View own appointments" ON appointments FOR SELECT USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctor or patient can update appointment" ON appointments FOR UPDATE USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Consultations: own patient or admin
CREATE POLICY "View own consultations" ON consultations FOR SELECT USING (
  auth.uid() = patient_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);
CREATE POLICY "Patients can create consultations" ON consultations FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Update own consultations" ON consultations FOR UPDATE USING (auth.uid() = patient_id);

-- Prescriptions: patient or doctor involved
CREATE POLICY "View own prescriptions" ON prescriptions FOR SELECT USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Doctors can create prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- Emergency: own patient or admin
CREATE POLICY "View own emergency requests" ON emergency_requests FOR SELECT USING (
  auth.uid() = patient_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Patients can create emergency requests" ON emergency_requests FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Admins can update emergency requests" ON emergency_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
