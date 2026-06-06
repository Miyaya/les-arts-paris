import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'
import zh from './locales/zh.json'

const saved = localStorage.getItem('lang')
const browserLang = navigator.language.split('-')[0]
const defaultLang = saved ?? (['fr', 'en', 'zh'].includes(browserLang) ? browserLang : 'fr')

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en }, zh: { translation: zh } },
  lng: defaultLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
