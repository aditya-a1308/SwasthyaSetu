'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'
import type { Profile, Appointment } from '@/types'

type ImmediateRequest = {
  id: string
  scheduled_at: string
  call_type: 'video' | 'audio'
  symptoms: string | null
  patient: { full_name: string | null; phone: string | null } | null
}

export default function DoctorDashboardPage() {
  const { t } = useLang()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [immediateRequests, setImmediateRequests] = useState<ImmediateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const sessionRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchImmediateRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/immediate-request', {
        headers: sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setImmediateRequests(data.requests ?? [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadDashboard = async () => {
      try {
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user) { router.push('/login'); return }

        const metaRole = user.user_metadata?.role
        if (metaRole && metaRole !== 'doctor') { router.push(`/${metaRole}`); return }

        // Store session token for API calls
        const { data: { session } } = await supabase.auth.getSession()
        sessionRef.current = session?.access_token ?? null

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()

        const resolvedProfile = profileData ?? {
          id: user.id,
          role: user.user_metadata?.role ?? 'doctor',
          full_name: user.user_metadata?.full_name ?? user.email ?? '',
          phone: null, lang_pref: 'en', avatar_url: null, created_at: '',
        }

        const { data: doctorData } = await supabase
          .from('doctors').select('is_active').eq('id', user.id).single()

        const { data: apptData } = await supabase
          .from('appointments')
          .select('*, patient:profiles!appointments_patient_id_fkey(full_name, phone)')
          .eq('doctor_id', user.id)
          .in('status', ['pending', 'confirmed'])
          .order('scheduled_at', { ascending: true })
          .limit(10)

        if (!isMounted) return
        setProfile(resolvedProfile as Profile)
        setIsActive(doctorData?.is_active ?? false)
        setAppointments(apptData ?? [])
      } catch (e) {
        console.error('Doctor dashboard error:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard().then(() => {
      if (!isMounted) return
      fetchImmediateRequests()
      pollRef.current = setInterval(fetchImmediateRequests, 12000)
    })

    return () => {
      isMounted = false
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [router, fetchImmediateRequests])

  const handleToggleStatus = async () => {
    if (!profile) return
    setTogglingStatus(true)
    try {
      const supabase = createClient()
      await supabase.from('doctors').update({ is_active: !isActive }).eq('id', profile.id)
      setIsActive(!isActive)
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId)
    try {
      const res = await fetch(`/api/immediate-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}),
        },
        body: JSON.stringify({ action: 'accept' }),
      })
      if (res.ok) {
        const data = await res.json()
        setImmediateRequests(prev => prev.filter(r => r.id !== requestId))
        if (data.appointment?.meet_link) {
          window.open(data.appointment.meet_link, '_blank')
        }
        // Refresh appointments list
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: apptData } = await supabase
            .from('appointments')
            .select('*, patient:profiles!appointments_patient_id_fkey(full_name, phone)')
            .eq('doctor_id', user.id)
            .in('status', ['pending', 'confirmed'])
            .order('scheduled_at', { ascending: true })
            .limit(10)
          setAppointments(apptData ?? [])
        }
      } else {
        alert('This request was already accepted by another doctor.')
        fetchImmediateRequests()
      }
    } finally {
      setAcceptingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setRejectingId(requestId)
    try {
      await fetch(`/api/immediate-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}),
        },
        body: JSON.stringify({ action: 'reject' }),
      })
      setImmediateRequests(prev => prev.filter(r => r.id !== requestId))
    } finally {
      setRejectingId(null)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const today = new Date()
  const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === today.toDateString())

  const getStatusClasses = (status: Appointment['status']) => {
    if (status === 'confirmed') return 'bg-emerald-100 text-emerald-700'
    if (status === 'pending') return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-600'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">🩺</span>
            <span className="hidden sm:block">SwasthyaSetu</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">Dr. {profile?.full_name ?? ''}</p>
              <p className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isActive ? '● Online' : '○ Offline'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className={[
                'rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-50',
                isActive
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              ].join(' ')}
            >
              {togglingStatus ? '...' : isActive ? 'Go Offline' : 'Go Active'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* ── STATS ── */}
        <section className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-slate-800">{todayAppts.length}</div>
            <p className="mt-1 text-xs text-slate-500">Today</p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-slate-800">{appointments.length}</div>
            <p className="mt-1 text-xs text-slate-500">Upcoming</p>
          </div>
          <div className={`rounded-2xl p-5 text-center shadow-sm ${isActive ? 'bg-emerald-50' : 'bg-slate-100'}`}>
            <div className={`text-3xl font-extrabold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isActive ? 'ON' : 'OFF'}
            </div>
            <p className="mt-1 text-xs text-slate-500">Status</p>
          </div>
        </section>

        {/* ── IMMEDIATE REQUESTS ── */}
        {isActive && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <h2 className="text-base font-bold text-slate-800">Instant Call Requests</h2>
              {immediateRequests.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {immediateRequests.length}
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">Refreshes every 12s</span>
            </div>

            {immediateRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                <p className="text-sm text-slate-400">No instant requests right now. You'll see them here as they come in.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {immediateRequests.map((req) => (
                  <div key={req.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-orange-800">
                            {req.patient?.full_name?.charAt(0) ?? 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{req.patient?.full_name ?? 'Patient'}</p>
                            {req.patient?.phone && (
                              <p className="text-xs text-slate-500">📞 {req.patient.phone}</p>
                            )}
                          </div>
                          <span className="ml-2 rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800">
                            {req.call_type === 'video' ? '📹 Video' : '📞 Audio'}
                          </span>
                        </div>
                        {req.symptoms && (
                          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
                            <span className="text-xs font-medium text-slate-400 uppercase mr-1">Symptoms:</span>
                            {req.symptoms}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-slate-400">
                          Requested {new Date(req.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccept(req.id)}
                          disabled={acceptingId === req.id}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {acceptingId === req.id ? '...' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.id)}
                          disabled={rejectingId === req.id}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {rejectingId === req.id ? '...' : 'Skip'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── UPCOMING APPOINTMENTS ── */}
        <section>
          <h2 className="mb-4 text-base font-bold text-slate-800">{t('dashboard.doctor.upcoming')}</h2>

          {appointments.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-2xl">📅</div>
              <p className="font-medium text-slate-700">{t('dashboard.doctor.no_appointments')}</p>
              <p className="mt-1 text-sm text-slate-400">
                {isActive ? 'Patients can book you now.' : 'Go active so patients can book you.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <article key={appt.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {appt.patient?.full_name?.charAt(0) ?? 'P'}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{appt.patient?.full_name ?? 'Patient'}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(appt.status)}`}>
                          {appt.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {appt.call_type === 'video' ? '📹 Video' : '📞 Audio'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(appt.scheduled_at).toLocaleString('en-IN', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {appt.patient?.phone && (
                        <p className="mt-0.5 text-xs text-slate-400">📞 {appt.patient.phone}</p>
                      )}
                      {appt.symptoms && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                          {appt.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {appt.status === 'confirmed' && appt.meet_link && (
                      <a
                        href={appt.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        📹 Join Call
                      </a>
                    )}
                    <Link
                      href={`/prescription/${appt.id}`}
                      className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                    >
                      📋 Write Prescription
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
