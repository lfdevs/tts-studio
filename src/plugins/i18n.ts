import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'
import zhCN from '@/locales/zh-CN.json'

export type AppLocale = 'zh-CN' | 'en'

export function detectLocale (): AppLocale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    en,
  },
})

export default i18n
