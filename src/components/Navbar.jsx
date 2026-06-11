import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import styles from './Navbar.module.css'

const t = {
  es: {
    home: 'Inicio',
    services: 'Servicios',
    whyUs: 'Por Qué Nosotros',
    projects: 'Proyectos',
    contact: 'Contacto',
  },
  en: {
    home: 'Home',
    services: 'Services',
    whyUs: 'Why Us',
    projects: 'Projects',
    contact: 'Contact',
  },
}

const links = [
  { href: '#home', key: 'home' },
  { href: '#services', key: 'services' },
  { href: '#why-us', key: 'whyUs' },
  { href: '#projects', key: 'projects' },
  { href: '#contact', key: 'contact' },
]

export default function Navbar() {
  const { lang, toggle } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const toggleMenu = () => {
    setMenuOpen((open) => {
      document.body.style.overflow = open ? '' : 'hidden'
      return !open
    })
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logo} onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="Imperial Remodeling EVR"
            className={styles.logoImg}
            onError={(e) => { e.currentTarget.src = '/logo.svg' }}
          />
        </a>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.links}>
            {links.map(({ href, key }) => (
              <li key={key}>
                <a href={href} onClick={closeMenu}>{t[lang][key]}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.langToggle} onClick={toggle} aria-label="Toggle language">
            <span className={lang === 'es' ? styles.langActive : ''}>ES</span>
            <span className={styles.langSep}>|</span>
            <span className={lang === 'en' ? styles.langActive : ''}>EN</span>
          </button>

          <button
            type="button"
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
