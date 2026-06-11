import fs from 'fs'
import path from 'path'
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

function buildEmailLogoHtml(logoBase64) {
  return logoBase64
    ? `<img src="${logoBase64}" height="70" style="display:block; margin: 0 auto;" />`
    : `<span style="font-family: Arial; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px;">IMPERIAL REMODELING EVR</span>`
}

function buildConfirmationEmail({ nombre, servicio, mensaje, lang, logoHtml }) {
  if (lang === 'es') {
    return {
      subject: 'Recibimos tu mensaje — Imperial Remodeling EVR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #0D1B3D;">
          <div style="background: #B22234; padding: 20px; text-align: center;">
            ${logoHtml}
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0D1B3D;">Hola ${nombre},</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Gracias por contactar a <strong>Imperial Remodeling EVR</strong>.
              Hemos recibido tu mensaje y nuestro equipo se pondrá en contacto
              contigo dentro de las próximas <strong>24 horas</strong>.
            </p>
            <div style="background: #f5f5f0; border-left: 4px solid #B22234; padding: 16px; margin: 24px 0;">
              <p style="margin: 0;"><strong>Servicio solicitado:</strong> ${servicio}</p>
              <p style="margin: 8px 0 0;"><strong>Tu mensaje:</strong> ${mensaje}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">
              Si tienes alguna pregunta urgente, no dudes en llamarnos directamente:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="tel:2145171951" style="background: #B22234; color: white;
                 padding: 14px 32px; text-decoration: none; font-size: 18px;
                 font-weight: bold; border-radius: 4px;">
                📞 214-517-1951
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Compromiso · Honestidad · Transparencia · Rapidez
            </p>
          </div>
          <div style="background: #0D1B3D; padding: 16px; text-align: center; color: #C8A951; font-size: 12px;">
            Imperial Remodeling, LLC · Dallas / Fort Worth, TX · imperialremodelingevr.com
          </div>
        </div>
      `,
    }
  }

  return {
    subject: 'We received your message — Imperial Remodeling EVR',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #0D1B3D;">
        <div style="background: #B22234; padding: 20px; text-align: center;">
          ${logoHtml}
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #0D1B3D;">Hi ${nombre},</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for contacting <strong>Imperial Remodeling EVR</strong>.
            We have received your message and our team will get in touch
            with you within the next <strong>24 hours</strong>.
          </p>
          <div style="background: #f5f5f0; border-left: 4px solid #B22234; padding: 16px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Service requested:</strong> ${servicio}</p>
            <p style="margin: 8px 0 0;"><strong>Your message:</strong> ${mensaje}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6;">
            If you have any urgent questions, feel free to call us directly:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="tel:2145171951" style="background: #B22234; color: white;
               padding: 14px 32px; text-decoration: none; font-size: 18px;
               font-weight: bold; border-radius: 4px;">
              📞 214-517-1951
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Commitment · Honesty · Transparency · Speed
          </p>
        </div>
        <div style="background: #0D1B3D; padding: 16px; text-align: center; color: #C8A951; font-size: 12px;">
          Imperial Remodeling, LLC · Dallas / Fort Worth, TX · imperialremodelingevr.com
        </div>
      </div>
    `,
  }
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

  const { name, email, phone, service, message, lang = 'en' } = req.body || {}

  if (!name || !email || !phone || !service || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  let logoBase64 = ''
  try {
    const logoBuffer = fs.readFileSync(logoPath)
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch (e) {
    logoBase64 = ''
  }
  const logoHtml = buildEmailLogoHtml(logoBase64)

  const nombre = escapeHtml(name)
  const correo = escapeHtml(email)
  const telefono = escapeHtml(phone)
  const servicio = escapeHtml(service)
  const mensaje = escapeHtml(message).replace(/\n/g, '<br>')
  const confirmation = buildConfirmationEmail({ nombre, servicio, mensaje, lang, logoHtml })

  try {
    await Promise.all([
      resend.emails.send({
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
      }),
      resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL,
        to: email,
        replyTo: process.env.CONTACT_TO_EMAIL,
        subject: confirmation.subject,
        html: confirmation.html,
      }),
    ])

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
