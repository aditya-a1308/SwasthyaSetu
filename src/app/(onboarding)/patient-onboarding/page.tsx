'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

export default function PatientOnboardingPage() {
  const { t } = useLang()
  const router = useRouter()
  const [dob, setDob] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('patients').upsert({
        id: user.id,
        date_of_birth: dob || null,
        blood_group: bloodGroup || null,
        address,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        medical_history: medicalHistory,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">
              🩺
            </span>
            <span className="text-lg font-bold text-emerald-700">
              {t('app_name')}
            </span>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{t('onboarding.step_label')}</span>
              <span className="text-emerald-600">{t('onboarding.step_complete')}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 p-0.5">
              <div className="h-2.5 w-full rounded-full bg-emerald-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            {t('onboarding.patient_title')}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t('onboarding.patient_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="dob"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.dob')}
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="bloodGroup"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.blood_group')}
            </label>
            <select
              id="bloodGroup"
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{t('onboarding.blood_select')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.address')}
            </label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContactName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.emergency_contact')}
            </label>
            <input
              id="emergencyContactName"
              type="text"
              value={emergencyContactName}
              onChange={(event) => setEmergencyContactName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContactPhone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.emergency_phone')}
            </label>
            <input
              id="emergencyContactPhone"
              type="tel"
              value={emergencyContactPhone}
              onChange={(event) => setEmergencyContactPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="medicalHistory"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t('onboarding.medical_history')}
            </label>
            <textarea
              id="medicalHistory"
              rows={3}
              placeholder={t('onboarding.medical_placeholder')}
              value={medicalHistory}
              onChange={(event) => setMedicalHistory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push('/patient')}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              {t('onboarding.skip')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('onboarding.continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
