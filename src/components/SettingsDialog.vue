<template>
  <v-dialog v-model="app.settingsOpen" max-width="640" scrollable>
    <v-card prepend-icon="mdi-cog-outline" :title="t('settings.title')">
      <template #append>
        <v-btn
          :aria-label="t('settings.close')"
          icon="mdi-close"
          variant="text"
          @click="app.settingsOpen = false"
        />
      </template>

      <v-divider />

      <v-card-text class="pt-4">
        <div class="section-label">{{ t('settings.apiSection') }}</div>

        <v-text-field
          v-model="draft.apiBaseUrl"
          class="mb-4 font-mono"
          :hint="t('settings.baseUrlHint')"
          :label="t('settings.baseUrl')"
          persistent-hint
        />

        <v-text-field
          v-model="draft.apiKey"
          autocomplete="off"
          class="mb-4"
          :hint="t('settings.apiKeyHint')"
          :label="t('settings.apiKey')"
          persistent-hint
          :placeholder="t('settings.apiKeyPlaceholder')"
          :type="showKey ? 'text' : 'password'"
        >
          <template #append-inner>
            <v-btn
              :aria-label="showKey ? t('settings.hideKey') : t('settings.showKey')"
              :icon="showKey ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              size="small"
              variant="text"
              @click="showKey = !showKey"
            />
          </template>
        </v-text-field>

        <div class="section-label mt-2">{{ t('settings.modelsSection') }}</div>

        <v-text-field
          v-for="mode in AUDIO_MODES"
          :key="mode"
          v-model="draft.models[mode]"
          class="mb-3 font-mono"
          :label="t(`settings.model.${mode}`)"
        />

        <v-alert
          density="compact"
          icon="mdi-shield-check-outline"
          :text="t('settings.privacy')"
          type="info"
          variant="tonal"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-btn variant="text" @click="restoreDefaults">{{ t('settings.reset') }}</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="app.settingsOpen = false">{{ t('settings.cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" @click="save">{{ t('settings.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { AUDIO_MODES, type AudioMode, DEFAULT_BASE_URL, DEFAULT_MODELS } from '@/constants/audio'
  import { useAppStore } from '@/stores/app'
  import { useSettingsStore } from '@/stores/settings'

  const { t } = useI18n()
  const app = useAppStore()
  const settings = useSettingsStore()

  const showKey = ref(false)
  const draft = reactive({
    apiBaseUrl: '',
    apiKey: '',
    models: { ...DEFAULT_MODELS } as Record<AudioMode, string>,
  })

  watch(() => app.settingsOpen, open => {
    if (open) {
      draft.apiBaseUrl = settings.apiBaseUrl
      draft.apiKey = settings.apiKey
      draft.models = { ...settings.models }
      showKey.value = false
    }
  })

  function restoreDefaults () {
    draft.apiBaseUrl = DEFAULT_BASE_URL
    draft.models = { ...DEFAULT_MODELS }
  }

  function save () {
    const baseUrl = draft.apiBaseUrl.trim().replace(/\/+$/, '')
    let valid = false
    try {
      const url = new URL(baseUrl)
      valid = url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      valid = false
    }
    if (!valid) {
      app.notify(t('settings.invalidBaseUrl'))
      return
    }

    for (const mode of AUDIO_MODES) {
      if (!draft.models[mode].trim()) {
        app.notify(t('settings.modelRequired'))
        return
      }
    }

    settings.apiBaseUrl = baseUrl
    settings.apiKey = draft.apiKey.trim()
    settings.models = {
      'speech': draft.models.speech.trim(),
      'voice-design': draft.models['voice-design'].trim(),
      'voice-clone': draft.models['voice-clone'].trim(),
    }
    app.notify(t('settings.saved'), 'success')
    app.settingsOpen = false
  }
</script>
