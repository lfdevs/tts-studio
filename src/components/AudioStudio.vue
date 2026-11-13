<template>
  <v-container class="studio-container py-6 md:py-8">
    <div class="mode-header mb-5">
      <v-avatar :color="mode" rounded="lg" size="52" variant="tonal">
        <v-icon :icon="MODE_ICONS[mode]" size="26" />
      </v-avatar>

      <div>
        <h1 class="text-xl font-bold">{{ t(`modes.${mode}.title`) }}</h1>
        <p class="text-sm opacity-70">{{ t(`modes.${mode}.subtitle`) }}</p>
      </div>
    </div>

    <v-alert
      v-if="!settings.isConfigured"
      class="mb-5"
      color="warning"
      icon="mdi-key-alert-outline"
      :text="t('banner.missingKey')"
      variant="tonal"
    >
      <template #append>
        <v-btn color="warning" size="small" variant="flat" @click="app.openSettings()">
          {{ t('banner.configure') }}
        </v-btn>
      </template>
    </v-alert>

    <v-row>
      <v-col cols="12" md="7">
        <v-card
          class="form-card"
          variant="outlined"
          @keydown.ctrl.enter.prevent="onGenerate"
          @keydown.meta.enter.prevent="onGenerate"
        >
          <v-card-text class="p-5 md:p-6">
            <div class="mb-5">
              <div class="field-label">
                {{ t('form.styleInstruction') }}
                <v-chip density="compact" size="x-small" variant="tonal">{{ t('form.optional') }}</v-chip>
              </div>

              <v-textarea
                v-model="state.instruction"
                auto-grow
                :maxlength="MAX_TEXT_LENGTH"
                :placeholder="t('form.styleInstructionPlaceholder')"
                rows="2"
              />
            </div>

            <div class="mb-5">
              <div class="field-label">{{ t('form.presetVoice') }}</div>
              <v-select v-model="state.voice" item-title="name" item-value="id" :items="voiceItems" />
            </div>

            <div class="mb-5">
              <div class="field-label justify-between">
                <span>{{ t('form.textToSpeak') }} <span class="required-mark">*</span></span>

                <v-btn
                  color="primary"
                  density="compact"
                  prepend-icon="mdi-lightbulb-on-outline"
                  size="small"
                  variant="text"
                  @click="studio.applyExample(mode)"
                >
                  {{ t('form.tryExample') }}
                </v-btn>
              </div>

              <v-textarea
                v-model="state.text"
                auto-grow
                counter
                :maxlength="MAX_TEXT_LENGTH"
                :placeholder="t('form.textPlaceholder')"
                rows="4"
              />
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <v-chip
                class="model-chip font-mono"
                prepend-icon="mdi-cube-outline"
                size="small"
                variant="tonal"
                @click="app.openSettings()"
              >
                {{ settings.models[mode] }}
                <v-tooltip activator="parent" location="bottom">{{ t('form.changeModel') }}</v-tooltip>
              </v-chip>

              <div class="flex items-center gap-2.5">
                <v-btn
                  v-if="state.loading"
                  color="error"
                  prepend-icon="mdi-stop"
                  variant="tonal"
                  @click="studio.cancel(mode)"
                >
                  {{ t('form.cancel') }}
                </v-btn>

                <v-btn
                  color="primary"
                  :disabled="!canGenerate || state.loading"
                  :loading="state.loading"
                  min-width="150"
                  prepend-icon="mdi-waveform"
                  size="large"
                  variant="flat"
                  @click="onGenerate"
                >
                  {{ state.loading ? t('form.generating') : t('form.generate') }}
                </v-btn>
              </div>
            </div>

            <div class="shortcut-hint text-xs opacity-60 mt-3">
              <v-kbd>Ctrl</v-kbd> + <v-kbd>Enter</v-kbd> {{ t('form.shortcutHint') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <AudioResult class="result-sticky" :mode="mode" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  import AudioResult from '@/components/AudioResult.vue'
  import { type AudioMode, MAX_TEXT_LENGTH, MODE_ICONS, PRESET_VOICES } from '@/constants/audio'
  import { useAppStore } from '@/stores/app'
  import { useSettingsStore } from '@/stores/settings'
  import { useStudioStore } from '@/stores/studio'

  const props = defineProps<{ mode: AudioMode }>()

  const { t } = useI18n()
  const app = useAppStore()
  const settings = useSettingsStore()
  const studio = useStudioStore()

  const state = computed(() => studio.modes[props.mode])
  const canGenerate = computed(() => studio.canGenerate(props.mode))
  const voiceItems = computed(() => PRESET_VOICES.map(voice => ({
    ...voice,
    name: voice.id === 'mimo_default' ? t('voices.default') : voice.name,
  })))

  async function onGenerate () {
    await studio.generate(props.mode)
  }
</script>

<style scoped>
  .studio-container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
  }

  .mode-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .form-card {
    border-color: rgba(var(--v-theme-primary), 0.22);
    background: rgba(var(--v-theme-surface), 0.9);
  }

  .model-chip {
    max-width: 100%;
    cursor: pointer;
  }

  .shortcut-hint {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
