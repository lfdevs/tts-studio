import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { type AudioMode, DEFAULT_BASE_URL, DEFAULT_MODELS } from '@/constants/audio'
import { type AppLocale, detectLocale } from '@/plugins/i18n'

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'tts-studio.settings.v1'

interface StoredSettings {
  apiBaseUrl?: string
  apiKey?: string
  models?: Partial<Record<AudioMode, string>>
  locale?: AppLocale
  theme?: ThemePreference
}

function readStoredSettings (): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSettings) : {}
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const stored = readStoredSettings()

  const apiBaseUrl = ref(stored.apiBaseUrl?.trim() || DEFAULT_BASE_URL)
  const apiKey = ref(stored.apiKey ?? '')
  const models = ref<Record<AudioMode, string>>({
    'speech': stored.models?.speech?.trim() || DEFAULT_MODELS.speech,
    'voice-design': stored.models?.['voice-design']?.trim() || DEFAULT_MODELS['voice-design'],
    'voice-clone': stored.models?.['voice-clone']?.trim() || DEFAULT_MODELS['voice-clone'],
  })
  const locale = ref<AppLocale>(
    stored.locale === 'en' || stored.locale === 'zh-CN' ? stored.locale : detectLocale(),
  )
  const theme = ref<ThemePreference>(
    stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : 'system',
  )

  const isConfigured = computed(() => apiKey.value.trim().length > 0)

  watch([apiBaseUrl, apiKey, models, locale, theme], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      apiBaseUrl: apiBaseUrl.value,
      apiKey: apiKey.value,
      models: models.value,
      locale: locale.value,
      theme: theme.value,
    }))
  }, { deep: true })

  function resetApiDefaults () {
    apiBaseUrl.value = DEFAULT_BASE_URL
    models.value = { ...DEFAULT_MODELS }
  }

  return { apiBaseUrl, apiKey, models, locale, theme, isConfigured, resetApiDefaults }
})
