import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useT } from '../hooks/useT'

const EMAIL = 'velez@imperialremodelingevr.com'
const PHONE = '214-517-1951'

const SERVICE_OPTIONS = [
  { value: 'Kitchen', labelKey: 'fOpt1' },
  { value: 'Bathroom', labelKey: 'fOpt2' },
  { value: 'Epoxy', labelKey: 'fOpt3' },
  { value: 'Electrical', labelKey: 'fOpt4' },
  { value: 'Plumbing', labelKey: 'fOpt5' },
  { value: 'Painting', labelKey: 'fOpt6' },
  { value: 'Other', labelKey: 'fOpt7' },
]

export default function Contact() {
  const { lang } = useLanguage()
  const { t } = useT()
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      })
      if (!res.ok) throw new Error('fail')
      setStatus('success')
      setForm({ name: '', phone: '', email: '', service: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const submitLabel =
    status === 'success'
      ? t('fSubmitDone')
      : status === 'sending'
        ? t('fSending')
        : status === 'error'
          ? t('fError')
          : t('fSubmit')

  return (
    <section className="contact" id="contact">
      <div className="section-header">
        <div>
          <div className="eyebrow">
            <span className="tick" /> <span>{t('contactEyebrow')}</span>
          </div>
          <h2>
            <span>{t('contactH1')}</span> <span className="red">{t('contactH2')}</span>
          </h2>
        </div>
        <p>{t('contactLede')}</p>
      </div>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="row-2">
            <div className="field">
              <label>{t('fName')}</label>
              <input type="text" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="field">
              <label>{t('fPhone')}</label>
              <input type="tel" name="phone" value={form.phone} onChange={onChange} required />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t('fEmail')}</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </div>
            <div className="field">
              <label>{t('fService')}</label>
              <select name="service" value={form.service} onChange={onChange} required>
                <option value="">—</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t('fMsg')}</label>
            <textarea name="message" rows={3} value={form.message} onChange={onChange} required />
          </div>
          <button
            type="submit"
            className="submit"
            style={status === 'success' ? { background: '#10b04a' } : undefined}
            disabled={status === 'sending'}
          >
            <span>{submitLabel}</span>
            <span>→</span>
          </button>
        </form>

        <div className="contact-info">
          <a href="tel:2145171951" className="contact-cta-phone">
            <div>
              <div className="l">{t('ciPhoneLab')}</div>
              <div className="num">{PHONE}</div>
            </div>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </a>

          <div className="ci">
            <div className="ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div className="k">{t('ciArea')}</div>
              <div className="v">{t('ciAreaV')}</div>
              <div className="s">{t('ciAreaSub')}</div>
            </div>
          </div>

          <div className="ci">
            <div className="ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <div>
              <div className="k">{t('ciMail')}</div>
              <div className="v">
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
              <div className="s">{t('ciMailSub')}</div>
            </div>
          </div>

          <div className="ci">
            <div className="ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <div>
              <div className="k">{t('ciHours')}</div>
              <div className="v">{t('ciHoursV')}</div>
              <div className="s">{t('ciHoursSub')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
