import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithTriage } from '@/lib/groq/client'
import type { Message } from '@/lib/groq/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, consultationId } = body as {
      messages: Message[]
      consultationId?: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Build patient context from profile + medical history + past prescriptions
    const [profileResult, patientResult, prescriptionsResult] = await Promise.all([
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
      supabase.from('patients').select('medical_history, blood_group, date_of_birth').eq('id', user.id).single(),
      supabase.from('prescriptions').select('content, created_at').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(3),
    ])

    let patientContext = ''
    if (profileResult.data) {
      patientContext += `Patient Name: ${profileResult.data.full_name}\n`
    }
    if (patientResult.data) {
      const p = patientResult.data
      if (p.date_of_birth) patientContext += `Date of Birth: ${p.date_of_birth}\n`
      if (p.blood_group) patientContext += `Blood Group: ${p.blood_group}\n`
      if (p.medical_history) patientContext += `Known Medical History: ${p.medical_history}\n`
    }
    if (prescriptionsResult.data && prescriptionsResult.data.length > 0) {
      patientContext += `\nRecent Prescriptions:\n`
      for (const rx of prescriptionsResult.data) {
        patientContext += `- [${new Date(rx.created_at).toLocaleDateString()}]: ${rx.content}\n`
      }
    }

    const reply = await chatWithTriage(messages, patientContext || undefined)

    // Save/update consultation record
    const allMessages = [...messages, { role: 'assistant' as const, content: reply, timestamp: new Date().toISOString() }]

    if (consultationId) {
      await supabase.from('consultations').update({
        messages: allMessages,
        updated_at: new Date().toISOString(),
      }).eq('id', consultationId)
    } else {
      const { data: newConsult } = await supabase.from('consultations').insert({
        patient_id: user.id,
        messages: allMessages,
      }).select('id').single()

      return NextResponse.json({ reply, consultationId: newConsult?.id })
    }

    return NextResponse.json({ reply, consultationId })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
