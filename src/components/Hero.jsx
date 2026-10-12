import { useNavigate } from 'react-router-dom'
import { useT } from '../hooks/useT'

export default function Hero() {
  const { t } = useT()
  const navigate = useNavigate()

  return (
    <section className="hero hero-v2" id="top">
      <div className="hv-img" role="img" aria-label="Imperial Remodeling EVR" />
      <div className="hv-shade" />
      <div className="hv-content">
        <h1 className="hv-logo-wrap">
          <img className="hv-logo" src="/images/logo-imperial-dark.png" alt="Imperial Remodeling EVR" />
        </h1>
        <div className="hv-cta">
          <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
            <span>{t('freeEstimate')}</span>
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/gallery')}>
            <span>{t('ctaWork')}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
