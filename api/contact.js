import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'imperialremodelingevr@gmail.com'
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Imperial Remodeling EVR <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'Email service not configured' })
  }

  const { name, email, phone, service, message } = req.body || {}

  if (!name || !email || !phone || !service || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New lead: ${service} — ${name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
