import { useT } from '../../hooks/useT'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const STATS = [
  { n: '14', labelKey: 'featS1' },
  { n: '2,400', labelKey: 'featS2' },
  { n: <>5<span className="red">·</span>1</>, labelKey: 'featS3' },
]

export default function FeaturedSection() {
  const { t } = useT()

  return (
    <section className="feature" id="featured">
      <div className="feature-grid">
        <div className="feature-media reveal in">
          <div
            className="fm-main"
            style={{ backgroundImage: 'url("/images/11677d19-5a3a-4700-b150-c134ac6a32a8.jpg")' }}
          >
            <span className="fm-tag">{t('featTag')}</span>
          </div>
          <div className="fm-thumbs">
            <div className="fm-th" style={{ backgroundImage: 'url("/images/ae4f24ce-fad0-4e9b-80b0-694233d81aca.jpg")' }} />
            <div className="fm-th" style={{ backgroundImage: 'url("/images/0afb5b75-9406-48fd-abd0-eb19dd1ace16.jpg")' }} />
            <div className="fm-th" style={{ backgroundImage: 'url("/images/e2f8d097-6671-4d63-ad56-99371088ae00.jpg")' }} />
          </div>
        </div>
        <div className="feature-copy">
          <div className="hero-eyebrow">
            <span className="tick" /> <span>{t('featEyebrow')}</span>
          </div>
          <h2>
            <span>{t('featH1')}</span> <span className="red">{t('featH2')}</span>
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
          <button type="button" className="btn-primary magnetic" onClick={() => scrollTo('gallery')}>
            <span>{t('featCta')}</span> <span>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
