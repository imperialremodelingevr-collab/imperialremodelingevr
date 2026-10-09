import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useT } from '../hooks/useT'

const LINKS = [
  { to: '/services', key: 'navServices' },
  { to: '/about', key: 'navAbout' },
  { to: '/gallery', key: 'navGallery' },
  { to: '/reviews', key: 'navTesti' },
  { to: '/contact', key: 'navContact' },
]

export default function Nav() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <img className="logo-img-nav" src="/images/8bf2961a-6fbb-4139-8f29-55815197405d.png" alt="Imperial Remodeling EVR" />
      </Link>
      <div className="nav-links">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {t(l.key)}
          </NavLink>
        ))}
      </div>
      <Link to="/contact" className="nav-cta">
        <span>{t('freeEstimate')}</span>
        <span className="arr">→</span>
      </Link>
      <button
        type="button"
        className={`nav-burger${open ? ' open' : ''}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>
      <div className={`nav-drawer${open ? ' open' : ''}`}>
        <Link to="/">{t('navHome')}</Link>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {t(l.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
