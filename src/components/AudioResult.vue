<template>
  <v-card class="result-card" :class="{ 'result-card--ready': state.result }" variant="outlined">
    <div class="flex items-center justify-between px-5 pt-4 pb-3">
      <div class="flex items-center gap-2.5">
        <WaveBars :active="state.loading || playing" :bars="5" :color="waveColor" :height="16" />
        <span class="text-sm font-bold">{{ t('result.title') }}</span>
      </div>

      <v-btn
        v-if="state.result"
        :aria-label="t('result.clear')"
        icon="mdi-delete-outline"
        size="small"
        variant="text"
        @click="studio.clearResult(mode)"
      >
        <v-icon icon="mdi-delete-outline" />
        <v-tooltip activator="parent" location="bottom">{{ t('result.clear') }}</v-tooltip>
      </v-btn>
    </div>

    <v-divider />

    <div v-if="state.loading" class="result-body">
      <WaveBars active :bars="9" :color="waveColor" :height="52" />
      <div class="text-sm opacity-70">{{ t('result.generating') }}</div>

      <v-btn
        color="error"
        prepend-icon="mdi-stop"
        size="small"
        variant="tonal"
        @click="studio.cancel(mode)"
      >
        {{ t('form.cancel') }}
      </v-btn>
    </div>

    <div v-else-if="state.result" class="result-body result-body--ready">
      <div>
        <div class="field-label">{{ t('result.textPreview') }}</div>
        <div class="result-text">{{ state.result.text }}</div>
      </div>

      <audio
        class="result-audio"
        controls
        :src="state.result.url"
        @ended="playing = false"
        @pause="playing = false"
        @play="playing = true"
      >
        {{ t('result.noAudioSupport') }}
      </audio>

      <div class="flex flex-wrap gap-2">
        <v-chip class="font-mono" prepend-icon="mdi-cube-outline" size="small" variant="tonal">
          {{ state.result.model }}
        </v-chip>

        <v-chip prepend-icon="mdi-clock-outline" size="small" variant="tonal">
          {{ formattedTime }}
        </v-chip>
      </div>

      <v-btn
        block
        color="primary"
        :download="downloadName"
        :href="state.result.url"
        prepend-icon="mdi-download"
        variant="flat"
      >
        {{ t('result.download') }}
      </v-btn>
    </div>

    <div v-else class="result-body result-empty">
      <v-avatar :color="mode" size="76" variant="tonal">
        <v-icon icon="mdi-microphone-outline" size="34" />
      </v-avatar>

      <div class="text-sm font-bold">{{ t('result.emptyTitle') }}</div>
      <div class="text-xs opacity-60">{{ t('result.emptyHint') }}</div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import type { AudioMode } from '@/constants/audio'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import WaveBars from '@/components/WaveBars.vue'
  import { useStudioStore } from '@/stores/studio'

  const props = defineProps<{ mode: AudioMode }>()

  const { t, locale } = useI18n()
  const studio = useStudioStore()

  const playing = ref(false)

  const state = computed(() => studio.modes[props.mode])
  const waveColor = computed(() => `rgb(var(--v-theme-${props.mode}))`)
  const downloadName = computed(() => `mimo-${props.mode}-${state.value.result?.createdAt ?? 0}.wav`)
  const formattedTime = computed(() => {
    if (!state.value.result) return ''
    return new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(state.value.result.createdAt)
  })

  watch(() => state.value.result?.url, () => {
    playing.value = false
  })
</script>

<style scoped>
  .result-card {
    overflow: hidden;
    border-color: rgba(var(--v-theme-primary), 0.22);
    background: rgba(var(--v-theme-surface), 0.9);
  }

  .result-card--ready {
    border-color: rgba(var(--v-theme-primary), 0.4);
    box-shadow: 0 8px 32px rgba(var(--v-theme-primary), 0.12);
  }

  .result-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 320px;
    padding: 32px 24px;
    text-align: center;
  }

  .result-body--ready {
    align-items: stretch;
    justify-content: flex-start;
    text-align: left;
  }

  .result-text {
    max-height: 160px;
    overflow-y: auto;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(var(--v-theme-surface-variant), 0.55);
    font-size: 0.875rem;
    line-height: 1.7;
  }

  .result-audio {
    width: 100%;
    height: 44px;
  }

  .result-empty {
    gap: 10px;
  }
</style>
