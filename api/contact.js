import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'Email service not configured' })
  }

  if (!process.env.CONTACT_FROM_EMAIL || !process.env.CONTACT_TO_EMAIL) {
    return res.status(503).json({ error: 'Contact email addresses not configured' })
  }

  const { name, email, phone, service, message } = req.body || {}

  if (!name || !email || !phone || !service || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const nombre = escapeHtml(name)
  const correo = escapeHtml(email)
  const telefono = escapeHtml(phone)
  const servicio = escapeHtml(service)
  const mensaje = escapeHtml(message).replace(/\n/g, '<br>')

  try {
    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Nuevo contacto: ${name} - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #0D1B3D;">
          <h2 style="color: #B22234; margin-bottom: 24px;">Nuevo contacto desde el sitio web</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; width: 140px;">Nombre:</td>
              <td style="padding: 10px 0;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0;"><a href="mailto:${correo}">${correo}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px 0;"><a href="tel:${telefono}">${telefono}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold;">Servicio:</td>
              <td style="padding: 10px 0;">${servicio}</td>
            </tr>
          </table>
          <h3 style="margin-top: 28px; margin-bottom: 12px;">Mensaje:</h3>
          <p style="line-height: 1.6; background: #f5f5f0; padding: 16px; border-radius: 4px;">${mensaje}</p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
