import { useLanguage } from '../../context/LanguageContext'
import { useT } from '../../hooks/useT'

const PHONE = '214-517-1951'

export default function TopBar() {
  const { lang, setLang } = useLanguage()
  const { t } = useT()

  return (
    <div className="top-bar">
      <a href="tel:2145171951" className="phone">
        <span className="t">{t('callNow')}</span>
        <strong>📞 {PHONE}</strong>
      </a>
      <div className="stars">
        <span className="star-rating" />
        <span>{t('topRated')}</span>
      </div>
      <div className="lang-toggle">
        <button
          type="button"
          className={`lang ${lang === 'es' ? 'active' : ''}`}
          onClick={() => setLang('es')}
        >
          ES
        </button>
        <button
          type="button"
          className={`lang ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>
    </div>
  )
}
