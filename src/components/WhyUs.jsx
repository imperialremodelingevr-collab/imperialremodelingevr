import { useLanguage } from '../context/LanguageContext'
import styles from './WhyUs.module.css'

const t = {
  es: {
    title: 'Por Qué Nosotros',
    subtitle: 'Más de 10 años transformando hogares en Dallas y Fort Worth.',
    values: [
      { title: 'Compromiso', desc: 'Cumplimos lo que prometemos, en tiempo y con calidad.' },
      { title: 'Honestidad', desc: 'Precios claros y comunicación directa en cada proyecto.' },
      { title: 'Transparencia', desc: 'Sin sorpresas — sabes qué pasa en cada etapa.' },
      { title: 'Rapidez', desc: 'Ejecución eficiente sin sacrificar el detalle.' },
    ],
    badges: ['Licenciado y Asegurado', 'Bilingüe', '10+ Años', 'Especialistas DFW'],
  },
  en: {
    title: 'Why Us',
    subtitle: 'Over 10 years transforming homes across Dallas and Fort Worth.',
    values: [
      { title: 'Commitment', desc: 'We deliver what we promise — on time and with quality.' },
      { title: 'Honesty', desc: 'Clear pricing and direct communication on every project.' },
      { title: 'Transparency', desc: 'No surprises — you know what happens at every stage.' },
      { title: 'Speed', desc: 'Efficient execution without sacrificing detail.' },
    ],
    badges: ['Licensed & Insured', 'Bilingual', '10+ Years', 'DFW Specialists'],
  },
}

export default function WhyUs() {
  const { lang } = useLanguage()

  return (
    <section id="why-us" className={styles.section}>
      <div className="section-inner">
        <h2 className="section-title">{t[lang].title}</h2>
        <p className="section-subtitle">{t[lang].subtitle}</p>

        <div className={styles.grid}>
          {t[lang].values.map((v, i) => (
            <article key={i} className={styles.card}>
              <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.cardTitle}>{v.title}</h3>
              <p className={styles.cardDesc}>{v.desc}</p>
            </article>
          ))}
        </div>

        <div className={styles.badges}>
          {t[lang].badges.map((badge) => (
            <span key={badge} className={styles.badge}>{badge}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
