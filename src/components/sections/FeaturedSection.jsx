import { useNavigate } from 'react-router-dom'
import Mask from '../Mask'
import { useT } from '../../hooks/useT'

const STATS = [
  { n: '14', labelKey: 'featS1' },
  { n: '2,400', labelKey: 'featS2' },
  { n: <>5<span className="red">·</span>1</>, labelKey: 'featS3' },
]

export default function FeaturedSection() {
  const { t } = useT()
  const navigate = useNavigate()

  return (
    <section className="feature" id="featured">
      <div className="feature-grid">
        <div className="feature-media reveal in">
          <div
            className="fm-main"
            style={{ backgroundImage: 'url("/images/kitchen-white.jpg")' }}
          >
            <span className="fm-tag">{t('featTag')}</span>
          </div>
          <div className="fm-thumbs">
            <div className="fm-th" style={{ backgroundImage: 'url("/images/1d35663b-cf8e-471c-b3e1-6657e58d7d05.jpg")' }} />
            <div className="fm-th" style={{ backgroundImage: 'url("/images/0afb5b75-9406-48fd-abd0-eb19dd1ace16.jpg")' }} />
            <div className="fm-th" style={{ backgroundImage: 'url("/images/575d937b-40e8-4221-ba31-4831e235dcf5.jpg")' }} />
          </div>
        </div>
        <div className="feature-copy">
          <div className="hero-eyebrow">
            <span className="tick" /> <span>{t('featEyebrow')}</span>
          </div>
          <h2>
            <Mask text={t('featH1')} /> <Mask text={t('featH2')} className="red" after={t('featH1')} />
          </h2>
          <p className="lead">{t('featLead')}</p>
          <div className="feature-stats">
            {STATS.map((stat) => (
              <div key={stat.labelKey} className="fs">
                <div className="fs-n">{stat.n}</div>
                <div className="fs-l">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary magnetic" onClick={() => navigate('/gallery')}>
            <span>{t('featCta')}</span> <span>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
