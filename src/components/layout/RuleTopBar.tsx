import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'

const LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
]

export function RuleTopBar() {
  const { i18n: i18nHook } = useTranslation()
  const currentLang = i18nHook.language

  function switchLang(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  const today = new Intl.DateTimeFormat(
    currentLang === 'zh' ? 'zh-TW' : currentLang === 'en' ? 'en-GB' : 'fr-FR',
    { weekday: 'short', day: 'numeric', month: 'short' }
  ).format(new Date())

  return (
    <div className="rule-top-bar">
      <span className="rule-site-label">Les Arts Paris</span>
      <div className="rule-lang-switcher">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => switchLang(l.code)}
            className={`rule-lang-btn${currentLang === l.code ? ' active' : ''}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <span className="rule-date">{today}</span>
    </div>
  )
}
