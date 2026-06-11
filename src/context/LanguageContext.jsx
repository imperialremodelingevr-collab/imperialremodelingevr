import { createContext, useContext, useState } from 'react'

export const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}
