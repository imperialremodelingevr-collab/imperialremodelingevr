import { useT } from '../../hooks/useT'
import Mask from '../Mask'
import { PROJECTS, REAL_REVIEWS } from '../../data/projects'

/** Proyectos reales (fotos de obras de Imperial) + resenas verificadas cuando existan (src/data/projects.js). */
export default function TestimonialsSection() {
  const { t, lang } = useT()
  const L = lang === 'es' ? 'es' : 'en'

  return (
    <section className="testi" id="testi">
      <div className="section-header">
        <div>
          <div className="eyebrow">
            <span className="tick" /> <span>{t('testiEyebrow')}</span>
          </div>
          <h2>
            <Mask text={t('testiH1')} /> <Mask text={t('testiH2')} className="red" after={t('testiH1')} />
          </h2>
        </div>
        <p>{t('testiLede')}</p>
      </div>

      <div className="pj-grid reveal stagger">
        {PROJECTS.map((p) => (
          <article key={p.img} className="pj-card">
            <div className="pj-ph">
              <img src={p.img} alt={p.alt[L]} loading="lazy" />
              <span className="pj-tag">{p.tag[L]}</span>
              <span className="pj-real">{t('pjReal')}</span>
            </div>
            <div className="pj-body">
              <h3>{p.title[L]}</h3>
              <p>{p.desc[L]}</p>
            </div>
          </article>
        ))}
      </div>

      {REAL_REVIEWS.length > 0 && (
        <div className="pj-reviews reveal stagger">
          {REAL_REVIEWS.map((r, i) => (
            <figure key={i} className="pj-quote">
              <blockquote>{r.quote[L]}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
