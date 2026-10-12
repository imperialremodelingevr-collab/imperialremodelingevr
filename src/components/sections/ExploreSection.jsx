import { Link, useNavigate } from 'react-router-dom'
import { expandNavigate } from '../../utils/expandNavigate'
import Mask from '../Mask'
import { useT } from '../../hooks/useT'
import { img } from '../../utils/images'

const CARDS = [
  { to: '/about', n: '01', titleKey: 'navAbout', descKey: 'expAboutP', id: '1c1d1d94-e455-42f8-ac6b-1fe4c74a9b3c', wide: true },
  { to: '/gallery', n: '02', titleKey: 'navGallery', descKey: 'expGalleryP', id: '575d937b-40e8-4221-ba31-4831e235dcf5' },
  { to: '/reviews', n: '03', titleKey: 'navTesti', descKey: 'expReviewsP', id: 'proj-exterior' },
  { to: '/contact', n: '04', titleKey: 'navContact', descKey: 'expContactP', id: 'a4c9cacf-f7c3-4d4a-b330-a9159c6168b7', wide: true },
]

/** Entradas 3D a las demas paginas (reusa el estilo de las tarjetas de servicios). */
export default function ExploreSection() {
  const { t } = useT()
  const navigate = useNavigate()
  return (
    <section className="services explore" id="explore">
      <div className="section-header">
        <div>
          <div className="eyebrow"><span className="tick" /> <span>{t('expEyebrow')}</span></div>
          <h2>
            <Mask text={t('expH1')} /> <Mask text={t('expH2')} className="red" after={t('expH1')} />
          </h2>
        </div>
      </div>
      <div className="services-grid reveal stagger">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`svc${c.wide ? ' wide' : ''}`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              expandNavigate(e.currentTarget, img(c.id), () => navigate(c.to))
            }}
          >
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
