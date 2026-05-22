import en from './en.json'
import hi from './hi.json'
import mr from './mr.json'

export type Lang = 'en' | 'hi' | 'mr'

const translations = { en, hi, mr }

export function t(lang: Lang, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  for (const k of keys) {
    value = value?.[k]
  }
  return value ?? key
}

export const langLabels: Record<Lang, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
}
