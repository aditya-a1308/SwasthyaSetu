import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function generateMeetLink(appointmentId: string): string {
  return `https://meet.jit.si/SwasthyaSetu-${appointmentId}`
}

async function getUser(req: NextRequest) {
  // Try Authorization header first (works over plain HTTP)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const admin = await createAdminClient()
    const { data: { user } } = await admin.auth.getUser(token)
    if (user) return user
  }
  // Fall back to cookie-based session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const body = await req.json()
    const { doctorId, scheduledAt, callType, symptoms, isEmergency } = body as {
      doctorId: string
      scheduledAt: string
      callType: 'video' | 'audio'
      symptoms?: string
      isEmergency?: boolean
    }

    if (!doctorId || !scheduledAt || !callType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify doctor exists and is active
    const { data: doctor } = await supabase
      .from('doctors')
      .select('is_active')
      .eq('id', doctorId)
      .single()

    if (!doctor?.is_active && !isEmergency) {
      return NextResponse.json({ error: 'Doctor is not currently available' }, { status: 400 })
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        scheduled_at: scheduledAt,
        call_type: callType,
        meet_link: null,
        symptoms: symptoms ?? null,
        is_emergency: isEmergency ?? false,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For video calls, generate a Jitsi room using the appointment ID
    if (callType === 'video') {
      const meetLink = generateMeetLink(appointment.id)
      await supabase
        .from('appointments')
        .update({ meet_link: meetLink })
        .eq('id', appointment.id)
      appointment.meet_link = meetLink
    }

    return NextResponse.json({ appointment, meetLink: appointment.meet_link })
  } catch (err) {
    console.error('Appointments API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('appointments')
      .select('*, doctor:profiles!appointments_doctor_id_fkey(full_name, phone), patient:profiles!appointments_patient_id_fkey(full_name, phone)')
      .order('scheduled_at', { ascending: true })

    if (profile?.role === 'patient') {
      query = query.eq('patient_id', user.id)
    } else if (profile?.role === 'doctor') {
      query = query.eq('doctor_id', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ appointments: data })
  } catch (err) {
    console.error('Appointments GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
