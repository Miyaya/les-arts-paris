import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, name } = req.body ?? {}

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  // Basic length guard
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long' })
  }

  const fromName = name?.trim() || null
  const subject  = fromName
    ? `[Les Arts Paris] Retour — ${fromName}`
    : '[Les Arts Paris] Retour anonyme'

  try {
    await resend.emails.send({
      from: 'Les Arts Paris <onboarding@resend.dev>',
      to: ['miya850604@gmail.com'],
      subject,
      html: `
        <div style="font-family:monospace;max-width:520px;color:#0C1B2E">
          <h2 style="border-bottom:2px solid #6B1A2A;padding-bottom:8px">
            Retour utilisateur · Les Arts Paris
          </h2>
          <p style="margin:12px 0;color:#6A85A0">
            ${fromName ? `<strong>${fromName}</strong>` : '<em>Anonyme</em>'}
          </p>
          <p style="white-space:pre-wrap;line-height:1.7">${message.trim()}</p>
        </div>
      `,
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[feedback] Resend error:', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
