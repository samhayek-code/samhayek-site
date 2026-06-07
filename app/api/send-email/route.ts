import { Resend } from 'resend'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// From + to both use yo@samhayek.com (the from address only needs the domain verified in
// Resend — it isn't a real-mailbox requirement; replies route to the sender via replyTo).
// Overridable via env, but with samhayek.com verified the only required var is RESEND_API_KEY.
const FROM = process.env.RESEND_FROM ?? 'Sam Hayek <yo@samhayek.com>'
const TO = process.env.CONTACT_TO_EMAIL ?? 'yo@samhayek.com'

interface ContactPayload {
  name?: string
  email?: string
  phone?: string
  company?: string
  topics?: string[]
  message?: string
}

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return Response.json({ error: 'Email service is not configured.' }, { status: 500 })
  }

  let body: ContactPayload
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = clean(body.name, 200)
  const email = clean(body.email, 320)
  const phone = clean(body.phone, 50)
  const company = clean(body.company, 200)
  const message = clean(body.message, 5000)
  const topics = Array.isArray(body.topics)
    ? body.topics.filter((t): t is string => typeof t === 'string').slice(0, 10)
    : []

  if (!name || !email || !message) {
    return Response.json(
      { error: 'Name, email, and message are required.' },
      { status: 400 }
    )
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Company', company || '—'],
    ['About', topics.length ? topics.join(', ') : '—'],
  ]

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111113; max-width: 560px;">
      <h2 style="font-size: 18px; margin: 0 0 16px;">New message from ${escapeHtml(name)}</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 6px 12px 6px 0; color: #8A8A8F; vertical-align: top; white-space: nowrap;">${label}</td>
            <td style="padding: 6px 0;">${escapeHtml(value)}</td>
          </tr>`
          )
          .join('')}
      </table>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E0E0E3;">
        <div style="color: #8A8A8F; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Message</div>
        <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</div>
      </div>
    </div>`

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    message,
  ].join('\n')

  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New message from ${name}${topics.length ? ` — ${topics.join(', ')}` : ''}`,
      html,
      text,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Send failed:', err)
    return Response.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}
