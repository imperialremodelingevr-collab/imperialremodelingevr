import { Link } from 'react-router-dom'
import { useT } from '../../hooks/useT'
import { img } from '../../utils/images'

const CARDS = [
  { to: '/about', n: '01', titleKey: 'navAbout', descKey: 'expAboutP', id: '1c1d1d94-e455-42f8-ac6b-1fe4c74a9b3c', wide: true },
  { to: '/gallery', n: '02', titleKey: 'navGallery', descKey: 'expGalleryP', id: 'ae4f24ce-fad0-4e9b-80b0-694233d81aca' },
  { to: '/reviews', n: '03', titleKey: 'navTesti', descKey: 'expReviewsP', id: 'daa51c47-be2b-45b5-9d8d-54c582dc7afe' },
  { to: '/contact', n: '04', titleKey: 'navContact', descKey: 'expContactP', id: '11677d19-5a3a-4700-b150-c134ac6a32a8', wide: true },
]

/** Entradas 3D a las demas paginas (reusa el estilo de las tarjetas de servicios). */
export default function ExploreSection() {
  const { t } = useT()
  return (
    <section className="services explore" id="explore">
      <div className="section-header">
        <div>
          <div className="eyebrow"><span className="tick" /> <span>{t('expEyebrow')}</span></div>
          <h2>
            <span>{t('expH1')}</span> <span className="red">{t('expH2')}</span>
          </h2>
        </div>
      </div>
      <div className="services-grid reveal stagger">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className={`svc${c.wide ? ' wide' : ''}`}>
            <div className="svc-img" style={{ backgroundImage: `url("${img(c.id)}")` }} />
            <div className="svc-body">
              <div className="svc-top"><span className="svc-num">— {c.n}</span></div>
              <div className="svc-foot">
                <h3><span>{t(c.titleKey)}</span></h3>
                <p>{t(c.descKey)}</p>
                <span className="svc-link"><span>{t('expGo')}</span> <span className="arr">→</span></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
