import { useLanguage } from '../context/LanguageContext'
import styles from './Services.module.css'

const t = {
  es: {
    title: 'Nuestros Servicios',
    subtitle: 'Soluciones completas para hogares, multifamiliares y comercios en el Metroplex.',
    items: [
      {
        title: 'Remodelación de Baños',
        desc: 'Diseños modernos con acabados premium y plomería de calidad.',
      },
      {
        title: 'Remodelación de Cocinas',
        desc: 'Cocinas funcionales y elegantes adaptadas a tu estilo de vida.',
      },
      {
        title: 'Pisos Epóxicos',
        desc: 'Superficies resistentes y de alto impacto visual para cualquier espacio.',
      },
      {
        title: 'Pintura',
        desc: 'Acabados impecables interior y exterior con materiales de primera.',
      },
      {
        title: 'Plomería',
        desc: 'Instalación, reparación y actualización de sistemas hidráulicos.',
      },
      {
        title: 'Eléctrico',
        desc: 'Cableado seguro, iluminación y actualizaciones eléctricas.',
      },
    ],
  },
  en: {
    title: 'Our Services',
    subtitle: 'Complete solutions for residential, multifamily, and commercial properties across the Metroplex.',
    items: [
      {
        title: 'Bathroom Remodeling',
        desc: 'Modern designs with premium finishes and quality plumbing.',
      },
      {
        title: 'Kitchen Remodeling',
        desc: 'Functional, elegant kitchens tailored to your lifestyle.',
      },
      {
        title: 'Epoxy Flooring',
        desc: 'Durable, high-impact surfaces for any space.',
      },
      {
        title: 'Painting',
        desc: 'Flawless interior and exterior finishes with top materials.',
      },
      {
        title: 'Plumbing',
        desc: 'Installation, repair, and upgrades for plumbing systems.',
      },
      {
        title: 'Electrical',
        desc: 'Safe wiring, lighting, and electrical upgrades.',
      },
    ],
  },
}

const icons = [
  /* bathroom */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M4 12h16M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5M8 12V7a2 2 0 012-2h4a2 2 0 012 2v5" />
  </svg>,
  /* kitchen */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="8" rx="1" />
    <rect x="3" y="13" width="18" height="8" rx="1" />
  </svg>,
  /* epoxy */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M3 21h18M5 21V9l7-5 7 5v12" />
  </svg>,
  /* painting */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>,
  /* plumbing */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 2v6m0 0c-2 0-4 1.5-4 4v2h8v-2c0-2.5-2-4-4-4zm-6 8v2a6 6 0 0012 0v-2" />
  </svg>,
  /* electrical */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>,
]

export default function Services() {
  const { lang } = useLanguage()

  return (
    <section id="services" className={styles.section}>
      <div className="section-inner">
        <h2 className="section-title">{t[lang].title}</h2>
        <p className="section-subtitle">{t[lang].subtitle}</p>
        <div className={styles.grid}>
          {t[lang].items.map((item, i) => (
            <article key={i} className={styles.card}>
              <div className={styles.icon}>{icons[i]}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
