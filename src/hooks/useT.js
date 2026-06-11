import { useLanguage } from '../context/LanguageContext'
import translations from '../i18n/translations'

export function useT() {
  const { lang } = useLanguage()
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key
  return { t, lang }
}
