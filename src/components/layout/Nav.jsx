import { useT } from '../../hooks/useT'
import { img } from '../../utils/images'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Nav() {
  const { t } = useT()

  return (
    <nav className="nav">
      <a href="#top" className="nav-logo">
        <img className="logo-img-nav" src="/images/8bf2961a-6fbb-4139-8f29-55815197405d.png" alt="Imperial Remodeling EVR" />
      </a>
      <div className="nav-links">
        <a href="#services">{t('navServices')}</a>
        <a href="#about">{t('navAbout')}</a>
        <a href="#certified">{t('navCerts')}</a>
        <a href="#featured">{t('ftrFeatured')}</a>
        <a href="#gallery">{t('navGallery')}</a>
        <a href="#testi">{t('navTesti')}</a>
        <a href="#contact">{t('navContact')}</a>
      </div>
      <button type="button" className="nav-cta" onClick={() => scrollTo('contact')}>
        <span>{t('freeEstimate')}</span>
        <span className="arr">→</span>
      </button>
    </nav>
  )
}
