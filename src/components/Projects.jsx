import { useLanguage } from '../context/LanguageContext'
import styles from './Projects.module.css'

const t = {
  es: {
    title: 'Proyectos',
    subtitle: 'Una muestra de nuestro trabajo en el Metroplex.',
    placeholder: 'Foto próximamente',
  },
  en: {
    title: 'Projects',
    subtitle: 'A showcase of our work across the Metroplex.',
    placeholder: 'Photo coming soon',
  },
}

// TODO: Replace with real project photos
const PLACEHOLDER_COUNT = 6

export default function Projects() {
  const { lang } = useLanguage()

  return (
    <section id="projects" className={styles.section}>
      <div className="section-inner">
        <h2 className="section-title">{t[lang].title}</h2>
        <p className="section-subtitle">{t[lang].subtitle}</p>
        <div className={styles.grid}>
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div key={i} className={styles.card}>
              <span className={styles.placeholder}>{t[lang].placeholder}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
