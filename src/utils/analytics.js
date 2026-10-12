// Medicion: de donde llegan los clientes y que hacen.
// - Atribucion propia (UTM / referencia): se guarda al primer contacto y viaja con el formulario.
// - Google Analytics 4 es OPCIONAL: solo se activa si el build trae VITE_GA_ID (ej. G-XXXXXXXXXX).
const GA_ID = import.meta.env.VITE_GA_ID
const KEY = 'imp_attr'
const MAX_AGE = 30 * 24 * 3600 * 1000
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']

export function captureAttribution() {
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null')
    const p = new URLSearchParams(location.search)
    const hasNew = PARAMS.some((k) => p.get(k))
    if (old && Date.now() - old.t < MAX_AGE && !hasNew) return
    const d = { t: Date.now(), landing: location.pathname, referrer: document.referrer || '' }
    PARAMS.forEach((k) => p.get(k) && (d[k] = p.get(k).slice(0, 120)))
    localStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function getAttribution() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!d) return {}
    const { t, ...rest } = d
    return rest
  } catch {
    return {}
  }
}

export function initAnalytics() {
  if (!GA_ID || window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false })
}

export function track(name, params = {}) {
  try {
    if (window.gtag) window.gtag('event', name, params)
  } catch {
    /* ignorar */
  }
}

/** Clics importantes (llamar, WhatsApp, correo, botones de cita) sin tocar cada boton. */
export function installClickTracking() {
  const onClick = (e) => {
    const el = e.target.closest && e.target.closest('a,button')
    if (!el) return
    const h = el.getAttribute('href') || ''
    if (h.startsWith('tel:')) track('click_call', { page: location.pathname })
    else if (h.includes('wa.me')) track('click_whatsapp', { page: location.pathname })
    else if (h.startsWith('mailto:')) track('click_email', { page: location.pathname })
    else if (el.classList.contains('btn-primary')) track('cta_click', { label: (el.textContent || '').trim().slice(0, 40), page: location.pathname })
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
