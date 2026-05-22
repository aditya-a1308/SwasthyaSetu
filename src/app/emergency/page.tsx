'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

export default function EmergencyPage() {
  const { t } = useLang()
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dispatched, setDispatched] = useState(false)
  const [error, setError] = useState('')

  const handleEmergency = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('emergency_requests').insert({
        patient_id: user.id,
        location,
        description,
        status: 'pending',
      })

      if (error) {
        setError(error.message)
        return
      }

      setDispatched(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (dispatched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-4 text-6xl">🚑</div>
          <h1 className="text-xl font-bold text-green-700">
            {t('emergency.dispatched')}
          </h1>
          <p className="mt-2 text-gray-600">Stay calm. Help is on the way.</p>
          <p className="mt-4 font-semibold text-red-600">Emergency number: 108</p>
          <button
            type="button"
            onClick={() => router.push('/patient')}
            className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 block text-sm font-medium text-gray-600"
        >
          ← Back
        </button>

        <div className="mb-4 text-center text-6xl">🚑</div>
        <h1 className="text-center text-2xl font-bold text-red-700">
          {t('emergency.title')}
        </h1>
        <p className="mt-1 mb-8 text-center text-gray-600">
          {t('emergency.subtitle')}
        </p>

        <a
          href="tel:108"
          className="mb-6 block rounded-2xl bg-red-600 p-4 text-center text-white shadow-sm transition hover:bg-red-700"
        >
          <p className="text-sm opacity-90">
            For immediate life-threatening emergencies:
          </p>
          <p className="text-3xl font-bold">📞 108</p>
          <p className="text-sm opacity-80">National Ambulance Service</p>
        </a>

        <form onSubmit={handleEmergency} className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">
            Or request ambulance here:
          </h2>

          <div className="mb-4">
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('emergency.location')}
            </label>
            <input
              id="location"
              type="text"
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('emergency.describe')}
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error ? (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? t('emergency.calling') : t('emergency.call_ambulance')}
          </button>
        </form>
      </div>
    </div>
  )
}
