import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { ROUTES, SITE } from '../seo/routes'
import { track } from '../utils/analytics'

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/** Titulo, descripcion, canonical e idioma por pagina; avisa a Analytics (si existe) de cada vista. */
export function useSeo() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()

  useEffect(() => {
    const r = ROUTES[pathname] || ROUTES['/']
    const m = r[lang] || r.en
    const url = SITE + (pathname === '/' ? '/' : pathname)
    document.title = m.title
    document.documentElement.lang = lang === 'es' ? 'es' : 'en'
    setMeta('name', 'description', m.desc)
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.desc)
    setMeta('property', 'og:url', url)
    let c = document.head.querySelector('link[rel="canonical"]')
    if (!c) {
      c = document.createElement('link')
      c.rel = 'canonical'
      document.head.appendChild(c)
    }
    c.href = url
    track('page_view', { page_path: pathname, page_title: m.title, page_location: url })
  }, [pathname, lang])
}
