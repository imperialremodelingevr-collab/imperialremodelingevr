import { useT } from '../../hooks/useT'
import Mask from '../Mask'
import { img } from '../../utils/images'

const TESTIMONIALS = [
  {
    quoteKey: 'testi1',
    imageId: 'kitchen-white',
    av: 'M',
    nameKey: 'testiName1',
    locKey: 'testiLoc1',
  },
  {
    quoteKey: 'testi2',
    imageId: '1d35663b-cf8e-471c-b3e1-6657e58d7d05',
    av: 'D',
    nameKey: 'testiName2',
    locKey: 'testiLoc2',
  },
  {
    quoteKey: 'testi3',
    imageId: '1d35663b-cf8e-471c-b3e1-6657e58d7d05',
    av: 'R',
    nameKey: 'testiName3',
    locKey: 'testiLoc3',
  },
]

export default function TestimonialsSection() {
  const { t } = useT()

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

      <div className="testi-grid reveal stagger">
        {TESTIMONIALS.map((item) => (
          <article key={item.quoteKey} className="t-card in">
            <div className="quote-mark">&ldquo;</div>
            <div className="stars">★★★★★</div>
            <blockquote>{t(item.quoteKey)}</blockquote>
            <div className="ph">
              <img
                src={img(item.imageId)}
                alt={t(item.nameKey)}
                loading="lazy"
              />
            </div>
            <div className="who">
              <div className="av">{item.av}</div>
              <div>
                <div className="n">{t(item.nameKey)}</div>
                <div className="l">{t(item.locKey)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
