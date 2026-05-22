'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

export default function DoctorOnboardingPage() {
  const { t } = useLang()
  const router = useRouter()
  const [specialty, setSpecialty] = useState('')
  const [qualification, setQualification] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState<string[]>(['en'])
  const [consultationFee, setConsultationFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleLanguage = (value: string) => {
    setLanguages((current) =>
      current.includes(value)
        ? current.filter((language) => language !== value)
        : [...current, value]
    )
  }

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

      const { error } = await supabase.from('doctors').upsert({
        id: user.id,
        specialty,
        qualification,
        experience_years: parseInt(experienceYears) || 0,
        bio,
        languages,
        consultation_fee: parseInt(consultationFee) || 0,
        is_active: false,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-6">
          <p className="mb-1 text-xs text-gray-500">Step 2 of 2</p>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 w-full rounded-full bg-green-600" />
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          {t('onboarding.doctor_title')}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="specialty"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('onboarding.specialty')}
            </label>
            <select
              id="specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              <option value="General Physician">General Physician</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="ENT Specialist">ENT Specialist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="Ophthalmologist">Ophthalmologist</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qualification"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('onboarding.qualification')}
            </label>
            <input
              id="qualification"
              type="text"
              placeholder="MBBS, MD..."
              value={qualification}
              onChange={(event) => setQualification(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="experienceYears"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('onboarding.experience')}
            </label>
            <input
              id="experienceYears"
              type="number"
              min="0"
              max="50"
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="consultationFee"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Consultation Fee (₹)
            </label>
            <input
              id="consultationFee"
              type="number"
              min="0"
              placeholder="e.g. 200"
              value={consultationFee}
              onChange={(event) => setConsultationFee(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2">
                <input
                  type="checkbox"
                  checked={languages.includes('en')}
                  onChange={() => toggleLanguage('en')}
                  className="h-4 w-4 accent-green-700"
                />
                <span className="text-sm text-gray-700">English</span>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2">
                <input
                  type="checkbox"
                  checked={languages.includes('hi')}
                  onChange={() => toggleLanguage('hi')}
                  className="h-4 w-4 accent-green-700"
                />
                <span className="text-sm text-gray-700">हिंदी</span>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2">
                <input
                  type="checkbox"
                  checked={languages.includes('mr')}
                  onChange={() => toggleLanguage('mr')}
                  className="h-4 w-4 accent-green-700"
                />
                <span className="text-sm text-gray-700">मराठी</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t('onboarding.bio')}
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push('/doctor')}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-600 transition hover:bg-gray-50"
            >
              {t('onboarding.skip')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('onboarding.continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
