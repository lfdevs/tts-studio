<template>
  <v-app>
    <div aria-hidden="true" class="studio-bg" />

    <v-app-bar class="studio-app-bar" :elevation="0" extension-height="48" height="64">
      <div class="flex items-center gap-3 px-4">
        <WaveBars :bars="5" class="brand-wave" :height="22" />
        <span class="brand-title">{{ t('app.title') }}</span>
        <span class="hidden md:inline font-mono text-xs opacity-60">{{ t('app.tagline') }}</span>
      </div>

      <v-spacer />

      <div class="flex items-center gap-1 px-2">
        <v-menu location="bottom">
          <template #activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" :aria-label="t('language.label')" icon="mdi-translate" variant="text">
              <v-icon icon="mdi-translate" />
              <v-tooltip activator="parent" location="bottom">{{ t('language.label') }}</v-tooltip>
            </v-btn>
          </template>

          <v-list density="compact" min-width="160">
            <v-list-item
              v-for="option in localeOptions"
              :key="option.value"
              :active="settings.locale === option.value"
              @click="settings.locale = option.value"
            >
              <v-list-item-title>{{ option.label }}</v-list-item-title>

              <template #append>
                <v-icon v-if="settings.locale === option.value" icon="mdi-check" size="small" />
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu location="bottom">
          <template #activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" :aria-label="t('theme.label')" :icon="themeIcon" variant="text">
              <v-icon :icon="themeIcon" />
              <v-tooltip activator="parent" location="bottom">{{ t('theme.label') }}</v-tooltip>
            </v-btn>
          </template>

          <v-list density="compact" min-width="160">
            <v-list-item
              v-for="option in themeOptions"
              :key="option.value"
              :active="settings.theme === option.value"
              @click="settings.theme = option.value"
            >
              <template #prepend>
                <v-icon :icon="option.icon" size="small" />
              </template>

              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn :aria-label="t('settings.open')" icon="mdi-cog-outline" variant="text" @click="app.openSettings()">
          <v-icon icon="mdi-cog-outline" />
          <v-tooltip activator="parent" location="bottom">{{ t('settings.open') }}</v-tooltip>
        </v-btn>
      </div>

      <template #extension>
        <v-tabs
          align-tabs="center"
          bg-color="transparent"
          :color="currentMode"
          height="48"
          :model-value="currentMode"
          show-arrows
        >
          <v-tab prepend-icon="mdi-waveform" :to="{ name: 'speech' }" value="speech">
            {{ t('nav.speech') }}
          </v-tab>

          <v-tab prepend-icon="mdi-auto-fix" :to="{ name: 'voice-design' }" value="voice-design">
            {{ t('nav.voice-design') }}
          </v-tab>

          <v-tab prepend-icon="mdi-content-copy" :to="{ name: 'voice-clone' }" value="voice-clone">
            {{ t('nav.voice-clone') }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="fade-slide">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <SettingsDialog />

    <v-snackbar
      :key="app.snackbar.text"
      v-model="app.snackbar.show"
      :color="app.snackbar.color"
      location="bottom"
      rounded="pill"
      :timeout="4000"
    >
      {{ app.snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
  import type { AudioMode } from '@/constants/audio'
  import type { AppLocale } from '@/plugins/i18n'
  import { computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useLocale, useTheme } from 'vuetify'
  import SettingsDialog from '@/components/SettingsDialog.vue'
  import WaveBars from '@/components/WaveBars.vue'
  import { useAppStore } from '@/stores/app'
  import { type ThemePreference, useSettingsStore } from '@/stores/settings'

  const { t, locale } = useI18n()
  const route = useRoute()
  const theme = useTheme()
  const vuetifyLocale = useLocale()
  const app = useAppStore()
  const settings = useSettingsStore()

  const currentMode = computed<AudioMode>(() => {
    const name = route.name
    return name === 'voice-design' || name === 'voice-clone' ? name : 'speech'
  })

  const themeIcon = computed(() => {
    if (settings.theme === 'light') return 'mdi-white-balance-sunny'
    if (settings.theme === 'dark') return 'mdi-weather-night'
    return 'mdi-circle-half-full'
  })

  const localeOptions: { value: AppLocale, label: string }[] = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en', label: 'English' },
  ]

  const themeOptions = computed<{ value: ThemePreference, icon: string, label: string }[]>(() => [
    { value: 'system', icon: 'mdi-circle-half-full', label: t('theme.system') },
    { value: 'light', icon: 'mdi-white-balance-sunny', label: t('theme.light') },
    { value: 'dark', icon: 'mdi-weather-night', label: t('theme.dark') },
  ])

  watch(() => settings.theme, value => {
    theme.change(value)
  }, { immediate: true })

  watch(() => settings.locale, value => {
    locale.value = value
    vuetifyLocale.current.value = value === 'zh-CN' ? 'zhHans' : 'en'
    document.documentElement.lang = value
  }, { immediate: true })
</script>
