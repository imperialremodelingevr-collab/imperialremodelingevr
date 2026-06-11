import { useLanguage } from '../context/LanguageContext'
import styles from './Testimonials.module.css'

const t = {
  es: {
    title: 'Testimonios',
    subtitle: 'Lo que dicen nuestros clientes.',
    items: [
      {
        quote: 'Excelente trabajo en la remodelación de nuestra cocina. Profesionales, puntuales y muy limpios.',
        author: 'Cliente — Dallas, TX',
      },
      {
        quote: 'Remodelaron nuestro baño completo. El resultado superó nuestras expectativas. Totalmente recomendados.',
        author: 'Cliente — Plano, TX',
      },
      {
        quote: 'Muy buena comunicación en español e inglés. Precios justos y trabajo de calidad.',
        author: 'Cliente — Fort Worth, TX',
      },
    ],
  },
  en: {
    title: 'Testimonials',
    subtitle: 'What our clients say.',
    items: [
      {
        quote: 'Excellent work on our kitchen remodel. Professional, on time, and very clean.',
        author: 'Client — Dallas, TX',
      },
      {
        quote: 'They remodeled our entire bathroom. The result exceeded our expectations. Highly recommended.',
        author: 'Client — Plano, TX',
      },
      {
        quote: 'Great communication in Spanish and English. Fair pricing and quality work.',
        author: 'Client — Fort Worth, TX',
      },
    ],
  },
}

export default function Testimonials() {
  const { lang } = useLanguage()

  return (
    <section id="testimonials" className={styles.section}>
      <div className="section-inner">
        <h2 className="section-title">{t[lang].title}</h2>
        <p className="section-subtitle">{t[lang].subtitle}</p>
        <div className={styles.grid}>
          {t[lang].items.map((item, i) => (
            <blockquote key={i} className={styles.card}>
              <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
              <p className={styles.quote}>{item.quote}</p>
              <cite className={styles.author}>{item.author}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
