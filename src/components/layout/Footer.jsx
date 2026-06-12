import { useT } from '../../hooks/useT'
import { img } from '../../utils/images'

export default function Footer() {
  const { t } = useT()

  return (
    <footer>
      <div className="fwrap-top">
        <div className="fcol fbrand">
          <img className="logo-img-foot" src="/images/931dd399-a8bb-4c6f-a6e6-68d7c9a3eea0.png" alt="Imperial Remodeling EVR" />
          <p className="ftag">{t('ftrTag')}</p>
          <div className="fsocial">
            <span className="fsocial-lbl">{t('ftrFollow')}</span>
            <div className="fsocial-row">
              <a className="soc" href="https://www.facebook.com/profile.php?id=100086924779856" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" /></svg>
              </a>
              <a className="soc" href="https://www.tiktok.com/@ernestovelez2021" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 7.3a5.3 5.3 0 01-3.6-1.46 5.3 5.3 0 01-1.42-2.64h-2.98v12.06a2.42 2.42 0 11-2.42-2.42c.25 0 .5.04.73.11V9.92a5.45 5.45 0 00-.73-.05A5.45 5.45 0 1014.3 15.3l.0-6.06a8.2 8.2 0 005 1.7V7.3z" /></svg>
              </a>
              <span className="soc soc-soon" aria-label="YouTube coming soon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.77-1.77C19.3 5.13 12 5.13 12 5.13s-7.3 0-8.83.4A2.5 2.5 0 001.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 001.77 1.77c1.53.4 8.83.4 8.83.4s7.3 0 8.83-.4a2.5 2.5 0 001.77-1.77C23 15.2 23 12 23 12zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" /></svg>
                <span className="soon">{t('ftrSoon')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="fcol flinks">
          <div className="fcol-h">{t('ftrExplore')}</div>
          <a href="#services">{t('navServices')}</a>
          <a href="#certified">{t('navCerts')}</a>
          <a href="#featured">{t('ftrFeatured')}</a>
          <a href="#gallery">{t('navGallery')}</a>
          <a href="#testi">{t('navTesti')}</a>
        </div>

        <div className="fcol fcontact">
          <div className="fcol-h">{t('ftrReach')}</div>
          <a href="tel:2145171951" className="fbig">214-517-1951</a>
          <a href="mailto:velez@imperialremodelingevr.com">velez@imperialremodelingevr.com</a>
          <div className="fmeta">{t('ftrHours')}</div>
          <div className="fmeta fdot">{t('ftrOpen')}</div>
        </div>
      </div>

      <div className="fwrap-bottom">
        <div className="ftxt">{t('ftrCopy')}</div>
        <div className="ftxt">{t('ftrServing')}</div>
      </div>
    </footer>
  )
}
