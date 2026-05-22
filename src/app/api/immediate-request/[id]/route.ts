import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const admin = await createAdminClient()
    const { data: { user } } = await admin.auth.getUser(token)
    if (user) return user
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

function jitsiLink(id: string) {
  return `https://meet.jit.si/SwasthyaSetu-${id}`
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { action } = await req.json() as { action: 'accept' | 'reject' }
    const supabase = await createAdminClient()

    if (action === 'accept') {
      const meetLink = jitsiLink(id)

      // Atomic: only succeeds if still unclaimed
      const { data, error } = await supabase
        .from('appointments')
        .update({ doctor_id: user.id, status: 'confirmed', meet_link: meetLink })
        .eq('id', id)
        .is('doctor_id', null)
        .eq('status', 'pending')
        .select()
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Already accepted by another doctor' }, { status: 409 })
      }

      return NextResponse.json({ appointment: data })
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('appointment_rejections')
        .insert({ appointment_id: id, doctor_id: user.id })

      if (error && error.code !== '23505') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Immediate request action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
