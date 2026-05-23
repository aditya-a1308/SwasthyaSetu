'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

export default function LoginPage() {
  const { t } = useLang()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      const role = signInData.user?.user_metadata?.role
      const destination = role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient'
      router.push(destination)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 md:grid md:grid-cols-2">
      <aside className="hidden flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-center text-white md:flex">
        <div className="mb-6 text-6xl">🩺</div>
        <div className="text-3xl font-bold">{t('app_name')}</div>
        <p className="mt-3 text-lg text-emerald-100">{t('tagline')}</p>
        <div className="mt-8 flex flex-col gap-2">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm">{t('auth.aside_benefit1')}</span>
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm">{t('auth.aside_benefit2')}</span>
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm">{t('auth.aside_benefit3')}</span>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 md:px-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">🩺</div>
            <h1 className="text-2xl font-bold text-slate-800">{t('auth.login_title')}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {t('auth.login_subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.login_btn')}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-300">──── {t('common.or')} ────</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            {t('auth.no_account')}{' '}
            <Link href="/signup" className="font-semibold text-emerald-600">
              {t('nav.signup')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
