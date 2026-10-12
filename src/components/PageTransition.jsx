import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Cada cambio de pagina: cortina que barre la pantalla + la pagina entra en 3D. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  const expanded = !!window.__cardExpand // llegamos desde una tarjeta que se expandio: sin cortina

  useEffect(() => {
    window.scrollTo(0, 0)
    const o = window.__cardExpand
    if (o) {
      window.__cardExpand = null
      o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 200, fill: 'forwards' }).onfinish = () => o.remove()
      setTimeout(() => o.remove(), 1500)
    }
  }, [pathname])

  return (
    <>
      {!expanded && (
      <div key={'c' + pathname} className="page-curtain" aria-hidden="true">
        <img src="/images/logo-imperial-light.png" alt="" />
      </div>
      )}
      <main key={pathname} className={`page-enter${expanded ? ' from-card' : ''}`}>
        {children}
      </main>
    </>
  )
}
