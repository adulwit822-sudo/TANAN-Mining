'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang } from '@/lib/translations'

type Translation = (typeof translations)[Lang]

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translation
}

const LangContext = createContext<LangContextType>({
  lang: 'th',
  setLang: () => {},
  t: translations.th,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th')

  useEffect(() => {
    const saved = localStorage.getItem('tanan_lang')
    if (saved === 'th' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('tanan_lang', l)
  }

  const value: LangContextType = {
    lang,
    setLang,
    t: translations[lang],
  }

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Toggle button component — drop it anywhere in the nav
export function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,144,42,0.3)', flexShrink: 0 }}>
      {(['th', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
            transition: 'all 0.2s',
            background: lang === l
              ? 'linear-gradient(135deg,#7a4018,#c8902a)'
              : 'rgba(255,255,255,0.05)',
            color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
