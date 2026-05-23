'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

interface Medicine {
  name: string
  dosage: string
  duration: string
}

interface AppointmentInfo {
  id: string
  patient_id: string
  symptoms: string | null
  patient: { full_name: string | null } | null
}

export default function PrescriptionPage() {
  const { t } = useLang()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [content, setContent] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', duration: '' }])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'doctor') { router.push('/doctor'); return }

      const { data: appt } = await supabase
        .from('appointments')
        .select('id, patient_id, symptoms, patient:profiles!appointments_patient_id_fkey(full_name)')
        .eq('id', appointmentId)
        .single()

      setAppointment(appt as unknown as AppointmentInfo)
      setLoading(false)
    }
    load()
  }, [appointmentId, router])

  const addMedicine = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', duration: '' }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    setMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) { setError(t('prescription.notes_error')); return }
    if (!appointment) return

    setSubmitting(true)
    setError('')

    const validMedicines = medicines.filter(m => m.name.trim())

    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        content,
        medicines: validMedicines,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? t('prescription.save_error'))
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/doctor'), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <div className="text-6xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold text-green-700">{t('prescription.saved_title')}</h1>
          <p className="mt-2 text-gray-500">{t('prescription.saved_subtitle')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={() => router.back()} className="mb-6 block text-sm font-medium text-green-700">
          {t('prescription.back')}
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.doctor.write_prescription')}</h1>

        {appointment && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-green-800">
              <span className="font-semibold">{t('prescription.patient_label')}</span> {appointment.patient?.full_name ?? 'Unknown'}
            </p>
            {appointment.symptoms && (
              <p className="text-sm text-green-700 mt-1">
                <span className="font-semibold">{t('prescription.symptoms_label')}</span> {appointment.symptoms}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prescription Notes */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-800 mb-2">
              {t('prescription.notes_label')}
            </label>
            <textarea
              id="content"
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t('prescription.notes_placeholder')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Medicines */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">{t('prescription.medicines_title')}</h2>
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={med.name}
                      onChange={e => updateMedicine(i, 'name', e.target.value)}
                      placeholder={t('prescription.medicine_name')}
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                      placeholder={t('prescription.medicine_dosage')}
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={med.duration}
                      onChange={e => updateMedicine(i, 'duration', e.target.value)}
                      placeholder={t('prescription.medicine_duration')}
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-600 text-lg mt-1">×</button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMedicine}
              className="mt-3 text-sm text-green-700 font-medium hover:underline"
            >
              {t('prescription.add_medicine')}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('common.loading') : t('prescription.save_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
