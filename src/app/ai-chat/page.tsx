'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LangContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AiChatPage() {
  const { t } = useLang()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | undefined>()
  const [authChecked, setAuthChecked] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, consultationId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: t('common.error') }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (data.consultationId) setConsultationId(data.consultationId)

      // Show booking CTA if AI mentions booking or urgency keywords
      const replyLower = data.reply.toLowerCase()
      if (replyLower.includes('book') || replyLower.includes('doctor') || replyLower.includes('urgent') || replyLower.includes('consult')) {
        setShowBooking(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-4 py-4">
          <button type="button" onClick={() => router.back()} className="text-sm text-green-700 font-medium">
            ← Back
          </button>
          <div>
            <h1 className="font-bold text-gray-800">{t('ai_chat.title')}</h1>
            <p className="text-xs text-gray-500">{t('ai_chat.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-green-50 border border-green-100 p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-green-800 font-medium">{t('ai_chat.subtitle')}</p>
              <p className="text-sm text-green-600 mt-2">I will help you understand your symptoms and guide you to the right care.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mr-2 mt-1 text-xl flex-shrink-0">🤖</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-700 text-white rounded-br-sm'
                  : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 text-xl">🤖</div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Book Doctor CTA */}
      {showBooking && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-3">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
            <p className="text-sm text-green-800 font-medium">{t('ai_chat.book_doctor')}</p>
            <Link
              href="/book-appointment"
              className="flex-shrink-0 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {t('dashboard.patient.book_consultation')}
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-2xl flex gap-3 items-end">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai_chat.placeholder')}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('ai_chat.send')}
          </button>
        </div>
        <p className="mx-auto max-w-2xl mt-2 text-xs text-gray-400 text-center">
          Press Enter to send · This is an AI assistant, not a real doctor
        </p>
      </div>
    </div>
  )
}
