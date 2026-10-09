import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Cada cambio de pagina: cortina que barre la pantalla + la pagina entra en 3D. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <div key={'c' + pathname} className="page-curtain" aria-hidden="true" />
      <main key={pathname} className="page-enter">
        {children}
      </main>
    </>
  )
}
