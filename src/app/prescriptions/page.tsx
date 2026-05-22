'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/LangContext'

interface Prescription {
  id: string
  content: string
  created_at: string
  medicines: { name: string; dosage: string; duration: string }[]
  doctor: { full_name: string | null } | null
}

export default function PrescriptionsPage() {
  const { t } = useLang()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/prescriptions')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setPrescriptions(data.prescriptions ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={() => router.back()} className="mb-6 block text-sm font-medium text-green-700">
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard.patient.my_prescriptions')}</h1>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
            <div className="text-5xl text-gray-300 mb-3">📋</div>
            <p className="text-gray-500">No prescriptions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map(rx => (
              <div key={rx.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Dr. {rx.doctor?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(rx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Prescribed</span>
                </div>

                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3">{rx.content}</p>

                {rx.medicines && rx.medicines.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medicines</p>
                    <div className="space-y-1">
                      {rx.medicines.map((med, i) => (
                        <div key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="font-medium">{med.name}</span>
                          {med.dosage && <span className="text-gray-500">· {med.dosage}</span>}
                          {med.duration && <span className="text-gray-500">· {med.duration}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
