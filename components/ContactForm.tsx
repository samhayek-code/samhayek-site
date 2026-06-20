'use client'

import { useState } from 'react'
import { RiCheckLine } from '@remixicon/react'

const TOPICS = ['Design', 'Music', 'Other'] as const

const labelClass = 'font-mono font-medium text-[11px] text-muted uppercase tracking-wide'

const fieldStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
}

const fieldClass =
  'w-full px-4 py-3 font-sans text-[16px] rounded-input placeholder:text-subtle focus:outline-none transition-all'

function Field({
  id,
  label,
  optional,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <span className="text-subtle normal-case"> (optional)</span>}
      </label>
      {children}
    </div>
  )
}

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  const toggleTopic = (topic: string) =>
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent-primary)'
    e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-primary-muted)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.boxShadow = 'none'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setError(null)
    setStatus('sending')

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, topics, message }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('idle')
        return
      }

      setStatus('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="flex flex-col items-center text-center px-6 py-12 space-y-4 rounded-card"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-12 h-12 rounded-full shadow-card flex items-center justify-center"
          style={{ background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)' }}
        >
          <RiCheckLine size={24} />
        </div>
        <p className="font-sans text-[18px] text-foreground">Message sent</p>
        <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-secondary)' }}>
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Field id="cf-name" label="Name">
          <input
            id="cf-name"
            type="text"
            required
            disabled={sending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Your name"
            className={fieldClass}
            style={fieldStyle}
          />
        </Field>
        <Field id="cf-email" label="Email">
          <input
            id="cf-email"
            type="email"
            required
            disabled={sending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="you@example.com"
            className={fieldClass}
            style={fieldStyle}
          />
        </Field>
      </div>

      {/* Phone + Company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Field id="cf-phone" label="Phone" optional>
          <input
            id="cf-phone"
            type="tel"
            disabled={sending}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="+1 (555) 000-0000"
            className={fieldClass}
            style={fieldStyle}
          />
        </Field>
        <Field id="cf-company" label="Company" optional>
          <input
            id="cf-company"
            type="text"
            disabled={sending}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Company or project"
            className={fieldClass}
            style={fieldStyle}
          />
        </Field>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <span className={labelClass}>What&apos;s this about?</span>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const active = topics.includes(topic)
            return (
              <button
                key={topic}
                type="button"
                disabled={sending}
                onClick={() => toggleTopic(topic)}
                aria-pressed={active}
                className="px-4 py-2 font-mono text-[12px] font-medium uppercase tracking-wide rounded-chip press transition-all"
                style={{
                  background: active ? 'var(--accent-primary)' : 'var(--cta-bg)',
                  border: '1px solid',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border)',
                  color: active ? '#ffffff' : 'var(--cta-text)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'var(--border-hover)'
                    e.currentTarget.style.color = 'var(--foreground)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--cta-text)'
                  }
                }}
              >
                {topic}
              </button>
            )
          })}
        </div>
      </div>

      {/* Message */}
      <Field id="cf-message" label="Message">
        <textarea
          id="cf-message"
          required
          disabled={sending}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Tell me what you have in mind…"
          className={`${fieldClass} resize-none`}
          style={fieldStyle}
        />
      </Field>

      {/* Error banner */}
      {error && (
        <div
          className="px-4 py-3 font-sans text-[14px] rounded-input"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={sending}
        className="w-full px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-wider rounded-btn press shadow-card transition-all disabled:cursor-not-allowed"
        style={{
          background: sending ? 'var(--cta-bg)' : 'var(--accent-primary)',
          border: '1px solid',
          borderColor: sending ? 'var(--border)' : 'var(--accent-primary)',
          color: sending ? 'var(--cta-text)' : '#ffffff',
          opacity: sending ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!sending) e.currentTarget.style.opacity = '0.85'
        }}
        onMouseLeave={(e) => {
          if (!sending) e.currentTarget.style.opacity = '1'
        }}
      >
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
